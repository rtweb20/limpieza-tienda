package com.limpieza.tienda.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Cambio de estado de un pedido (desde el backoffice).
 */
public record PedidoEstadoRequest(
        @NotBlank(message = "Falta el estado") String estado) {
}
