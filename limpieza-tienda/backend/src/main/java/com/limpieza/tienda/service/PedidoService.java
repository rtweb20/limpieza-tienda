package com.limpieza.tienda.service;

import com.limpieza.tienda.dto.PedidoItemResponse;
import com.limpieza.tienda.dto.PedidoRequest;
import com.limpieza.tienda.dto.PedidoResponse;
import com.limpieza.tienda.exception.PeticionInvalidaException;
import com.limpieza.tienda.exception.RecursoNoEncontradoException;
import com.limpieza.tienda.model.EstadoPedido;
import com.limpieza.tienda.model.MedioPago;
import com.limpieza.tienda.model.ModalidadEntrega;
import com.limpieza.tienda.model.Pedido;
import com.limpieza.tienda.model.PedidoItem;
import com.limpieza.tienda.model.Variante;
import com.limpieza.tienda.repository.PedidoItemRepository;
import com.limpieza.tienda.repository.PedidoRepository;
import com.limpieza.tienda.repository.VarianteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Creación de pedidos desde el checkout (formulario pre-WhatsApp).
 */
@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final PedidoItemRepository pedidoItemRepository;
    private final VarianteRepository varianteRepository;
    private final WhatsAppService whatsAppService;

    public PedidoService(PedidoRepository pedidoRepository,
                         PedidoItemRepository pedidoItemRepository,
                         VarianteRepository varianteRepository,
                         WhatsAppService whatsAppService) {
        this.pedidoRepository = pedidoRepository;
        this.pedidoItemRepository = pedidoItemRepository;
        this.varianteRepository = varianteRepository;
        this.whatsAppService = whatsAppService;
    }

    @Transactional
    public PedidoResponse crearPedido(PedidoRequest request) {
        ModalidadEntrega modalidad = parseModalidad(request.modalidadEntrega());
        MedioPago medioPago = parseMedioPago(request.medioPago());

        if (modalidad == ModalidadEntrega.ENVIO_DOMICILIO
                && (request.direccion() == null || request.direccion().isBlank())) {
            throw new PeticionInvalidaException("Para envío a domicilio es obligatoria la dirección.");
        }

        Pedido pedido = new Pedido();
        pedido.setNombreCliente(request.nombre().trim());
        pedido.setTelefono(trimToNull(request.telefono()));
        pedido.setDireccion(trimToNull(request.direccion()));
        pedido.setBarrio(trimToNull(request.barrio()));
        pedido.setModalidadEntrega(modalidad);
        pedido.setMedioPago(medioPago);
        pedido.setNotas(trimToNull(request.notas()));
        pedido.setEstado(EstadoPedido.NUEVO);

        List<PedidoItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (var itemReq : request.items()) {
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
            if (variante.getStock() != null && variante.getStock() < itemReq.cantidad()) {
                throw new PeticionInvalidaException(
                        "Stock insuficiente para «" + variante.getProducto().getNombre()
                                + "» (" + variante.getPresentacion() + ").");
            }

            BigDecimal precioUnitario = variante.precioVenta();
            BigDecimal subtotal = precioUnitario.multiply(BigDecimal.valueOf(itemReq.cantidad()));

            PedidoItem item = new PedidoItem();
            item.setPedido(pedido);
            item.setProductoId(variante.getProducto().getId());
            item.setVarianteId(variante.getId());
            item.setProductoNombre(variante.getProducto().getNombre());
            item.setVarianteNombre(variante.getPresentacion());
            item.setCantidad(itemReq.cantidad());
            item.setPrecioUnitario(precioUnitario);
            item.setSubtotal(subtotal);
            items.add(item);

            total = total.add(subtotal);
        }

        pedido.setTotal(total);
        pedidoRepository.save(pedido);
        pedidoItemRepository.saveAll(items);

        List<PedidoItemResponse> itemResponses = items.stream().map(PedidoItemResponse::from).toList();
        String whatsappUrl = whatsAppService.generarOrden(pedido, items).url();

        return PedidoResponse.from(pedido, itemResponses, whatsappUrl);
    }

    private ModalidadEntrega parseModalidad(String value) {
        try {
            return ModalidadEntrega.valueOf(value);
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new PeticionInvalidaException("Modalidad de entrega inválida: " + value);
        }
    }

    private MedioPago parseMedioPago(String value) {
        try {
            return MedioPago.valueOf(value);
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new PeticionInvalidaException("Medio de pago inválido: " + value);
        }
    }

    private String trimToNull(String s) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
