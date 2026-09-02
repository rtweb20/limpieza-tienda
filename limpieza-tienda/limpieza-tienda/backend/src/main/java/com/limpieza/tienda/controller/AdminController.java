package com.limpieza.tienda.controller;

import com.limpieza.tienda.dto.CategoriaDto;
import com.limpieza.tienda.dto.CategoriaRequest;
import com.limpieza.tienda.dto.LoginRequest;
import com.limpieza.tienda.dto.PedidoEstadoRequest;
import com.limpieza.tienda.dto.PedidoResponse;
import com.limpieza.tienda.dto.ProductoDto;
import com.limpieza.tienda.dto.ProductoUpsertRequest;
import com.limpieza.tienda.service.AdminService;
import com.limpieza.tienda.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Panel de administración (protegido por {@code AdminAuthInterceptor}).
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final AuthService authService;

    public AdminController(AdminService adminService, AuthService authService) {
        this.adminService = adminService;
        this.authService = authService;
    }

    // ---------------- Auth ----------------

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody LoginRequest request) {
        return Map.of("token", authService.login(request));
    }

    // ---------------- Categorías ----------------

    @GetMapping("/categorias")
    public List<CategoriaDto> categorias() {
        return adminService.listarCategorias();
    }

    @PostMapping("/categorias")
    @ResponseStatus(HttpStatus.CREATED)
    public CategoriaDto crearCategoria(@Valid @RequestBody CategoriaRequest request) {
        return adminService.crearCategoria(request);
    }

    @PutMapping("/categorias/{id}")
    public CategoriaDto actualizarCategoria(@PathVariable Long id,
                                            @Valid @RequestBody CategoriaRequest request) {
        return adminService.actualizarCategoria(id, request);
    }

    @DeleteMapping("/categorias/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarCategoria(@PathVariable Long id) {
        adminService.eliminarCategoria(id);
    }

    // ---------------- Productos ----------------

    @GetMapping("/productos")
    public List<ProductoDto> productos() {
        return adminService.listarProductos();
    }

    @PostMapping("/productos")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductoDto crearProducto(@Valid @RequestBody ProductoUpsertRequest request) {
        return adminService.crearProducto(request);
    }

    @PutMapping("/productos/{id}")
    public ProductoDto actualizarProducto(@PathVariable Long id,
                                          @Valid @RequestBody ProductoUpsertRequest request) {
        return adminService.actualizarProducto(id, request);
    }

    @DeleteMapping("/productos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarProducto(@PathVariable Long id) {
        adminService.eliminarProducto(id);
    }

    // ---------------- Pedidos ----------------

    @GetMapping("/pedidos")
    public List<PedidoResponse> pedidos() {
        return adminService.listarPedidosConItems();
    }

    @PatchMapping("/pedidos/{id}/estado")
    public PedidoResponse cambiarEstado(@PathVariable Long id,
                                        @Valid @RequestBody PedidoEstadoRequest request) {
        return PedidoResponse.from(adminService.cambiarEstado(id, request), List.of(), null);
    }
}
