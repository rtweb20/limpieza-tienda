package com.limpieza.tienda.repository;

import com.limpieza.tienda.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    List<Categoria> findAllByOrderByOrdenAsc();

    List<Categoria> findByActivaTrueOrderByOrdenAsc();

    Optional<Categoria> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
