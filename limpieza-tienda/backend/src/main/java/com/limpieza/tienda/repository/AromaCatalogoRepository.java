package com.limpieza.tienda.repository;

import com.limpieza.tienda.model.AromaCategoria;
import com.limpieza.tienda.model.AromaCatalogo;
import com.limpieza.tienda.model.AromaMarca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AromaCatalogoRepository extends JpaRepository<AromaCatalogo, Long> {

    /**
     * Filtra por marca/categoría/texto; marca y categoría pueden venir null
     * (sin filtrar). "texto" NUNCA debe venir null: a diferencia de marca y
     * categoría, participa en un LOWER(CONCAT(...)) y Postgres no puede
     * resolver el tipo de un parámetro null dentro de esa concatenación (lo
     * termina tratando como bytea y falla con "function lower(bytea) does
     * not exist"). Por eso el servicio siempre manda "" cuando no hay
     * búsqueda de texto, y el LIKE '%%' resultante matchea todo.
     */
    @Query("""
            SELECT a FROM AromaCatalogo a
            WHERE (:marca IS NULL OR a.marca = :marca)
              AND (:categoria IS NULL OR a.categoria = :categoria)
              AND LOWER(a.nombre) LIKE LOWER(CONCAT('%', :texto, '%'))
            ORDER BY a.categoria ASC, a.nombre ASC
            """)
    List<AromaCatalogo> buscar(@Param("marca") AromaMarca marca,
                               @Param("categoria") AromaCategoria categoria,
                               @Param("texto") String texto);
}
