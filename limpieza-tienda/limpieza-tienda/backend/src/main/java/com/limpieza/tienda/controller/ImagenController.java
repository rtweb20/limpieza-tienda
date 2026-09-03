package com.limpieza.tienda.controller;

import com.limpieza.tienda.model.Imagen;
import com.limpieza.tienda.repository.ImagenRepository;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

/**
 * Sirve las fotos de producto guardadas en la base de datos.
 * Endpoint PÚBLICO (sin autenticación): la tienda lo usa como {@code <img src>}.
 */
@RestController
public class ImagenController {

    private final ImagenRepository imagenRepository;

    public ImagenController(ImagenRepository imagenRepository) {
        this.imagenRepository = imagenRepository;
    }

    @GetMapping("/api/imagen/{id}")
    public ResponseEntity<byte[]> imagen(@PathVariable Long id) {
        Imagen imagen = imagenRepository.findById(id)
                .orElseThrow(() -> new com.limpieza.tienda.exception.RecursoNoEncontradoException(
                        "Imagen no encontrada: " + id));

        MediaType mediaType = parseMediaType(imagen.getContentType());

        return ResponseEntity.ok()
                .contentType(mediaType)
                .cacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic())
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(imagen.getDatos());
    }

    /** Convierte el content-type guardado a un MediaType seguro. */
    private MediaType parseMediaType(String contentType) {
        if (contentType == null) {
            return MediaType.IMAGE_JPEG;
        }
        try {
            return MediaType.parseMediaType(contentType);
        } catch (Exception e) {
            return MediaType.IMAGE_JPEG;
        }
    }
}
