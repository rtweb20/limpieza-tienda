package com.limpieza.tienda.repository;

import com.limpieza.tienda.model.Imagen;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImagenRepository extends JpaRepository<Imagen, Long> {
}
