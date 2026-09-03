package com.limpieza.tienda.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Crear / editar una categoría (backoffice).
 */
public record CategoriaRequest(
        @NotBlank(message = "Falta el nombre") @Size(max = 80) String nombre,
        @Size(max = 80) String slug,
        @Size(max = 16) String icono,
        Integer orden,
        Boolean activa,
        Boolean destacada) {
}
