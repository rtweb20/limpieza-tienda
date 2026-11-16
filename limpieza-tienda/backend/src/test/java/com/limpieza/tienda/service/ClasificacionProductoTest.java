package com.limpieza.tienda.service;

import com.limpieza.tienda.model.Producto;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ClasificacionProductoTest {
    @Test void clasificaProductosExistentes() {
        Producto p = new Producto();
        p.setNombre("Aerosol Saphirus Lavanda");
        assertEquals("Saphirus", ClasificacionProducto.marca(p));
        assertEquals("Aerosoles", ClasificacionProducto.subcategoria(p));
        p.setNombre("Difusor Sandra Marzzan");
        assertEquals("Sandra Marzán", ClasificacionProducto.marca(p));
        assertEquals("Difusores", ClasificacionProducto.subcategoria(p));
        p.setNombre("Difusor Auto Saphirus");
        assertEquals("Difusores para auto", ClasificacionProducto.subcategoria(p));
        p.setNombre("Home Spray Saphirus");
        assertEquals("Home spray", ClasificacionProducto.subcategoria(p));
    }
    @Test void admiteCualquierMarcaYTipoEditados() {
        Producto p = new Producto();
        p.setNombre("Aerosol Saphirus");
        p.setMarca("Nueva marca");
        p.setSubcategoria("Línea especial");
        assertEquals("Nueva marca", ClasificacionProducto.marca(p));
        assertEquals("Línea especial", ClasificacionProducto.subcategoria(p));
    }
    @Test void noInventaClasificacionesDesconocidas() {
        Producto p = new Producto();
        p.setNombre("Producto sin clasificar");
        assertNull(ClasificacionProducto.marca(p));
        assertNull(ClasificacionProducto.subcategoria(p));
    }
}
