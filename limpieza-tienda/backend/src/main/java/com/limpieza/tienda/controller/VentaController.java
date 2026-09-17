package com.limpieza.tienda.controller;

import com.limpieza.tienda.dto.CajaResumenResponse;
import com.limpieza.tienda.dto.VentaRequest;
import com.limpieza.tienda.dto.VentaResponse;
import com.limpieza.tienda.service.VentaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Caja del día: ventas de mostrador (protegido por AdminAuthInterceptor).
 */
@RestController
@RequestMapping("/api/admin/ventas")
public class VentaController {

    private final VentaService ventaService;

    public VentaController(VentaService ventaService) {
        this.ventaService = ventaService;
    }

    /** Cobra una venta de mostrador y descuenta el stock de cada variante vendida. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VentaResponse registrarVenta(@Valid @RequestBody VentaRequest request) {
        return ventaService.registrarVenta(request);
    }

    /** Resumen de ventas del día en curso (total vendido, cantidad y detalle). */
    @GetMapping("/hoy")
    public CajaResumenResponse resumenHoy() {
        return ventaService.resumenHoy();
    }
}
