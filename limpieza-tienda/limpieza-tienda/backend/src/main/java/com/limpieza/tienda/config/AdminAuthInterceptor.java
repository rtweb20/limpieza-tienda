package com.limpieza.tienda.config;

import com.limpieza.tienda.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Protege todas las rutas {@code /api/admin/**} con el token de sesión.
 * El token viaja en la cabecera {@code X-Admin-Token} (o {@code Authorization: Bearer}).
 */
@Component
public class AdminAuthInterceptor implements HandlerInterceptor {

    private final AuthService authService;

    public AdminAuthInterceptor(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {

        // El login siempre es público.
        if (request.getRequestURI().endsWith("/api/admin/login")) {
            return true;
        }

        String token = request.getHeader("X-Admin-Token");
        if (token == null || token.isBlank()) {
            String auth = request.getHeader("Authorization");
            if (auth != null && auth.startsWith("Bearer ")) {
                token = auth.substring(7);
            }
        }

        if (authService.esTokenValido(token)) {
            return true;
        }

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"error\":\"No autorizado. Iniciá sesión en el panel.\"}");
        return false;
    }
}
