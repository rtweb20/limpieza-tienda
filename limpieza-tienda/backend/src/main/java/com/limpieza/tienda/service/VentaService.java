package com.limpieza.tienda.service;

import com.limpieza.tienda.dto.CajaResumenResponse;
import com.limpieza.tienda.dto.VentaItemRequest;
import com.limpieza.tienda.dto.VentaItemResponse;
import com.limpieza.tienda.dto.VentaRequest;
import com.limpieza.tienda.dto.VentaResponse;
import com.limpieza.tienda.exception.PeticionInvalidaException;
import com.limpieza.tienda.exception.RecursoNoEncontradoException;
import com.limpieza.tienda.model.MedioPago;
import com.limpieza.tienda.model.Variante;
import com.limpieza.tienda.model.Venta;
import com.limpieza.tienda.model.VentaItem;
import com.limpieza.tienda.repository.VarianteRepository;
import com.limpieza.tienda.repository.VentaItemRepository;
import com.limpieza.tienda.repository.VentaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Ventas de mostrador ("Caja del día"): cobro directo en el local, sin datos
 * de cliente. Sistema independiente de {@link PedidoService} (el checkout
 * público que arma el pedido para WhatsApp).
 */
@Service
public class VentaService {

    private static final ZoneId ZONA_ARGENTINA = ZoneId.of("America/Argentina/Buenos_Aires");

    private final VentaRepository ventaRepository;
    private final VentaItemRepository ventaItemRepository;
    private final VarianteRepository varianteRepository;

    public VentaService(VentaRepository ventaRepository,
                        VentaItemRepository ventaItemRepository,
                        VarianteRepository varianteRepository) {
        this.ventaRepository = ventaRepository;
        this.ventaItemRepository = ventaItemRepository;
        this.varianteRepository = varianteRepository;
    }

    /**
     * Cobra una venta de mostrador. Primero valida el stock de TODOS los
     * ítems del carrito; recién si todos son válidos se descuenta el stock,
     * para no dejar descuentos parciales si algo falla a mitad de camino.
     */
    @Transactional
    public VentaResponse registrarVenta(VentaRequest request) {
        MedioPago medioPago = parseMedioPago(request.medioPago());

        List<ItemValidado> validados = new ArrayList<>();
        for (VentaItemRequest itemReq : request.items()) {
            Variante variante = varianteRepository.findById(itemReq.varianteId())
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "Variante no encontrada: " + itemReq.varianteId()));

            if (!variante.getProducto().getId().equals(itemReq.productoId())) {
                throw new PeticionInvalidaException("La variante no corresponde al producto indicado.");
            }
            if (Boolean.FALSE.equals(variante.getActiva())) {
                throw new PeticionInvalidaException(
                        "El producto «" + variante.getProducto().getNombre() + "» no está disponible.");
            }
            if (variante.getStock() == null || variante.getStock() < itemReq.cantidad()) {
                throw new PeticionInvalidaException(
                        "Stock insuficiente para «" + variante.getProducto().getNombre()
                                + "» (" + variante.getPresentacion() + ").");
            }

            validados.add(new ItemValidado(variante, itemReq.cantidad()));
        }

        Venta venta = new Venta();
        venta.setMedioPago(medioPago);

        List<VentaItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (ItemValidado validado : validados) {
            Variante variante = validado.variante();
            BigDecimal precioUnitario = variante.precioVenta();
            BigDecimal subtotal = precioUnitario.multiply(BigDecimal.valueOf(validado.cantidad()));

            VentaItem item = new VentaItem();
            item.setVenta(venta);
            item.setProductoId(variante.getProducto().getId());
            item.setVarianteId(variante.getId());
            item.setProductoNombre(variante.getProducto().getNombre());
            item.setVarianteNombre(variante.getPresentacion());
            item.setCantidad(validado.cantidad());
            item.setPrecioUnitario(precioUnitario);
            item.setSubtotal(subtotal);
            items.add(item);

            total = total.add(subtotal);

            variante.setStock(variante.getStock() - validado.cantidad());
            varianteRepository.save(variante);
        }

        venta.setTotal(total);
        ventaRepository.save(venta);
        ventaItemRepository.saveAll(items);

        List<VentaItemResponse> itemResponses = items.stream().map(VentaItemResponse::from).toList();
        return VentaResponse.from(venta, itemResponses);
    }

    /** Resumen de ventas del día en curso, en horario de Argentina. */
    @Transactional(readOnly = true)
    public CajaResumenResponse resumenHoy() {
        ZonedDateTime inicioHoy = LocalDate.now(ZONA_ARGENTINA).atStartOfDay(ZONA_ARGENTINA);
        ZonedDateTime finHoy = inicioHoy.plusDays(1);
        OffsetDateTime desde = inicioHoy.toOffsetDateTime();
        OffsetDateTime hasta = finHoy.toOffsetDateTime();

        List<Venta> ventas = ventaRepository
                .findByCreatedAtGreaterThanEqualAndCreatedAtLessThanOrderByCreatedAtDesc(desde, hasta);

        List<VentaResponse> ventaResponses = ventas.stream()
                .map(v -> VentaResponse.from(v, ventaItemRepository.findByVentaId(v.getId()).stream()
                        .map(VentaItemResponse::from).toList()))
                .toList();

        BigDecimal totalVendido = ventas.stream()
                .map(Venta::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CajaResumenResponse(
                inicioHoy.toLocalDate().toString(),
                totalVendido,
                ventas.size(),
                ventaResponses);
    }

    private MedioPago parseMedioPago(String value) {
        try {
            return MedioPago.valueOf(value);
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new PeticionInvalidaException("Medio de pago inválido: " + value);
        }
    }

    private record ItemValidado(Variante variante, Integer cantidad) {
    }
}
