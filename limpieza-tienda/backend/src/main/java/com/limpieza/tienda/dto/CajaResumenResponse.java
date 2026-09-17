package com.limpieza.tienda.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Resumen de "Caja del día": total vendido, cantidad de ventas y su detalle,
 * calculado sobre el día en curso en la zona horaria de Argentina.
 */
public record CajaResumenResponse(
        String fecha,
        BigDecimal totalVendido,
        Integer cantidadVentas,
        List<VentaResponse> ventas) {
}
