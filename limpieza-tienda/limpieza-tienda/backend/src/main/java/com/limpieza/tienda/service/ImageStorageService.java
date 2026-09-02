package com.limpieza.tienda.service;

import com.limpieza.tienda.exception.PeticionInvalidaException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

/**
 * Guarda y borra las fotos de los productos en el disco local del servidor.
 *
 * <p>Las imágenes NO van a la base de datos: se guardan en la carpeta
 * {@code uploads/} con un nombre único (UUID + extensión) para evitar
 * colisiones, y en la tabla {@code productos.imagen_url} queda la RUTA relativa
 * (ej. {@code /uploads/3f2a9c...jpg}).
 *
 * <p>La carpeta {@code /uploads/**} se expone como recurso estático en
 * {@code WebConfig}, así que la foto queda accesible directamente por URL.
 */
@Service
public class ImageStorageService {

    /** Extensiones de imagen permitidas. */
    private static final Set<String> EXT_PERMITIDAS = Set.of("jpg", "jpeg", "png", "webp", "gif");

    private final Path directorio;

    public ImageStorageService(@Value("${app.uploads.dir:uploads}") String uploadsDir) throws IOException {
        this.directorio = Paths.get(uploadsDir).toAbsolutePath().normalize();
        Files.createDirectories(this.directorio);
    }

    /**
     * Guarda el archivo subido y devuelve la ruta pública (relativa).
     *
     * @return {@code "/uploads/<uuid>.<ext>"} o {@code null} si no se subió archivo.
     */
    public String guardar(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            return null;
        }
        String extension = extraerExtension(archivo.getOriginalFilename(), archivo.getContentType());
        if (!EXT_PERMITIDAS.contains(extension)) {
            throw new PeticionInvalidaException(
                    "Formato de imagen no permitido (.jpg, .png, .webp o .gif).");
        }

        // Nombre único: UUID sin guiones → imposible que pise otro archivo.
        String nombreArchivo = UUID.randomUUID().toString().replace("-", "") + "." + extension;

        try (InputStream in = archivo.getInputStream()) {
            Files.copy(in, directorio.resolve(nombreArchivo), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo guardar la imagen en el servidor.", e);
        }
        return "/uploads/" + nombreArchivo;
    }

    /**
     * Borra un archivo previamente guardado (si su ruta pertenece a /uploads/).
     * Se usa al reemplazar la foto de un producto existente.
     */
    public void eliminar(String ruta) {
        if (ruta == null || !ruta.startsWith("/uploads/")) {
            return; // solo borramos archivos que gestionamos nosotros
        }
        try {
            Files.deleteIfExists(directorio.resolve(ruta.substring("/uploads/".length())));
        } catch (IOException e) {
            // No es crítico: si no se puede borrar, se ignora.
        }
    }

    /** Deduce la extensión del nombre del archivo o del content-type. */
    private String extraerExtension(String nombreOriginal, String contentType) {
        if (nombreOriginal != null && nombreOriginal.contains(".")) {
            String ext = nombreOriginal.substring(nombreOriginal.lastIndexOf('.') + 1)
                    .toLowerCase().trim();
            if (EXT_PERMITIDAS.contains(ext)) {
                return ext;
            }
        }
        if (contentType != null) {
            return switch (contentType.toLowerCase()) {
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
