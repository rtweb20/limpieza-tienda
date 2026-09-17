package com.limpieza.tienda.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Ítem del carrito de la Caja del día (producto + variante + cantidad).
 */
public record VentaItemRequest(
        @NotNull(message = "Falta el producto")
        Long productoId,

        @NotNull(message = "Falta la variante")
        Long varianteId,

        @NotNull(message = "Falta la cantidad")
        @Positive(message = "La cantidad debe ser mayor a 0")
        Integer cantidad) {
}
