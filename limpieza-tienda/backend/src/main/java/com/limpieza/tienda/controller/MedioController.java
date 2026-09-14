package com.limpieza.tienda.controller;

import com.limpieza.tienda.dto.MedioDto;
import com.limpieza.tienda.service.MedioService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * API pública de medios: fotos/video del local y publicidad de marcas
 * activos, para la home de la tienda (sin autenticación).
 */
@RestController
@RequestMapping("/api")
public class MedioController {

    private final MedioService medioService;

    public MedioController(MedioService medioService) {
        this.medioService = medioService;
    }

    @GetMapping("/medios")
    public List<MedioDto> medios() {
        return medioService.listarPublicos();
    }
}
