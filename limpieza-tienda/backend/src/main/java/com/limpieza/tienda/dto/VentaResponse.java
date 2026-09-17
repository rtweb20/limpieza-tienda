package com.limpieza.tienda.dto;

import com.limpieza.tienda.model.Venta;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Venta de mostrador ya cobrada, con el detalle de sus ítems.
 */
public record VentaResponse(
        Long id,
        String medioPago,
        BigDecimal total,
        OffsetDateTime createdAt,
        List<VentaItemResponse> items) {

    public static VentaResponse from(Venta v, List<VentaItemResponse> items) {
        return new VentaResponse(
                v.getId(),
                v.getMedioPago() != null ? v.getMedioPago().name() : null,
                v.getTotal(),
                v.getCreatedAt(),
                items);
    }
}
