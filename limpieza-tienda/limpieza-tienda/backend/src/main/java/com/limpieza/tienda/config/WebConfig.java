package com.limpieza.tienda.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Registra el interceptor de autenticación del backoffice, habilita CORS y
 * expone la carpeta de fotos subidas ({@code /uploads/**}) como estático.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AdminAuthInterceptor adminAuthInterceptor;

    @Value("${app.cors.allowed-origins:*}")
    private String allowedOrigins;

    @Value("${app.uploads.dir:uploads}")
    private String uploadsDir;

    public WebConfig(AdminAuthInterceptor adminAuthInterceptor) {
        this.adminAuthInterceptor = adminAuthInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(adminAuthInterceptor)
                .addPathPatterns("/api/admin/**");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins.split(","))
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }

    /** Sirve las fotos subidas desde la carpeta configurada en app.uploads.dir. */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path directorio = Paths.get(uploadsDir).toAbsolutePath().normalize();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(directorio.toUri().toString());
    }
}
