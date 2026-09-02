package com.limpieza.tienda.dto;

import com.limpieza.tienda.model.Categoria;

/**
 * Categoría expuesta por la API.
 */
public record CategoriaDto(
        Long id,
        String nombre,
        String slug,
        String icono,
        Integer orden,
        Boolean activa,
        Boolean destacada) {

    public static CategoriaDto from(Categoria c) {
        return new CategoriaDto(
                c.getId(),
                c.getNombre(),
                c.getSlug(),
                c.getIcono(),
                c.getOrden(),
                c.getActiva(),
                c.getDestacada());
    }
}
