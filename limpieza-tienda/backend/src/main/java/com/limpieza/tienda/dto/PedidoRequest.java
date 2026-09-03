package com.limpieza.tienda.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Datos del formulario pre-WhatsApp (checkout).
 */
public record PedidoRequest(
        @NotBlank(message = "Ingresá tu nombre completo") @Size(max = 120)
        String nombre,

        @Size(max = 30)
        String telefono,

        @Size(max = 255)
        String direccion,

        @Size(max = 120)
        String barrio,

        @NotBlank(message = "Elegí la modalidad de entrega")
        String modalidadEntrega,

        @NotBlank(message = "Elegí el medio de pago")
        String medioPago,

        @Size(max = 500)
        String notas,

        @NotEmpty(message = "El pedido no tiene productos")
        List<PedidoItemRequest> items) {
}
