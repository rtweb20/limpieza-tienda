package com.limpieza.tienda.dto;

import com.limpieza.tienda.model.Variante;

import java.math.BigDecimal;

/**
 * Variante de producto (presentación/aroma/tamaño + precio).
 */
public record VarianteDto(
        Long id,
        String presentacion,
        BigDecimal precio,
        BigDecimal precioOferta,
        BigDecimal precioVenta,
        Integer stock) {

    public static VarianteDto from(Variante v) {
        return new VarianteDto(
                v.getId(),
                v.getPresentacion(),
                v.getPrecio(),
                v.getPrecioOferta(),
                v.precioVenta(),
                v.getStock());
    }
}
