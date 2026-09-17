package com.limpieza.tienda.repository;

import com.limpieza.tienda.model.AromaCategoria;
import com.limpieza.tienda.model.AromaCatalogo;
import com.limpieza.tienda.model.AromaMarca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AromaCatalogoRepository extends JpaRepository<AromaCatalogo, Long> {

    /** Filtra por marca/categoría/texto; cualquiera de los tres puede venir null (sin filtrar). */
    @Query("""
            SELECT a FROM AromaCatalogo a
            WHERE (:marca IS NULL OR a.marca = :marca)
              AND (:categoria IS NULL OR a.categoria = :categoria)
              AND (:texto IS NULL OR LOWER(a.nombre) LIKE LOWER(CONCAT('%', :texto, '%')))
            ORDER BY a.categoria ASC, a.nombre ASC
            """)
    List<AromaCatalogo> buscar(@Param("marca") AromaMarca marca,
                               @Param("categoria") AromaCategoria categoria,
                               @Param("texto") String texto);
}
