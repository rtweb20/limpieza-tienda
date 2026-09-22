package com.limpieza.tienda.dto;

import com.limpieza.tienda.model.MedioPago;
import com.limpieza.tienda.model.Variante;

import java.math.BigDecimal;

/**
 * Variante de producto (presentación/aroma/tamaño + precio). Trae tanto los
 * precios "crudos" (para editarlos en el panel) como los ya resueltos para
 * mostrar/cobrar en efectivo y en transferencia/Mercado Pago.
 */
public record VarianteDto(
        Long id,
        String presentacion,
        BigDecimal precio,
        BigDecimal precioOferta,
        BigDecimal precioTransferencia,
        BigDecimal precioVenta,
        BigDecimal precioVentaTransferencia,
        Integer stock) {

    public static VarianteDto from(Variante v) {
        return new VarianteDto(
                v.getId(),
                v.getPresentacion(),
                v.getPrecio(),
                v.getPrecioOferta(),
                v.getPrecioTransferencia(),
                v.precioVenta(),
                v.precioVenta(MedioPago.TRANSFERENCIA),
                v.getStock());
    }
}
