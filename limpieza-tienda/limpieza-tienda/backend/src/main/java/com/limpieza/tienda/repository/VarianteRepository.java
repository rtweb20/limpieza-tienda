package com.limpieza.tienda.repository;

import com.limpieza.tienda.model.Variante;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VarianteRepository extends JpaRepository<Variante, Long> {

    List<Variante> findByProductoIdOrderByOrdenAsc(Long productoId);

    void deleteByProductoId(Long productoId);
}
