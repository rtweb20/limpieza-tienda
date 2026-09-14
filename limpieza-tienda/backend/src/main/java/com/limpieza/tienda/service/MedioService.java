package com.limpieza.tienda.service;

import com.limpieza.tienda.dto.MedioDto;
import com.limpieza.tienda.dto.MedioRequest;
import com.limpieza.tienda.exception.PeticionInvalidaException;
import com.limpieza.tienda.exception.RecursoNoEncontradoException;
import com.limpieza.tienda.model.DestinoMedio;
import com.limpieza.tienda.model.FormatoMedio;
import com.limpieza.tienda.model.Medio;
import com.limpieza.tienda.repository.MedioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Fotos/videos del local y publicidad de marcas que el dueño administra
 * desde la pestaña "Multimedia" del panel.
 */
@Service
@Transactional
public class MedioService {

    private final MedioRepository medioRepository;
    private final MedioArchivoService medioArchivoService;

    public MedioService(MedioRepository medioRepository, MedioArchivoService medioArchivoService) {
        this.medioRepository = medioRepository;
        this.medioArchivoService = medioArchivoService;
    }

    public List<MedioDto> listarTodos() {
        return medioRepository.findAllByOrderByOrdenAscIdAsc().stream().map(MedioDto::from).toList();
    }

    public List<MedioDto> listarPublicos() {
        return medioRepository.findByActivoTrueOrderByOrdenAscIdAsc().stream().map(MedioDto::from).toList();
    }

    public MedioDto crear(String destino, String formato, String marcaNombre, String titulo,
                          Integer orden, MultipartFile archivo) {
        DestinoMedio destinoEnum = parseDestino(destino);
        FormatoMedio formatoEnum = parseFormato(formato);

        if (destinoEnum == DestinoMedio.MARCA && (marcaNombre == null || marcaNombre.isBlank())) {
            throw new PeticionInvalidaException("Falta el nombre de la marca.");
        }

        String url = medioArchivoService.guardar(archivo, formatoEnum);

        Medio medio = new Medio();
        medio.setDestino(destinoEnum);
        medio.setFormato(formatoEnum);
        medio.setMarcaNombre(destinoEnum == DestinoMedio.MARCA ? marcaNombre.trim() : null);
        medio.setTitulo(titulo != null && !titulo.isBlank() ? titulo.trim() : null);
        medio.setUrl(url);
        medio.setOrden(orden != null ? orden : siguienteOrden());
        medio.setActivo(true);
        return MedioDto.from(medioRepository.save(medio));
    }

    public MedioDto actualizar(Long id, MedioRequest request) {
        Medio medio = medioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Medio no encontrado: " + id));

        if (medio.getDestino() == DestinoMedio.MARCA
                && request.marcaNombre() != null && !request.marcaNombre().isBlank()) {
            medio.setMarcaNombre(request.marcaNombre().trim());
        }
        if (request.titulo() != null) {
            medio.setTitulo(request.titulo().isBlank() ? null : request.titulo().trim());
        }
        if (request.orden() != null) {
            medio.setOrden(request.orden());
        }
        if (request.activo() != null) {
            medio.setActivo(request.activo());
        }
        return MedioDto.from(medioRepository.save(medio));
    }

    public void eliminar(Long id) {
        Medio medio = medioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Medio no encontrado: " + id));
        medioArchivoService.eliminar(medio.getUrl());
        medioRepository.delete(medio);
    }

    private int siguienteOrden() {
        return (int) medioRepository.count();
    }

    private DestinoMedio parseDestino(String valor) {
        if (valor != null) {
            try {
                return DestinoMedio.valueOf(valor.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // cae al error de abajo
            }
        }
        throw new PeticionInvalidaException("Destino inválido (usar LOCAL o MARCA): " + valor);
    }

    private FormatoMedio parseFormato(String valor) {
        if (valor != null) {
            try {
                return FormatoMedio.valueOf(valor.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // cae al error de abajo
            }
        }
        throw new PeticionInvalidaException("Formato inválido (usar FOTO o VIDEO): " + valor);
    }
}
