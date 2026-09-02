package com.limpieza.tienda.controller;

import com.limpieza.tienda.dto.OrdenWhatsAppResponse;
import com.limpieza.tienda.dto.PedidoRequest;
import com.limpieza.tienda.dto.PedidoResponse;
import com.limpieza.tienda.service.PedidoService;
import com.limpieza.tienda.service.WhatsAppService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Checkout y generación del enlace de WhatsApp.
 */
@RestController
@RequestMapping("/api")
public class PedidoController {

    private final PedidoService pedidoService;
    private final WhatsAppService whatsAppService;

    public PedidoController(PedidoService pedidoService, WhatsAppService whatsAppService) {
        this.pedidoService = pedidoService;
        this.whatsAppService = whatsAppService;
    }

    /** Crea el pedido (persistido) y devuelve el enlace de WhatsApp listo. */
    @PostMapping("/pedidos")
    @ResponseStatus(HttpStatus.CREATED)
    public PedidoResponse crearPedido(@Valid @RequestBody PedidoRequest request) {
        return pedidoService.crearPedido(request);
    }

    /** Datos de WhatsApp para el botón flotante de consultas. */
    @GetMapping("/whatsapp")
    public OrdenWhatsAppResponse whatsapp() {
        return new OrdenWhatsAppResponse(whatsAppService.numero(), whatsAppService.urlConsulta(), null);
    }
}
