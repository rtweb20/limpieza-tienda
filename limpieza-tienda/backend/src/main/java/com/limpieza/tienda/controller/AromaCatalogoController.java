package com.limpieza.tienda.controller;

import com.limpieza.tienda.dto.AromaCatalogoDto;
import com.limpieza.tienda.service.AromaCatalogoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Catálogo de aromas por marca y tipo de producto (protegido por AdminAuthInterceptor).
 */
@RestController
@RequestMapping("/api/admin/aromas-catalogo")
public class AromaCatalogoController {

    private final AromaCatalogoService aromaCatalogoService;

    public AromaCatalogoController(AromaCatalogoService aromaCatalogoService) {
        this.aromaCatalogoService = aromaCatalogoService;
    }

    @GetMapping
    public List<AromaCatalogoDto> listar(
            @RequestParam(required = false) String marca,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String q) {
        return aromaCatalogoService.listar(marca, categoria, q);
    }
}
