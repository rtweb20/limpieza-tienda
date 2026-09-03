package com.limpieza.tienda.dto;

import com.limpieza.tienda.model.Producto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Producto del catálogo con sus variantes ya resueltas.
 */
public record ProductoDto(
        Long id,
        String nombre,
        String slug,
        String descripcion,
        String imagenUrl,
        String codigoBarras,
        Boolean destacado,
        Boolean activo,
        Long categoriaId,
        String categoriaNombre,
        String categoriaIcono,
        List<VarianteDto> variantes,
        BigDecimal precioDesde,
        Boolean enOferta) {

    public static ProductoDto from(Producto p) {
        List<VarianteDto> variantes = p.getVariantes() == null
                ? List.of()
                : p.getVariantes().stream().map(VarianteDto::from).toList();

        BigDecimal precioDesde = variantes.stream()
                .map(VarianteDto::precioVenta)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        boolean enOferta = p.getVariantes() != null && p.getVariantes().stream()
                .anyMatch(v -> v.getPrecioOferta() != null
                        && v.getPrecioOferta().compareTo(v.getPrecio()) < 0);

        return new ProductoDto(
                p.getId(),
                p.getNombre(),
                p.getSlug(),
                p.getDescripcion(),
                p.getImagenUrl(),
                p.getCodigoBarras(),
                p.getDestacado(),
                p.getActivo(),
                p.getCategoria() != null ? p.getCategoria().getId() : null,
                p.getCategoria() != null ? p.getCategoria().getNombre() : null,
                p.getCategoria() != null ? p.getCategoria().getIcono() : null,
                variantes,
                precioDesde,
                enOferta);
    }
}
