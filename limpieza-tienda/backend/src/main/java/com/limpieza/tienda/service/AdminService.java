package com.limpieza.tienda.service;

import com.limpieza.tienda.dto.CategoriaDto;
import com.limpieza.tienda.dto.CategoriaRequest;
import com.limpieza.tienda.dto.PedidoEstadoRequest;
import com.limpieza.tienda.dto.PedidoItemResponse;
import com.limpieza.tienda.dto.PedidoResponse;
import com.limpieza.tienda.dto.ProductoDto;
import com.limpieza.tienda.dto.ProductoUpsertRequest;
import com.limpieza.tienda.dto.VarianteUpsertRequest;
import com.limpieza.tienda.exception.PeticionInvalidaException;
import com.limpieza.tienda.exception.RecursoNoEncontradoException;
import com.limpieza.tienda.model.Categoria;
import com.limpieza.tienda.model.EstadoPedido;
import com.limpieza.tienda.model.Pedido;
import com.limpieza.tienda.model.Producto;
import com.limpieza.tienda.model.Variante;
import com.limpieza.tienda.repository.CategoriaRepository;
import com.limpieza.tienda.repository.PedidoItemRepository;
import com.limpieza.tienda.repository.PedidoRepository;
import com.limpieza.tienda.repository.ProductoRepository;
import com.limpieza.tienda.repository.VarianteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class AdminService {

    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;
    private final VarianteRepository varianteRepository;
    private final PedidoRepository pedidoRepository;
    private final PedidoItemRepository pedidoItemRepository;
    private final ImageStorageService imageStorage;

    public AdminService(CategoriaRepository categoriaRepository,
                        ProductoRepository productoRepository,
                        VarianteRepository varianteRepository,
                        PedidoRepository pedidoRepository,
                        PedidoItemRepository pedidoItemRepository,
                        ImageStorageService imageStorage) {
        this.categoriaRepository = categoriaRepository;
        this.productoRepository = productoRepository;
        this.varianteRepository = varianteRepository;
        this.pedidoRepository = pedidoRepository;
        this.pedidoItemRepository = pedidoItemRepository;
        this.imageStorage = imageStorage;
    }

    // ---------------- Categorías ----------------

    public List<CategoriaDto> listarCategorias() {
        return categoriaRepository.findAllByOrderByOrdenAsc().stream().map(CategoriaDto::from).toList();
    }

    public CategoriaDto crearCategoria(CategoriaRequest request) {
        Categoria categoria = new Categoria();
        aplicarCategoria(categoria, request, null);
        return CategoriaDto.from(categoriaRepository.save(categoria));
    }

    public CategoriaDto actualizarCategoria(Long id, CategoriaRequest request) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría no encontrada: " + id));
        aplicarCategoria(categoria, request, id);
        return CategoriaDto.from(categoriaRepository.save(categoria));
    }

    public void eliminarCategoria(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría no encontrada: " + id));
        if (productoRepository.countByCategoriaId(id) > 0) {
            throw new PeticionInvalidaException(
                    "No se puede eliminar la categoría «" + categoria.getNombre() + "»: tiene productos asociados.");
        }
        categoriaRepository.delete(categoria);
    }

    private void aplicarCategoria(Categoria c, CategoriaRequest r, Long id) {
        c.setNombre(r.nombre().trim());
        String slug = (r.slug() == null || r.slug().isBlank()) ? SlugUtil.slugify(r.nombre()) : r.slug().trim();
        c.setSlug(slugUnicoCategoria(slug, id));
        c.setIcono(r.icono());
        c.setOrden(r.orden() != null ? r.orden() : 0);
        c.setActiva(r.activa() != null ? r.activa() : true);
        c.setDestacada(r.destacada() != null ? r.destacada() : false);
    }

    private String slugUnicoCategoria(String base, Long id) {
        String slug = base;
        int n = 2;
        while (true) {
            var existente = categoriaRepository.findBySlug(slug);
            if (existente.isEmpty() || existente.get().getId().equals(id)) {
                return slug;
            }
            slug = base + "-" + n++;
        }
    }

    // ---------------- Productos ----------------

    public List<ProductoDto> listarProductos() {
        return productoRepository.findAllConVariantes().stream().map(ProductoDto::from).toList();
    }

    public ProductoDto crearProducto(ProductoUpsertRequest request) {
        Producto producto = new Producto();
        aplicarProducto(producto, request, null);
        producto = productoRepository.save(producto);
        reemplazarVariantes(producto, request.variantes());
        return ProductoDto.from(producto);
    }

    public ProductoDto actualizarProducto(Long id, ProductoUpsertRequest request) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado: " + id));
        aplicarProducto(producto, request, id);
        producto = productoRepository.save(producto);
        reemplazarVariantes(producto, request.variantes());
        return ProductoDto.from(producto);
    }

    public void eliminarProducto(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado: " + id));
        imageStorage.eliminar(producto.getImagenUrl());
        productoRepository.delete(producto);
    }

    public long vaciarProductos() {
        long total = productoRepository.count();
        varianteRepository.deleteAll();
        productoRepository.deleteAll();
        imageStorage.eliminarTodas();
        return total;
    }

    public String subirImagen(MultipartFile imagen) {
        return imageStorage.guardar(imagen);
    }

    private void aplicarProducto(Producto p, ProductoUpsertRequest r, Long id) {
        Categoria categoria = categoriaRepository.findById(r.categoriaId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría no encontrada: " + r.categoriaId()));
        p.setCategoria(categoria);
        p.setNombre(r.nombre().trim());
        p.setSlug(slugUnicoProducto(SlugUtil.slugify(r.nombre()), id));
        p.setDescripcion(r.descripcion());
        p.setImagenUrl(r.imagenUrl().trim());
        p.setDestacado(r.destacado() != null ? r.destacado() : false);
        p.setActivo(r.activo() != null ? r.activo() : true);
    }

    private String slugUnicoProducto(String base, Long id) {
        String slug = base;
        int n = 2;
        while (true) {
            var existente = productoRepository.findBySlug(slug);
            if (existente.isEmpty() || existente.get().getId().equals(id)) {
                return slug;
            }
            slug = base + "-" + n++;
        }
    }

    private void reemplazarVariantes(Producto producto, List<VarianteUpsertRequest> variantesReq) {
        List<Variante> actuales = varianteRepository.findByProductoIdOrderByOrdenAsc(producto.getId());
        if (actuales != null && !actuales.isEmpty()) {
            varianteRepository.deleteAllInBatch(actuales);
            varianteRepository.flush(); // Elimina de inmediato antes del INSERT para no violar uq_variantes_producto_presentacion
        }

        List<Variante> nuevas = new ArrayList<>();
        int orden = 1;
        for (VarianteUpsertRequest vr : variantesReq) {
            Variante v = new Variante();
            v.setProducto(producto);
            v.setPresentacion(vr.presentacion().trim());
            v.setPrecio(vr.precio());
            v.setPrecioOferta(vr.precioOferta());
            v.setStock(vr.stock() != null ? vr.stock() : 0);
            v.setActiva(vr.activa() != null ? vr.activa() : true);
            v.setOrden(vr.orden() != null ? vr.orden() : orden++);
            nuevas.add(v);
        }
        varianteRepository.saveAll(nuevas);
        varianteRepository.flush();
        producto.setVariantes(nuevas);
    }

    // ---------------- Pedidos ----------------

    public List<PedidoResponse> listarPedidosConItems() {
        return pedidoRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(p -> PedidoResponse.from(p,
                        pedidoItemRepository.findByPedidoId(p.getId()).stream()
                                .map(PedidoItemResponse::from).toList(),
                        null))
                .toList();
    }

    public Pedido cambiarEstado(Long id, PedidoEstadoRequest request) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido no encontrado: " + id));
        try {
            pedido.setEstado(EstadoPedido.valueOf(request.estado()));
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new PeticionInvalidaException("Estado inválido: " + request.estado());
        }
        return pedidoRepository.save(pedido);
    }
}
