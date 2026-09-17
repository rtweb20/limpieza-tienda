package com.limpieza.tienda.dto;

import com.limpieza.tienda.model.VentaItem;

import java.math.BigDecimal;

/**
 * Ítem ya guardado de una venta de mostrador.
 */
public record VentaItemResponse(
        Long id,
        Long productoId,
        Long varianteId,
        String productoNombre,
        String varianteNombre,
        Integer cantidad,
        BigDecimal precioUnitario,
        BigDecimal subtotal) {

    public static VentaItemResponse from(VentaItem item) {
        return new VentaItemResponse(
                item.getId(),
                item.getProductoId(),
                item.getVarianteId(),
                item.getProductoNombre(),
                item.getVarianteNombre(),
                item.getCantidad(),
                item.getPrecioUnitario(),
                item.getSubtotal());
    }
}
