package com.limpieza.tienda.service;

import com.limpieza.tienda.exception.PeticionInvalidaException;
import com.limpieza.tienda.model.FormatoMedio;
import com.limpieza.tienda.model.Imagen;
import com.limpieza.tienda.repository.ImagenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Set;

/**
 * Guarda las fotos y videos que el dueño sube desde "Multimedia" en el panel
 * (foto/video del local y publicidad de marcas). Reutiliza la misma tabla
 * genérica "imagenes" (bytea + content-type) que ya usa ImageStorageService
 * para las fotos de producto, así que se sirven igual por /api/imagen/{id}.
 */
@Service
public class MedioArchivoService {

    private static final Set<String> EXT_FOTO = Set.of("jpg", "jpeg", "png", "webp", "gif");
    private static final Set<String> EXT_VIDEO = Set.of("mp4", "webm", "mov", "m4v");
    private static final long MAX_BYTES_VIDEO = 60L * 1024 * 1024; // 60 MB

    private final ImagenRepository imagenRepository;

    public MedioArchivoService(ImagenRepository imagenRepository) {
        this.imagenRepository = imagenRepository;
    }

    @Transactional
    public String guardar(MultipartFile archivo, FormatoMedio formato) {
        if (archivo == null || archivo.isEmpty()) {
            throw new PeticionInvalidaException("Falta el archivo (foto o video).");
        }

        String extension = extraerExtension(archivo.getOriginalFilename(), archivo.getContentType());
        Set<String> permitidas = formato == FormatoMedio.VIDEO ? EXT_VIDEO : EXT_FOTO;
        if (!permitidas.contains(extension)) {
            throw new PeticionInvalidaException(formato == FormatoMedio.VIDEO
                    ? "Formato de video no permitido (.mp4, .webm, .mov o .m4v)."
                    : "Formato de imagen no permitido (.jpg, .png, .webp o .gif).");
        }

        byte[] bytes;
        try {
            bytes = archivo.getBytes();
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo leer el archivo subido.", e);
        }
        if (bytes.length == 0) {
            throw new PeticionInvalidaException("El archivo está vacío.");
        }
        if (formato == FormatoMedio.VIDEO && bytes.length > MAX_BYTES_VIDEO) {
            throw new PeticionInvalidaException(
                    "El video es demasiado pesado (máximo 60 MB). Probá comprimirlo o acortarlo.");
        }

        String ct = archivo.getContentType() != null
                ? archivo.getContentType()
                : contentTypePorDefecto(extension, formato);
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
    public void eliminar(String url) {
        if (url == null || !url.startsWith("/api/imagen/")) {
            return;
        }
        try {
            long id = Long.parseLong(url.substring("/api/imagen/".length()));
            imagenRepository.deleteById(id);
        } catch (NumberFormatException e) {
        }
    }

    private String extraerExtension(String nombreOriginal, String contentType) {
        if (nombreOriginal != null && nombreOriginal.contains(".")) {
            String ext = nombreOriginal.substring(nombreOriginal.lastIndexOf('.') + 1).toLowerCase().trim();
            if (EXT_FOTO.contains(ext) || EXT_VIDEO.contains(ext)) {
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
                case "video/mp4" -> "mp4";
                case "video/webm" -> "webm";
                case "video/quicktime" -> "mov";
                default -> "jpg";
            };
        }
        return "jpg";
    }

    private String contentTypePorDefecto(String extension, FormatoMedio formato) {
        if (formato == FormatoMedio.VIDEO) {
            return switch (extension) {
                case "webm" -> "video/webm";
                case "mov", "m4v" -> "video/quicktime";
                default -> "video/mp4";
            };
        }
        return switch (extension) {
            case "png" -> "image/png";
            case "webp" -> "image/webp";
            case "gif" -> "image/gif";
            default -> "image/jpeg";
        };
    }
}
