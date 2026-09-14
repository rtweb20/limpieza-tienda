package com.limpieza.tienda.dto;

import com.limpieza.tienda.model.Medio;

/**
 * Foto/video expuesto por la API (público y admin).
 */
public record MedioDto(
        Long id,
        String destino,
        String formato,
        String marcaNombre,
        String titulo,
        String url,
        Integer orden,
        Boolean activo) {

    public static MedioDto from(Medio m) {
        return new MedioDto(
                m.getId(),
                m.getDestino() != null ? m.getDestino().name() : null,
                m.getFormato() != null ? m.getFormato().name() : null,
                m.getMarcaNombre(),
                m.getTitulo(),
                m.getUrl(),
                m.getOrden(),
                m.getActivo());
    }
}
