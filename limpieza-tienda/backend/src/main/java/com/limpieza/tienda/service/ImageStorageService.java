package com.limpieza.tienda.service;

import com.limpieza.tienda.exception.PeticionInvalidaException;
import com.limpieza.tienda.model.Imagen;
import com.limpieza.tienda.repository.ImagenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Set;

@Service
public class ImageStorageService {

    private static final Set<String> EXT_PERMITIDAS = Set.of("jpg", "jpeg", "png", "webp", "gif");

    private final ImagenRepository imagenRepository;

    public ImageStorageService(ImagenRepository imagenRepository) {
        this.imagenRepository = imagenRepository;
    }

    @Transactional
    public String guardar(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            return null;
        }
        String extension = extraerExtension(archivo.getOriginalFilename(), archivo.getContentType());
        if (!EXT_PERMITIDAS.contains(extension)) {
            throw new PeticionInvalidaException(
                    "Formato de imagen no permitido (.jpg, .png, .webp o .gif).");
        }

        byte[] bytes;
        try {
            bytes = archivo.getBytes();
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo leer la imagen subida.", e);
        }
        if (bytes.length == 0) {
            throw new PeticionInvalidaException("La imagen está vacía.");
        }

        String ct = archivo.getContentType() != null ? archivo.getContentType() : "image/" + extension;
        if (ct.contains(";")) {
            ct = ct.split(";")[0].trim();
        }
        if (ct.length() > 60) {
            ct = ct.substring(0, 60);
        }

        Imagen imagen = new Imagen();
        imagen.setContentType(ct);
        imagen.setDatos(bytes);
        imagen = imagenRepository.save(imagen);

        return "/api/imagen/" + imagen.getId();
    }

    @Transactional
    public void eliminar(String ruta) {
        if (ruta == null || !ruta.startsWith("/api/imagen/")) {
            return;
        }
        try {
            long id = Long.parseLong(ruta.substring("/api/imagen/".length()));
            imagenRepository.deleteById(id);
        } catch (NumberFormatException e) {
        }
    }

    @Transactional
    public void eliminarTodas() {
        imagenRepository.deleteAll();
    }

    private String extraerExtension(String nombreOriginal, String contentType) {
        if (nombreOriginal != null && nombreOriginal.contains(".")) {
            String ext = nombreOriginal.substring(nombreOriginal.lastIndexOf('.') + 1)
                    .toLowerCase().trim();
            if (EXT_PERMITIDAS.contains(ext)) {
                return ext;
            }
        }
        if (contentType != null) {
            String ct = contentType.toLowerCase().trim();
            if (ct.contains(";")) {
                ct = ct.split(";")[0].trim();
            }
            return switch (ct) {
                case "image/jpeg", "image/jpg" -> "jpg";
                case "image/png" -> "png";
                case "image/webp" -> "webp";
                case "image/gif" -> "gif";
                default -> "jpg";
            };
        }
        return "jpg";
    }
}
