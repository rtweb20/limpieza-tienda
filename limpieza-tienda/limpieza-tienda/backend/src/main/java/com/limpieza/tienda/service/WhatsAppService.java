package com.limpieza.tienda.service;

import com.limpieza.tienda.config.StoreProperties;
import com.limpieza.tienda.dto.OrdenWhatsAppResponse;
import com.limpieza.tienda.model.MedioPago;
import com.limpieza.tienda.model.ModalidadEntrega;
import com.limpieza.tienda.model.Pedido;
import com.limpieza.tienda.model.PedidoItem;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;

/**
 * Genera el enlace {@code https://wa.me/…} con el resumen del pedido codificado.
 * El cliente toca "Enviar pedido" y se abre WhatsApp con el mensaje ya escrito.
 */
@Service
public class WhatsAppService {

    private static final Locale AR = new Locale("es", "AR");

    private final StoreProperties properties;

    public WhatsAppService(StoreProperties properties) {
        this.properties = properties;
    }

    /** Número configurado (sin "+" ni espacios). */
    public String numero() {
        return properties.getWhatsapp().getNumber();
    }

    /** Enlace directo para consultas rápidas (botón flotante). */
    public String urlConsulta() {
        String texto = "Hola 👋, quería hacer una consulta sobre " + properties.getStore().getName() + ".";
        return buildUrl(texto);
    }

    public OrdenWhatsAppResponse generarOrden(Pedido pedido, List<PedidoItem> items) {
        String mensaje = buildMensaje(pedido, items);
        return new OrdenWhatsAppResponse(properties.getWhatsapp().getNumber(), buildUrl(mensaje), mensaje);
    }

    public String buildUrl(String mensaje) {
        return "https://wa.me/" + properties.getWhatsapp().getNumber()
                + "?text=" + URLEncoder.encode(mensaje, StandardCharsets.UTF_8);
    }

    public String buildMensaje(Pedido p, List<PedidoItem> items) {
        StringBuilder sb = new StringBuilder();

        sb.append("\uD83E\uDDFE *NUEVO PEDIDO — ").append(properties.getStore().getName()).append("*\n");
        sb.append("──────────────────\n");
        sb.append("\uD83D\uDC64 *Cliente:* ").append(p.getNombreCliente()).append('\n');
        if (notBlank(p.getTelefono())) {
            sb.append("\uD83D\uDCDE Teléfono: ").append(p.getTelefono()).append('\n');
        }
        if (notBlank(p.getDireccion())) {
            sb.append("\uD83C\uDFE0 *Dirección:* ").append(p.getDireccion()).append('\n');
        }
        if (notBlank(p.getBarrio())) {
            sb.append("\uD83D\uDCCD Barrio: ").append(p.getBarrio()).append('\n');
        }
        sb.append("\uD83D\uDEF5 *Entrega:* ").append(label(p.getModalidadEntrega())).append('\n');
        sb.append("\uD83D\uDCB3 *Pago:* ").append(label(p.getMedioPago())).append('\n');
        sb.append("──────────────────\n");
        sb.append("\uD83D\uDED2 *DETALLE DEL PEDIDO:*\n");

        int i = 1;
        for (PedidoItem item : items) {
            sb.append(i++).append(". ").append(item.getProductoNombre());
            if (notBlank(item.getVarianteNombre())) {
                sb.append(" (").append(item.getVarianteNombre()).append(')');
            }
            sb.append('\n');
            sb.append("   ").append(item.getCantidad())
                    .append(" x ").append(money(item.getPrecioUnitario()))
                    .append(" = *").append(money(item.getSubtotal())).append("*\n");
        }

        sb.append("──────────────────\n");
        sb.append("\uD83D\uDCB0 *TOTAL: ").append(money(p.getTotal())).append("*\n");

        if (notBlank(p.getNotas())) {
            sb.append("📝 Notas: ").append(p.getNotas()).append('\n');
        }
        return sb.toString();
    }

    private String label(ModalidadEntrega m) {
        return m == ModalidadEntrega.ENVIO_DOMICILIO ? "Envío a domicilio" : "Retiro en local";
    }

    private String label(MedioPago m) {
        return switch (m) {
            case EFECTIVO -> "Efectivo";
            case TRANSFERENCIA -> "Transferencia";
            case MERCADO_PAGO -> "Mercado Pago";
        };
    }

    /** Formatea a moneda argentina: 12345.50 → "$ 12.345,50". */
    private String money(BigDecimal v) {
        if (v == null) {
            v = BigDecimal.ZERO;
        }
        return "$ " + NumberFormat.getNumberInstance(AR).format(v);
    }

    private boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }
}
