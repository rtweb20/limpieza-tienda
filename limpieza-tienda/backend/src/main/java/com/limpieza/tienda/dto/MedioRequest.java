package com.limpieza.tienda.dto;

import jakarta.validation.constraints.Size;

/**
 * Edición de metadatos de un medio ya subido (no reemplaza el archivo).
 */
public record MedioRequest(
        @Size(max = 80) String marcaNombre,
        @Size(max = 160) String titulo,
        Integer orden,
        Boolean activo) {
}
