package com.limpieza.tienda.service;

import com.limpieza.tienda.exception.PeticionInvalidaException;
import com.limpieza.tienda.model.Imagen;
import com.limpieza.tienda.repository.ImagenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Set;

/**
 * Guarda y borra las fotos de los productos <b>en la base de datos</b>.
 *
 * <p>Las imágenes se guardan como bytes (bytea) en la tabla {@code imagenes} y
 * en {@code productos.imagen_url} queda la ruta {@code /api/imagen/{id}}, que se
 * sirve desde el endpoint público {@code GET /api/imagen/{id}}.
 *
 * <p>Motivo: en Render (plan gratis) el disco del servidor es efímero y se
 * borra en cada redeploy, así que las fotos guardadas como archivo se perdían.
 * Guardadas en PostgreSQL, sobreviven igual que el resto de los datos.
 */
@Service
public class ImageStorageService {

    /** Extensiones de imagen permitidas. */
    private static final Set<String> EXT_PERMITIDAS = Set.of("jpg", "jpeg", "png", "webp", "gif");

    private final ImagenRepository imagenRepository;

    public ImageStorageService(ImagenRepository imagenRepository) {
        this.imagenRepository = imagenRepository;
    }

    /**
     * Guarda la foto subida en la base de datos y devuelve su ruta pública.
     *
     * @return {@code "/api/imagen/<id>"} o {@code null} si no se subió archivo.
     */
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

        Imagen imagen = new Imagen();
        imagen.setContentType(archivo.getContentType() != null
                ? archivo.getContentType() : "image/" + extension);
        imagen.setDatos(bytes);
        imagen = imagenRepository.save(imagen);

        return "/api/imagen/" + imagen.getId();
    }

    /**
     * Borra una imagen guardada en la base (si su ruta pertenece a /api/imagen/).
     * Se usa al reemplazar la foto de un producto existente.
     */
    @Transactional
    public void eliminar(String ruta) {
        if (ruta == null || !ruta.startsWith("/api/imagen/")) {
            return; // solo borramos imágenes que gestionamos nosotros
        }
        try {
            long id = Long.parseLong(ruta.substring("/api/imagen/".length()));
            imagenRepository.deleteById(id);
        } catch (NumberFormatException e) {
            // ruta no numérica: se ignora
        }
    }

    /** Borra TODAS las imágenes guardadas (se usa al vaciar el catálogo). */
    @Transactional
    public void eliminarTodas() {
        imagenRepository.deleteAll();
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
