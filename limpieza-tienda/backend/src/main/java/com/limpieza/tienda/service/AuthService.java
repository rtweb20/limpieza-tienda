package com.limpieza.tienda.service;

import com.limpieza.tienda.config.StoreProperties;
import com.limpieza.tienda.dto.LoginRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * Autenticación simple del backoffice: credenciales por variable de entorno
 * y token stateless (Base64 de {@code usuario:password}) guardado en localStorage.
 */
@Service
public class AuthService {

    private final StoreProperties properties;

    public AuthService(StoreProperties properties) {
        this.properties = properties;
    }

    /** Valida credenciales y devuelve el token de sesión. */
    public String login(LoginRequest request) {
        if (request == null || request.username() == null || request.password() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas");
        }
        String user = properties.getAdmin().getUsername();
        String pass = properties.getAdmin().getPassword();
        if (user.equals(request.username()) && pass.equals(request.password())) {
            return encode(user, pass);
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas");
    }

    /** Valida un token emitido por {@link #login}. */
    public boolean esTokenValido(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        try {
            String decoded = new String(Base64.getUrlDecoder().decode(token.trim()), StandardCharsets.UTF_8);
            int sep = decoded.indexOf(':');
            if (sep < 0) {
                return false;
            }
            return properties.getAdmin().getUsername().equals(decoded.substring(0, sep))
                    && properties.getAdmin().getPassword().equals(decoded.substring(sep + 1));
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    private String encode(String user, String pass) {
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString((user + ":" + pass).getBytes(StandardCharsets.UTF_8));
    }
}
