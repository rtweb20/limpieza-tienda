package com.limpieza.tienda.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Línea del carrito recibida en el checkout.
 */
public record PedidoItemRequest(
        @NotNull(message = "Falta el id del producto") Long productoId,
        @NotNull(message = "Falta el id de la variante") Long varianteId,
        @NotNull(message = "Falta la cantidad") @Min(value = 1, message = "La cantidad debe ser al menos 1")
        Integer cantidad) {
}
