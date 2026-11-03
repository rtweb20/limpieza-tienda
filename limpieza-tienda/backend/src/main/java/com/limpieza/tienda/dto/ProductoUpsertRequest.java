package com.limpieza.tienda.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Alta / edición de un producto con sus variantes (backoffice).
 */
public record ProductoUpsertRequest(
        @NotBlank(message = "Falta el nombre") @Size(max = 120) String nombre,
        String descripcion,
        @NotBlank(message = "Falta la URL de la imagen") String imagenUrl,
        @Size(max = 64, message = "El código de barras no puede superar 64 caracteres") String codigoBarras,
        @NotNull(message = "Falta la categoría") Long categoriaId,
        Boolean destacado,
        Boolean activo,
        @NotEmpty(message = "El producto necesita al menos una variante")
        List<VarianteUpsertRequest> variantes) {
}
