package com.limpieza.tienda.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;

/**
 * Variante de un producto: misma foto, distinta presentación/aroma/tamaño y precio.
 */
@Entity
@Table(name = "variantes")
public class Variante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(nullable = false, length = 120)
    private String presentacion;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal precio;

    @Column(name = "precio_oferta", precision = 12, scale = 2)
    private BigDecimal precioOferta;

    /**
     * Precio para transferencia/Mercado Pago, si es distinto del de efectivo
     * ({@link #precio}). Si es null, se cobra lo mismo que en efectivo.
     */
    @Column(name = "precio_transferencia", precision = 12, scale = 2)
    private BigDecimal precioTransferencia;

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(nullable = false)
    private Boolean activa = true;

    @Column(nullable = false)
    private Integer orden = 0;

    public Variante() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
        this.producto = producto;
    }

    public String getPresentacion() {
        return presentacion;
    }

    public void setPresentacion(String presentacion) {
        this.presentacion = presentacion;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }

    public BigDecimal getPrecioOferta() {
        return precioOferta;
    }

    public void setPrecioOferta(BigDecimal precioOferta) {
        this.precioOferta = precioOferta;
    }

    public BigDecimal getPrecioTransferencia() {
        return precioTransferencia;
    }

    public void setPrecioTransferencia(BigDecimal precioTransferencia) {
        this.precioTransferencia = precioTransferencia;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public Boolean getActiva() {
        return activa;
    }

    public void setActiva(Boolean activa) {
        this.activa = activa;
    }

    public Integer getOrden() {
        return orden;
    }

    public void setOrden(Integer orden) {
        this.orden = orden;
    }

    /**
     * Precio efectivo de venta: el de oferta si existe y es menor, si no el normal.
     */
    public BigDecimal precioVenta() {
        if (precioOferta != null && precioOferta.compareTo(BigDecimal.ZERO) >= 0
                && precioOferta.compareTo(precio) < 0) {
            return precioOferta;
        }
        return precio;
    }

    /**
     * Precio efectivo de venta según el medio de pago: en efectivo es
     * {@link #precioVenta()} de siempre; en transferencia o Mercado Pago usa
     * {@link #precioTransferencia} si el dueño cargó uno, y si no cobra lo
     * mismo que en efectivo.
     */
    public BigDecimal precioVenta(MedioPago medioPago) {
        if (medioPago == MedioPago.EFECTIVO) {
            return precioVenta();
        }
        if (precioTransferencia != null && precioTransferencia.compareTo(BigDecimal.ZERO) >= 0) {
            return precioTransferencia;
        }
        return precioVenta();
    }
}
