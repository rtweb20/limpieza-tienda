package com.limpieza.tienda.dto;

import java.math.BigDecimal;

/**
 * Respuesta del endpoint de carga con lector de código de barras.
 * Le dice a la pantalla si el producto se creó o se actualizó y cuánto stock
 * quedó.
 */
public record CargaProductoResponse(
        Long id,
        String codigoBarras,
        String nombre,
        BigDecimal precio,
        Integer stock,
        String imagenUrl,
        String accion,    // "CREADO" | "ACTUALIZADO"
        String mensaje) {
}
