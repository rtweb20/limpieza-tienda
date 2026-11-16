package com.limpieza.tienda.service;

import com.limpieza.tienda.model.Producto;
import java.text.Normalizer;
import java.util.Locale;

/** Clasificación sugerida para el catálogo anterior; los valores editados tienen prioridad. */
public final class ClasificacionProducto {
    private ClasificacionProducto() {}

    private static String texto(Producto p) {
        String categoria = p.getCategoria() == null ? "" : p.getCategoria().getNombre();
        return Normalizer.normalize(p.getNombre() + " " + categoria, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT);
    }

    public static String marca(Producto p) {
        if (p.getMarca() != null && !p.getMarca().isBlank()) return p.getMarca();
        String t = texto(p);
        if (t.contains("saphirus")) return "Saphirus";
        if (t.contains("marzzan") || t.contains("marzan")) return "Sandra Marzán";
        if (t.contains("aromanza")) return "Aromanza";
        if (t.matches(".*\\bpoett?\\b.*")) return "Poett";
        return null;
    }

    public static String subcategoria(Producto p) {
        if (p.getSubcategoria() != null && !p.getSubcategoria().isBlank()) return p.getSubcategoria();
        String t = texto(p);
        if (t.contains("aerosol")) return "Aerosoles";
        if (t.contains("difusor") && (t.contains("auto") || t.contains("coche"))) return "Difusores para auto";
        if (t.contains("home spray")) return "Home spray";
        if (t.contains("aceite")) return "Aceites aromáticos";
        if (t.contains("difusor")) return "Difusores";
        if (t.contains("textil")) return "Aromatizantes textiles";
        if (t.contains("sahumerio")) return "Sahumerios";
        if (t.contains("esencia")) return "Esencias";
        if (t.contains("repuesto")) return "Repuestos";
        if (t.contains("desinfectante")) return "Desinfectantes";
        if (t.contains("limpiador") || t.contains("limpiapisos")) return "Limpiadores";
        if (t.contains("jabon")) return "Jabones";
        if (t.contains("detergente")) return "Detergentes";
        if (t.contains("suavizante")) return "Suavizantes";
        return null;
    }
}
