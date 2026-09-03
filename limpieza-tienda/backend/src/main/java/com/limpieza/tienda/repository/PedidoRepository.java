package com.limpieza.tienda.repository;

import com.limpieza.tienda.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    List<Pedido> findAllByOrderByCreatedAtDesc();
}
