package com.limpieza.tienda.dto;

import com.limpieza.tienda.model.AromaCatalogo;

/**
 * Aroma del catálogo de referencia (marca + tipo de producto + nombre).
 */
public record AromaCatalogoDto(
        Long id,
        String marca,
        String categoria,
        String nombre) {

    public static AromaCatalogoDto from(AromaCatalogo a) {
        return new AromaCatalogoDto(
                a.getId(),
                a.getMarca() != null ? a.getMarca().name() : null,
                a.getCategoria() != null ? a.getCategoria().name() : null,
                a.getNombre());
    }
}
