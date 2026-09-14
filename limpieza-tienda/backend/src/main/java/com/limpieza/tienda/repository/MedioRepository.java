package com.limpieza.tienda.repository;

import com.limpieza.tienda.model.Medio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedioRepository extends JpaRepository<Medio, Long> {

    List<Medio> findAllByOrderByOrdenAscIdAsc();

    List<Medio> findByActivoTrueOrderByOrdenAscIdAsc();
}
