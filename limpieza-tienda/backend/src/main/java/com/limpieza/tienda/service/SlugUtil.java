package com.limpieza.tienda.service;

import java.text.Normalizer;

/**
 * Genera slugs amigables para URLs (sin acentos, minúsculas, guiones).
 */
public final class SlugUtil {

    private SlugUtil() {
    }

    public static String slugify(String input) {
        if (input == null) {
            return "";
        }
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");           // quita acentos
        return normalized.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")        // no alfanumérico → guion
                .replaceAll("^-+|-+$", "")            // sin guiones en los extremos
                .replaceAll("-{2,}", "-");            // colapsa guiones repetidos
    }
}
