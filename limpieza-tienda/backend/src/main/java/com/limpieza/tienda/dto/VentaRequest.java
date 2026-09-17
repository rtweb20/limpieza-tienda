package com.limpieza.tienda.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

/**
 * Cobro de una venta de mostrador ("Caja del día").
 */
public record VentaRequest(
        @NotBlank(message = "Elegí el medio de pago")
        String medioPago,

        @NotEmpty(message = "La venta no tiene productos")
        @Valid
        List<VentaItemRequest> items) {
}
