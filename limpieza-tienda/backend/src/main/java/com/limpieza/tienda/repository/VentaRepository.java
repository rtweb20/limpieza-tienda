package com.limpieza.tienda.repository;

import com.limpieza.tienda.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;

public interface VentaRepository extends JpaRepository<Venta, Long> {

    List<Venta> findByCreatedAtGreaterThanEqualAndCreatedAtLessThanOrderByCreatedAtDesc(
            OffsetDateTime desde, OffsetDateTime hasta);
}
