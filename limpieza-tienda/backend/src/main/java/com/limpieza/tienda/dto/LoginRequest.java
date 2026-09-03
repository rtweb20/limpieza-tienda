package com.limpieza.tienda.dto;

/**
 * Credenciales de ingreso al backoffice.
 */
public record LoginRequest(String username, String password) {
}
