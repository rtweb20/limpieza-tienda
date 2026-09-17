package com.limpieza.tienda.repository;

import com.limpieza.tienda.model.VentaItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VentaItemRepository extends JpaRepository<VentaItem, Long> {

    List<VentaItem> findByVentaId(Long ventaId);
}
