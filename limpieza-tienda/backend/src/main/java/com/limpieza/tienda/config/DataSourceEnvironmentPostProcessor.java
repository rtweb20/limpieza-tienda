package com.limpieza.tienda.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

/**
 * Normaliza la configuración de la base de datos ANTES de que se cree ningún
 * bean, para que el despliegue en Render funcione sin fricción.
 *
 * <p>Render entrega la "Internal Database URL" con este formato:
 * {@code postgresql://usuario:clave@host:puerto/nombrebd}
 *
 * <p>El driver JDBC de PostgreSQL NO acepta ese formato tal cual: necesita
 * {@code jdbc:postgresql://host:puerto/nombrebd} con usuario y clave por
 * separado. Este postprocessor se encarga de:
 * <ul>
 *   <li>Anteponer {@code jdbc:} si falta.</li>
 *   <li>Separar usuario/clave de la URL (si vienen incrustados) y exponerlos
 *       como {@code spring.datasource.username/password} cuando
 *       {@code DB_USER}/{@code DB_PASSWORD} no están definidos.</li>
 *   <li>Reconstruir la URL limpia (sin credenciales incrustadas).</li>
 * </ul>
 *
 * <p>Si {@code DB_URL} está vacía o ausente, falla rápido con un mensaje
 * claro (en lugar del confuso "Failed to configure a DataSource").
 *
 * <p>Se registra en {@code META-INF/spring.factories}.
 */
public class DataSourceEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String dbUrl = environment.getProperty("DB_URL");

        // Fallback: Render inyecta automáticamente DATABASE_URL al vincular la base.
        if (dbUrl == null || dbUrl.isBlank()) {
            dbUrl = environment.getProperty("DATABASE_URL");
        }

        if (dbUrl == null || dbUrl.isBlank()) {
            System.out.println("[BD] ❌ DB_URL está vacía o no definida.");
            throw new IllegalStateException(
                    "Falta la variable de entorno DB_URL. En Render: abre tu Web Service → "
                    + "pestaña Environment → agregá DB_URL con la \"Internal Database URL\" "
                    + "de tu base PostgreSQL (se copia desde la página de la base). "
                    + "Localmente: export DB_URL=jdbc:postgresql://localhost:5432/limpieza_tienda");
        }

        String user = environment.getProperty("DB_USER");
        String pass = environment.getProperty("DB_PASSWORD");

        Map<String, Object> overrides = new HashMap<>();
        try {
            Normalizada n = normalizar(dbUrl.trim());

            overrides.put("spring.datasource.url", n.url);
            if ((user == null || user.isBlank()) && n.username != null) {
                overrides.put("spring.datasource.username", n.username);
            }
            if ((pass == null || pass.isBlank()) && n.password != null) {
                overrides.put("spring.datasource.password", n.password);
            }

            // Log de diagnóstico (sin exponer la contraseña)
            System.out.println("[BD] ✔ DB_URL detectada → " + n.url);
            System.out.println("[BD] ✔ Usuario: " + (user != null && !user.isBlank() ? user : n.username));
        } catch (Exception e) {
            System.out.println("[BD] ⚠ No se pudo parsear DB_URL, se usa tal cual: " + dbUrl);
            overrides.put("spring.datasource.url", dbUrl.trim());
        }

        environment.getPropertySources()
                .addFirst(new MapPropertySource("datasource-normalizer", overrides));
    }

    /** URL JDBC limpia + credenciales extraídas. */
    private Normalizada normalizar(String url) throws Exception {
        String sinJdbc = url.startsWith("jdbc:") ? url.substring("jdbc:".length()) : url;
        // Ahora algo como: postgresql://user:pass@host:5432/db
        URI uri = new URI(sinJdbc);

        String host = uri.getHost();
        int port = uri.getPort();
        String path = uri.getPath();
        String database = (path == null || path.isBlank() || path.equals("/"))
                ? "" : path.replaceFirst("^/", "");

        StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://").append(host);
        if (port > 0) {
            jdbcUrl.append(':').append(port);
        }
        if (!database.isBlank()) {
            jdbcUrl.append('/').append(database);
        }

        String username = null;
        String password = null;
        String userInfo = uri.getUserInfo();
        if (userInfo != null && !userInfo.isBlank()) {
            int colon = userInfo.indexOf(':');
            username = colon < 0 ? userInfo : userInfo.substring(0, colon);
            password = colon < 0 ? "" : userInfo.substring(colon + 1);
        }

        return new Normalizada(jdbcUrl.toString(), username, password);
    }

    private record Normalizada(String url, String username, String password) {
    }
}
