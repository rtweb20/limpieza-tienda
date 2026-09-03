package com.limpieza.tienda.service;

import com.limpieza.tienda.dto.CargaProductoResponse;
import com.limpieza.tienda.dto.ProductoDto;
import com.limpieza.tienda.exception.PeticionInvalidaException;
import com.limpieza.tienda.exception.RecursoNoEncontradoException;
import com.limpieza.tienda.model.Categoria;
import com.limpieza.tienda.model.Producto;
import com.limpieza.tienda.model.Variante;
import com.limpieza.tienda.repository.CategoriaRepository;
import com.limpieza.tienda.repository.ProductoRepository;
import com.limpieza.tienda.repository.VarianteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Carga de productos con lector de código de barras (USB/Bluetooth).
 *
 * <p>Regla de negocio (upsert):
 * <ul>
 *   <li>Si el código de barras <b>no existe</b> → crea el producto con una
 *       variante "Unidad" (precio + stock).</li>
 *   <li>Si <b>ya existe</b> → actualiza nombre/descripción/categoría/precio y
 *       <b>suma</b> el stock escaneado al existente (típico de reposición).</li>
 *   <li>Si se sube foto, se guarda con nombre único y se reemplaza la anterior.</li>
 * </ul>
 */
@Service
@Transactional
public class CargaProductoService {

    /** Imagen por defecto cuando el producto se carga sin foto. */
    private static final String IMAGEN_DEFAULT =
            "https://placehold.co/600x600/EFE6D4/6B5130?text=Aroma+a+Limpio";

    private final ProductoRepository productoRepository;
    private final VarianteRepository varianteRepository;
    private final CategoriaRepository categoriaRepository;
    private final ImageStorageService imageStorage;

    public CargaProductoService(ProductoRepository productoRepository,
                                VarianteRepository varianteRepository,
                                CategoriaRepository categoriaRepository,
                                ImageStorageService imageStorage) {
        this.productoRepository = productoRepository;
        this.varianteRepository = varianteRepository;
        this.categoriaRepository = categoriaRepository;
        this.imageStorage = imageStorage;
    }

    /**
     * Procesa una lectura del lector de código de barras (multipart/form-data).
     */
    public CargaProductoResponse cargar(String codigoBarras, String nombre, BigDecimal precio,
                                        Integer stock, Long categoriaId, String descripcion,
                                        MultipartFile imagen) {

        // ------------------- Validaciones básicas -------------------
        if (codigoBarras == null || codigoBarras.isBlank()) {
            throw new PeticionInvalidaException("El código de barras es obligatorio.");
        }
        if (nombre == null || nombre.isBlank()) {
            throw new PeticionInvalidaException("El nombre del producto es obligatorio.");
        }
        if (precio == null || precio.signum() < 0) {
            throw new PeticionInvalidaException("El precio debe ser un número mayor o igual a 0.");
        }
        if (stock == null || stock < 0) {
            throw new PeticionInvalidaException("El stock debe ser un número mayor o igual a 0.");
        }

        codigoBarras = codigoBarras.trim();
        Categoria categoria = categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría no encontrada: " + categoriaId));

        Optional<Producto> existente = productoRepository.findByCodigoBarras(codigoBarras);
        Producto producto;
        Variante variante;
        String accion;

        if (existente.isEmpty()) {
            // ============ NUEVO producto ============
            accion = "CREADO";

            producto = new Producto();
            producto.setCodigoBarras(codigoBarras);
            producto.setNombre(nombre.trim());
            producto.setSlug(slugUnico(SlugUtil.slugify(nombre), null));
            producto.setDescripcion(descripcion);
            producto.setCategoria(categoria);
            producto.setDestacado(false);
            producto.setActivo(true);

            String ruta = imageStorage.guardar(imagen);
            producto.setImagenUrl(ruta != null ? ruta : IMAGEN_DEFAULT);
            producto = productoRepository.save(producto);

            variante = new Variante();
            variante.setProducto(producto);
            variante.setPresentacion("Unidad");
            variante.setPrecio(precio);
            variante.setPrecioOferta(null);
            variante.setStock(stock);
            variante.setActiva(true);
            variante.setOrden(1);
            variante = varianteRepository.save(variante);

        } else {
            // ============ EXISTENTE: actualizar + sumar stock ============
            accion = "ACTUALIZADO";

            producto = existente.get();
            producto.setNombre(nombre.trim());
            producto.setDescripcion(descripcion);
            producto.setCategoria(categoria);

            // Si viene foto nueva, se guarda y se borra la anterior.
            if (imagen != null && !imagen.isEmpty()) {
                String ruta = imageStorage.guardar(imagen);
                imageStorage.eliminar(producto.getImagenUrl());
                producto.setImagenUrl(ruta);
            }
            producto = productoRepository.save(producto);

            // Precio/stock viven en la variante. Sumamos stock (reposición).
            List<Variante> variantes = varianteRepository.findByProductoIdOrderByOrdenAsc(producto.getId());
            variante = variantes.isEmpty() ? null : variantes.get(0);
            if (variante == null) {
                variante = new Variante();
                variante.setProducto(producto);
                variante.setPresentacion("Unidad");
                variante.setPrecioOferta(null);
                variante.setActiva(true);
                variante.setOrden(1);
                variante.setPrecio(precio);
                variante.setStock(stock);
            } else {
                variante.setPrecio(precio);
                variante.setStock(variante.getStock() + stock);
            }
            variante = varianteRepository.save(variante);
        }

        return new CargaProductoResponse(
                producto.getId(),
                producto.getCodigoBarras(),
                producto.getNombre(),
                variante.getPrecio(),
                variante.getStock(),
                producto.getImagenUrl(),
                accion,
                accion.equals("CREADO")
                        ? "Producto creado con stock " + variante.getStock()
                        : "Producto actualizado — stock total: " + variante.getStock());
    }

    /** Busca un producto por código de barras (para precargar el formulario). */
    @Transactional(readOnly = true)
    public ProductoDto buscarPorCodigo(String codigoBarras) {
        Producto producto = productoRepository.findByCodigoBarras(codigoBarras.trim())
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe un producto con el código: " + codigoBarras));
        return ProductoDto.from(producto);
    }

    /** Genera un slug único para la URL del producto. */
    private String slugUnico(String base, Long id) {
        String slug = base;
        int n = 2;
        while (true) {
            Optional<Producto> existente = productoRepository.findBySlug(slug);
            if (existente.isEmpty() || existente.get().getId().equals(id)) {
                return slug;
            }
            slug = base + "-" + n++;
        }
    }
}
