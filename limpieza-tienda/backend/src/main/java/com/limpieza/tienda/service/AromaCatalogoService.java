package com.limpieza.tienda.service;

import com.limpieza.tienda.dto.AromaCatalogoDto;
import com.limpieza.tienda.exception.PeticionInvalidaException;
import com.limpieza.tienda.model.AromaCategoria;
import com.limpieza.tienda.model.AromaMarca;
import com.limpieza.tienda.repository.AromaCatalogoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Catálogo de referencia de aromas por marca y tipo de producto (pestaña
 * "🌸 Aromas" del panel admin).
 */
@Service
@Transactional(readOnly = true)
public class AromaCatalogoService {

    private final AromaCatalogoRepository aromaCatalogoRepository;

    public AromaCatalogoService(AromaCatalogoRepository aromaCatalogoRepository) {
        this.aromaCatalogoRepository = aromaCatalogoRepository;
    }

    public List<AromaCatalogoDto> listar(String marca, String categoria, String texto) {
        AromaMarca marcaEnum = parseMarca(marca);
        AromaCategoria categoriaEnum = parseCategoria(categoria);
        // Nunca null: participa en LOWER(CONCAT('%', :texto, '%')) en el repositorio,
        // y Postgres no puede resolver el tipo de un parámetro null ahí (termina
        // tratándolo como bytea). "" hace que el LIKE '%%' matchee todo.
        String textoNormalizado = (texto == null) ? "" : texto.trim();

        return aromaCatalogoRepository.buscar(marcaEnum, categoriaEnum, textoNormalizado).stream()
                .map(AromaCatalogoDto::from)
                .toList();
    }

    private AromaMarca parseMarca(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return AromaMarca.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new PeticionInvalidaException("Marca inválida: " + value);
        }
    }

    private AromaCategoria parseCategoria(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return AromaCategoria.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new PeticionInvalidaException("Categoría inválida: " + value);
        }
    }
}
