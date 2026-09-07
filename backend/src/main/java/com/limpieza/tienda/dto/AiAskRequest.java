package com.limpieza.tienda.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AiAskRequest(
        @NotBlank(message = "La pregunta no puede estar vacía")
        @Size(max = 1000, message = "La pregunta es demasiado larga")
        String pregunta) {
}
