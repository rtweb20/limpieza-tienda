package com.limpieza.tienda.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * Variante dentro de un alta/edición de producto (backoffice).
 */
public record VarianteUpsertRequest(
        Long id,
        @NotBlank(message = "Falta la presentación") @Size(max = 120) String presentacion,
        @NotNull(message = "Falta el precio") @DecimalMin(value = "0.0", message = "Precio inválido") BigDecimal precio,
        @DecimalMin(value = "0.0", message = "Precio de oferta inválido") BigDecimal precioOferta,
        @NotNull(message = "Falta el stock") Integer stock,
        Boolean activa,
        Integer orden) {
}
