package com.limpieza.tienda.controller;

import com.limpieza.tienda.dto.AromaCatalogoDto;
import com.limpieza.tienda.service.AromaCatalogoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Versión pública (sin token de admin) del catálogo de aromas, para que la
 * tienda pública pueda mostrarle al cliente qué aromas hay por marca y tipo
 * de producto, antes de elegir. Mismo service que la versión de admin
 * ({@link AromaCatalogoController}, protegida) — esta solo cambia el path
 * para quedar fuera del prefijo /api/admin/** (ver WebConfig).
 */
@RestController
@RequestMapping("/api/aromas-catalogo")
public class AromaCatalogoPublicController {

    private final AromaCatalogoService aromaCatalogoService;

    public AromaCatalogoPublicController(AromaCatalogoService aromaCatalogoService) {
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
