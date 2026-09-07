package com.limpieza.tienda.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.limpieza.tienda.config.StoreProperties;
import com.limpieza.tienda.dto.AiAskResponse;
import com.limpieza.tienda.dto.ProductoDto;
import com.limpieza.tienda.dto.VarianteDto;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiInventoryService {

    private static final URI OPENAI_RESPONSES_URL = URI.create("https://api.openai.com/v1/responses");

    private final AdminService adminService;
    private final StoreProperties properties;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public AiInventoryService(AdminService adminService,
                              StoreProperties properties,
                              ObjectMapper objectMapper) {
        this.adminService = adminService;
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public AiAskResponse responder(String pregunta) {
        List<ProductoDto> productos = adminService.listarProductos();
        String apiKey = properties.getAi().getOpenaiApiKey();

        if (apiKey == null || apiKey.isBlank()) {
            return new AiAskResponse(respuestaLocal(productos), false, "analisis-local");
        }

        try {
            String modelo = properties.getAi().getModel();
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("model", modelo);
            body.put("instructions", """
                    Sos un asistente para el administrador de una tienda de articulos de limpieza.
                    Responde en espanol rioplatense, breve y accionable.
                    Usa solo los datos de inventario recibidos. Si falta un dato, aclaralo.
                    Priorizá stock bajo, productos inactivos, oportunidades de oferta y valor del inventario.
                    """);
            body.put("input", "Pregunta del administrador: " + pregunta + "\n\nInventario:\n" + inventarioTexto(productos));
            body.put("max_output_tokens", 700);

            HttpRequest request = HttpRequest.newBuilder(OPENAI_RESPONSES_URL)
                    .timeout(Duration.ofSeconds(30))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return new AiAskResponse("No pude consultar la IA ahora. " + respuestaLocal(productos), false, "analisis-local");
            }

            String texto = extraerTexto(response.body());
            if (texto == null || texto.isBlank()) {
                texto = respuestaLocal(productos);
                return new AiAskResponse(texto, false, "analisis-local");
            }
            return new AiAskResponse(texto.trim(), true, modelo);
        } catch (Exception e) {
            return new AiAskResponse("No pude consultar la IA ahora. " + respuestaLocal(productos), false, "analisis-local");
        }
    }

    private String extraerTexto(String json) throws Exception {
        JsonNode root = objectMapper.readTree(json);
        JsonNode outputText = root.path("output_text");
        if (outputText.isTextual()) {
            return outputText.asText();
        }

        StringBuilder sb = new StringBuilder();
        for (JsonNode output : root.path("output")) {
            for (JsonNode content : output.path("content")) {
                JsonNode text = content.path("text");
                if (text.isTextual()) {
                    if (!sb.isEmpty()) sb.append('\n');
                    sb.append(text.asText());
                }
            }
        }
        return sb.toString();
    }

    private String inventarioTexto(List<ProductoDto> productos) {
        StringBuilder sb = new StringBuilder();
        for (ProductoDto p : productos) {
            sb.append("- ")
                    .append(p.nombre())
                    .append(" | categoria: ").append(valor(p.categoriaNombre()))
                    .append(" | activo: ").append(Boolean.TRUE.equals(p.activo()) ? "si" : "no")
                    .append(" | destacado: ").append(Boolean.TRUE.equals(p.destacado()) ? "si" : "no")
                    .append('\n');
            for (VarianteDto v : p.variantes()) {
                sb.append("  * ")
                        .append(valor(v.presentacion()))
                        .append(" | precio: ").append(v.precioVenta())
                        .append(" | stock: ").append(v.stock())
                        .append('\n');
            }
        }
        return sb.toString();
    }

    private String respuestaLocal(List<ProductoDto> productos) {
        int totalProductos = productos.size();
        int totalVariantes = productos.stream().mapToInt(p -> p.variantes().size()).sum();
        BigDecimal valorStock = productos.stream()
                .flatMap(p -> p.variantes().stream())
                .map(v -> v.precioVenta().multiply(BigDecimal.valueOf(v.stock() == null ? 0 : v.stock())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<String> stockBajo = productos.stream()
                .flatMap(p -> p.variantes().stream()
                        .filter(v -> v.stock() != null && v.stock() <= 5)
                        .map(v -> p.nombre() + " (" + valor(v.presentacion()) + "): " + v.stock()))
                .sorted()
                .limit(8)
                .toList();

        List<String> sinStock = productos.stream()
                .flatMap(p -> p.variantes().stream()
                        .filter(v -> v.stock() != null && v.stock() <= 0)
                        .map(v -> p.nombre() + " (" + valor(v.presentacion()) + ")"))
                .sorted()
                .limit(8)
                .toList();

        List<String> masStock = productos.stream()
                .flatMap(p -> p.variantes().stream()
                        .map(v -> Map.entry(p.nombre() + " (" + valor(v.presentacion()) + ")", v.stock() == null ? 0 : v.stock())))
                .sorted(Map.Entry.<String, Integer>comparingByValue(Comparator.reverseOrder()))
                .limit(5)
                .map(e -> e.getKey() + ": " + e.getValue())
                .toList();

        StringBuilder sb = new StringBuilder();
        sb.append("Resumen rapido: tenes ")
                .append(totalProductos).append(" productos y ")
                .append(totalVariantes).append(" variantes. Valor estimado del stock: $")
                .append(valorStock.stripTrailingZeros().toPlainString()).append(". ");

        if (!sinStock.isEmpty()) {
            sb.append("Sin stock: ").append(String.join(", ", sinStock)).append(". ");
        }
        if (!stockBajo.isEmpty()) {
            sb.append("Stock bajo: ").append(String.join(", ", stockBajo)).append(". ");
        }
        if (!masStock.isEmpty()) {
            sb.append("Mayor stock: ").append(String.join(", ", masStock)).append(".");
        }
        return sb.toString();
    }

    private String valor(String value) {
        return value == null || value.isBlank() ? "sin dato" : value;
    }
}
