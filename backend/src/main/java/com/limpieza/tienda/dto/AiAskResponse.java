package com.limpieza.tienda.dto;

public record AiAskResponse(
        String respuesta,
        boolean usandoIa,
        String modelo) {
}
