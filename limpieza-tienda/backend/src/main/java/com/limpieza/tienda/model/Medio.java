package com.limpieza.tienda.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

/**
 * Foto o video que el dueño carga desde el panel de administración para
 * mostrar en la home pública: fotos/video del local, o publicidad de las
 * marcas con las que trabaja.
 */
@Entity
@Table(name = "medios")
public class Medio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private DestinoMedio destino;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private FormatoMedio formato;

    @Column(name = "marca_nombre", length = 80)
    private String marcaNombre;

    @Column(length = 160)
    private String titulo;

    @Column(nullable = false, length = 300)
    private String url;

    @Column(nullable = false)
    private Integer orden = 0;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    public Medio() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public DestinoMedio getDestino() {
        return destino;
    }

    public void setDestino(DestinoMedio destino) {
        this.destino = destino;
    }

    public FormatoMedio getFormato() {
        return formato;
    }

    public void setFormato(FormatoMedio formato) {
        this.formato = formato;
    }

    public String getMarcaNombre() {
        return marcaNombre;
    }

    public void setMarcaNombre(String marcaNombre) {
        this.marcaNombre = marcaNombre;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public Integer getOrden() {
        return orden;
    }

    public void setOrden(Integer orden) {
        this.orden = orden;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
