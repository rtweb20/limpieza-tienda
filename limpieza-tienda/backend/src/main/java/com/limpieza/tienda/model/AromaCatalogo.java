package com.limpieza.tienda.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Catálogo de referencia de aromas disponibles por marca y tipo de producto
 * (la versión digital de la planilla de Excel del dueño). No tiene relación
 * con el stock: solo sirve para saber qué aromas existen y cuáles ya se
 * cargaron como variante de algún producto.
 */
@Entity
@Table(name = "aromas_catalogo")
public class AromaCatalogo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AromaMarca marca;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AromaCategoria categoria;

    @Column(nullable = false, length = 160)
    private String nombre;

    public AromaCatalogo() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public AromaMarca getMarca() {
        return marca;
    }

    public void setMarca(AromaMarca marca) {
        this.marca = marca;
    }

    public AromaCategoria getCategoria() {
        return categoria;
    }

    public void setCategoria(AromaCategoria categoria) {
        this.categoria = categoria;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}
