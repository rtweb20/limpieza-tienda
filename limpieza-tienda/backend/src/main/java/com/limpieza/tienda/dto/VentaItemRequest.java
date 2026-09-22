package com.limpieza.tienda.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

/**
 * Ítem del carrito de la Caja del día (producto + variante + cantidad).
 * {@code precioUnitario} es opcional: si el cajero lo edita a mano en la
 * pantalla (por si el precio cargado quedó desactualizado), se cobra ese
 * valor en vez de recalcularlo del catálogo.
 */
public record VentaItemRequest(
        @NotNull(message = "Falta el producto")
        Long productoId,

        @NotNull(message = "Falta la variante")
        Long varianteId,

        @NotNull(message = "Falta la cantidad")
        @Positive(message = "La cantidad debe ser mayor a 0")
        Integer cantidad,

        @DecimalMin(value = "0.0", message = "Precio inválido")
        BigDecimal precioUnitario) {
}
