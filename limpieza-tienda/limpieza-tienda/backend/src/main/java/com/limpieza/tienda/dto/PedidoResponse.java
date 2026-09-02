package com.limpieza.tienda.dto;

import com.limpieza.tienda.model.Pedido;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Pedido creado, con sus ítems y el enlace de WhatsApp listo para abrir.
 */
public record PedidoResponse(
        Long id,
        String nombreCliente,
        String telefono,
        String direccion,
        String barrio,
        String modalidadEntrega,
        String medioPago,
        String notas,
        BigDecimal total,
        String estado,
        OffsetDateTime createdAt,
        List<PedidoItemResponse> items,
        String whatsappUrl) {

    public static PedidoResponse from(Pedido p, List<PedidoItemResponse> items, String whatsappUrl) {
        return new PedidoResponse(
                p.getId(),
                p.getNombreCliente(),
                p.getTelefono(),
                p.getDireccion(),
                p.getBarrio(),
                p.getModalidadEntrega() != null ? p.getModalidadEntrega().name() : null,
                p.getMedioPago() != null ? p.getMedioPago().name() : null,
                p.getNotas(),
                p.getTotal(),
                p.getEstado() != null ? p.getEstado().name() : null,
                p.getCreatedAt(),
                items,
                whatsappUrl);
    }
}
