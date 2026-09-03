package com.limpieza.tienda.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Imagen de producto guardada DIRECTAMENTE en la base de datos (bytea).
 *
 * <p>Antes las fotos se guardaban como archivos en el disco del servidor, pero
 * en Render (plan gratis) el disco es efímero y se borra en cada redeploy. Al
 * guardar los bytes en PostgreSQL, la foto sobrevive a los redeploys igual que
 * el resto de los datos.
 *
 * <p>En {@code productos.imagen_url} se guarda la ruta {@code /api/imagen/{id}},
 * que el frontend usa directamente como {@code <img src>}.
 */
@Entity
@Table(name = "imagenes")
public class Imagen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "content_type", nullable = false, length = 60)
    private String contentType;

    @Column(name = "datos", nullable = false, columnDefinition = "bytea")
    private byte[] datos;

    public Imagen() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public byte[] getDatos() {
        return datos;
    }

    public void setDatos(byte[] datos) {
        this.datos = datos;
    }
}
