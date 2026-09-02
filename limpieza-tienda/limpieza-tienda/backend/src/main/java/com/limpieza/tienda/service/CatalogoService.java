package com.limpieza.tienda.service;

import com.limpieza.tienda.dto.CategoriaDto;
import com.limpieza.tienda.dto.ProductoDto;
import com.limpieza.tienda.exception.RecursoNoEncontradoException;
import com.limpieza.tienda.repository.CategoriaRepository;
import com.limpieza.tienda.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Operaciones de lectura del catálogo público (tienda).
 */
@Service
@Transactional(readOnly = true)
public class CatalogoService {

    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;

    public CatalogoService(CategoriaRepository categoriaRepository,
                           ProductoRepository productoRepository) {
        this.categoriaRepository = categoriaRepository;
        this.productoRepository = productoRepository;
    }

    public List<CategoriaDto> listarCategorias() {
        return categoriaRepository.findByActivaTrueOrderByOrdenAsc()
                .stream()
                .map(CategoriaDto::from)
                .toList();
    }

    public List<ProductoDto> listarDestacados() {
        return productoRepository.findDestacados().stream().map(ProductoDto::from).toList();
    }

    public List<ProductoDto> listarCatalogo() {
        return productoRepository.findCatalogo().stream().map(ProductoDto::from).toList();
    }

    public List<ProductoDto> listarPorCategoria(String slug) {
        List<ProductoDto> productos = productoRepository.findByCategoriaSlug(slug)
                .stream().map(ProductoDto::from).toList();
        if (productos.isEmpty()) {
            // Confirmamos que la categoría exista (para dar un 404 correcto).
            categoriaRepository.findBySlug(slug)
                    .orElseThrow(() -> new RecursoNoEncontradoException("Categoría no encontrada: " + slug));
        }
        return productos;
    }

    public List<ProductoDto> buscar(String q) {
        if (q == null || q.isBlank()) {
            return List.of();
        }
        return productoRepository.search(q.trim()).stream().map(ProductoDto::from).toList();
    }
}
