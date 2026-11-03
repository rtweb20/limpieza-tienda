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
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

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
        String nombreNuevo = r.nombre().trim();
        p.setCategoria(categoria);
        p.setNombre(nombreNuevo);

        // Si el producto ya existe y ya tiene slug, lo conservamos intacto para no
        // romper enlaces ni hacer que data.sql duplique productos precargados al reiniciar.
        if (id == null || p.getSlug() == null || p.getSlug().isBlank()) {
            p.setSlug(slugUnicoProducto(SlugUtil.slugify(nombreNuevo), id));
        }

        p.setDescripcion(r.descripcion());
        p.setImagenUrl(r.imagenUrl().trim());
        p.setDestacado(r.destacado() != null ? r.destacado() : false);
        p.setActivo(r.activo() != null ? r.activo() : true);

        if (r.codigoBarras() != null) {
            String codigo = normalizarCodigoBarras(r.codigoBarras());
            if (codigo != null) {
                productoRepository.findByCodigoBarras(codigo).ifPresent(otro -> {
                    if (id == null || !otro.getId().equals(id)) {
                        throw new PeticionInvalidaException(
                                "El código de barras «" + codigo + "» ya está asignado al producto «"
                                        + otro.getNombre() + "».");
                    }
                });
            }
            p.setCodigoBarras(codigo);
        }
    }

    /**
     * Normaliza el código de barras igual que CargaProductoService:
     * un UPC-A de 12 dígitos equivale al EAN-13 con un 0 delante.
     */
    private String normalizarCodigoBarras(String codigo) {
        if (codigo == null) {
            return null;
        }
        String limpio = codigo.trim();
        if (limpio.isEmpty()) {
            return null;
        }
        if (limpio.matches("\\d{12}")) {
            return "0" + limpio;
        }
        return limpio;
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
        if (actuales == null) {
            actuales = List.of();
        }

        Map<Long, Variante> porId = new HashMap<>();
        for (Variante actual : actuales) {
            if (actual.getId() != null) {
                porId.put(actual.getId(), actual);
            }
        }

        // Emparejamos cada fila enviada con su variante existente (por id o, si no vino id,
        // por nombre de presentación) para conservar sus IDs y no perder referencias en
        // ventas/pedidos ni ningún dato ya cargado.
        Set<Long> idsConservados = new HashSet<>();
        List<Variante> emparejadas = new ArrayList<>(variantesReq.size());

        for (VarianteUpsertRequest vr : variantesReq) {
            Variante match = null;
            if (vr.id() != null && porId.containsKey(vr.id()) && !idsConservados.contains(vr.id())) {
                match = porId.get(vr.id());
                idsConservados.add(match.getId());
            }
            emparejadas.add(match);
        }

        for (int i = 0; i < variantesReq.size(); i++) {
            if (emparejadas.get(i) != null) {
                continue;
            }
            String pres = variantesReq.get(i).presentacion().trim();
            for (Variante actual : actuales) {
                if (actual.getId() != null && !idsConservados.contains(actual.getId())
                        && actual.getPresentacion() != null
                        && actual.getPresentacion().trim().equalsIgnoreCase(pres)) {
                    emparejadas.set(i, actual);
                    idsConservados.add(actual.getId());
                    break;
                }
            }
        }

        // Eliminamos únicamente las variantes que el usuario quitó del formulario.
        List<Variante> eliminadas = actuales.stream()
                .filter(v -> v.getId() != null && !idsConservados.contains(v.getId()))
                .toList();
        if (!eliminadas.isEmpty()) {
            varianteRepository.deleteAllInBatch(eliminadas);
            varianteRepository.flush();
        }

        // Si dos variantes conservadas intercambian nombres entre sí, liberamos primero
        // los nombres temporales para no chocar con uq_variantes_producto_presentacion.
        Set<String> nombresActualesConservados = new HashSet<>();
        for (Variante v : emparejadas) {
            if (v != null && v.getPresentacion() != null) {
                nombresActualesConservados.add(v.getPresentacion().trim().toLowerCase());
            }
        }
        boolean hayCruceNombres = false;
        for (int i = 0; i < variantesReq.size(); i++) {
            Variante existente = emparejadas.get(i);
            String nuevoNombre = variantesReq.get(i).presentacion().trim().toLowerCase();
            if (existente != null && !existente.getPresentacion().trim().equalsIgnoreCase(nuevoNombre)
                    && nombresActualesConservados.contains(nuevoNombre)) {
                hayCruceNombres = true;
                break;
            }
        }
        if (hayCruceNombres) {
            for (Variante v : emparejadas) {
                if (v != null) {
                    v.setPresentacion("__tmp_" + v.getId());
                }
            }
            varianteRepository.flush();
        }

        List<Variante> resultado = new ArrayList<>(variantesReq.size());
        int orden = 1;
        for (int i = 0; i < variantesReq.size(); i++) {
            VarianteUpsertRequest vr = variantesReq.get(i);
            Variante v = emparejadas.get(i);
            if (v == null) {
                v = new Variante();
                v.setProducto(producto);
            }
            v.setPresentacion(vr.presentacion().trim());
            v.setPrecio(vr.precio());
            v.setPrecioOferta(vr.precioOferta());
            v.setPrecioTransferencia(vr.precioTransferencia());
            v.setStock(vr.stock() != null ? vr.stock() : 0);
            if (vr.activa() != null) {
                v.setActiva(vr.activa());
            } else if (v.getActiva() == null) {
                v.setActiva(true);
            }
            v.setOrden(vr.orden() != null ? vr.orden() : orden);
            orden++;
            resultado.add(v);
        }

        varianteRepository.saveAll(resultado);
        varianteRepository.flush();
        producto.setVariantes(resultado);
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

    public void eliminarPedido(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido no encontrado: " + id));
        pedidoRepository.delete(pedido);
    }
}
