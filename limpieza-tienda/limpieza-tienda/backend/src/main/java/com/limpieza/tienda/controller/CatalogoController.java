package com.limpieza.tienda.controller;

import com.limpieza.tienda.dto.CategoriaDto;
import com.limpieza.tienda.dto.ProductoDto;
import com.limpieza.tienda.service.CatalogoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * API pública del catálogo (sin autenticación).
 */
@RestController
@RequestMapping("/api")
public class CatalogoController {

    private final CatalogoService catalogoService;

    public CatalogoController(CatalogoService catalogoService) {
        this.catalogoService = catalogoService;
    }

    @GetMapping("/categorias")
    public List<CategoriaDto> categorias() {
        return catalogoService.listarCategorias();
    }

    @GetMapping("/productos")
    public List<ProductoDto> productos() {
        return catalogoService.listarCatalogo();
    }

    @GetMapping("/productos/destacados")
    public List<ProductoDto> destacados() {
        return catalogoService.listarDestacados();
    }

    @GetMapping("/categorias/{slug}/productos")
    public List<ProductoDto> productosPorCategoria(
            @org.springframework.web.bind.annotation.PathVariable String slug) {
        return catalogoService.listarPorCategoria(slug);
    }

    @GetMapping("/buscar")
    public List<ProductoDto> buscar(@RequestParam("q") String q) {
        return catalogoService.buscar(q);
    }
}
