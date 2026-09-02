package com.limpieza.tienda.repository;

import com.limpieza.tienda.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    /** Catálogo completo (activos) con categoría y variantes en una sola consulta. */
    @Query("""
            SELECT DISTINCT p FROM Producto p
            LEFT JOIN FETCH p.categoria c
            LEFT JOIN FETCH p.variantes v
            WHERE p.activo = true AND v.activa = true
            ORDER BY p.nombre ASC
            """)
    List<Producto> findCatalogo();

    /** Productos de una categoría (activos). */
    @Query("""
            SELECT DISTINCT p FROM Producto p
            LEFT JOIN FETCH p.categoria c
            LEFT JOIN FETCH p.variantes v
            WHERE p.activo = true AND v.activa = true AND c.slug = :slug
            ORDER BY p.nombre ASC
            """)
    List<Producto> findByCategoriaSlug(@Param("slug") String slug);

    /** Productos destacados para el banner "Combos y Ofertas". */
    @Query("""
            SELECT DISTINCT p FROM Producto p
            LEFT JOIN FETCH p.categoria c
            LEFT JOIN FETCH p.variantes v
            WHERE p.activo = true AND v.activa = true AND p.destacado = true
            ORDER BY p.nombre ASC
            """)
    List<Producto> findDestacados();

    /** Búsqueda con autocompletado (nombre o descripción). */
    @Query("""
            SELECT DISTINCT p FROM Producto p
            LEFT JOIN FETCH p.categoria c
            LEFT JOIN FETCH p.variantes v
            WHERE p.activo = true AND v.activa = true
              AND (LOWER(p.nombre) LIKE LOWER(CONCAT('%', :q, '%'))
                   OR LOWER(COALESCE(p.descripcion, '')) LIKE LOWER(CONCAT('%', :q, '%')))
            ORDER BY p.nombre ASC
            """)
    List<Producto> search(@Param("q") String q);

    Optional<Producto> findBySlug(String slug);

    boolean existsBySlug(String slug);

    long countByCategoriaId(Long categoriaId);

    /** Lista para el backoffice: todos los productos con categoría y variantes. */
    @Query("""
            SELECT DISTINCT p FROM Producto p
            LEFT JOIN FETCH p.categoria c
            LEFT JOIN FETCH p.variantes v
            ORDER BY p.nombre ASC
            """)
    List<Producto> findAllConVariantes();
}
