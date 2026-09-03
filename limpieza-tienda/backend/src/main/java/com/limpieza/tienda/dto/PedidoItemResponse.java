package com.limpieza.tienda.dto;

import com.limpieza.tienda.model.PedidoItem;

import java.math.BigDecimal;

/**
 * Ítem ya guardado de un pedido.
 */
public record PedidoItemResponse(
        Long id,
        String productoNombre,
        String varianteNombre,
        Integer cantidad,
        BigDecimal precioUnitario,
        BigDecimal subtotal) {

    public static PedidoItemResponse from(PedidoItem item) {
        return new PedidoItemResponse(
                item.getId(),
                item.getProductoNombre(),
                item.getVarianteNombre(),
                item.getCantidad(),
                item.getPrecioUnitario(),
                item.getSubtotal());
    }
}
