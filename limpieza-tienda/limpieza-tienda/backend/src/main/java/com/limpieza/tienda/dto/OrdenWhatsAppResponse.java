package com.limpieza.tienda.dto;

/**
 * Resultado de la generación de la orden de WhatsApp.
 */
public record OrdenWhatsAppResponse(
        String numero,
        String url,
        String mensaje) {
}
