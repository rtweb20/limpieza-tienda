package com.limpieza.tienda.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Petición inválida: datos inconsistentes, stock insuficiente, etc.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class PeticionInvalidaException extends RuntimeException {

    public PeticionInvalidaException(String mensaje) {
        super(mensaje);
    }
}
