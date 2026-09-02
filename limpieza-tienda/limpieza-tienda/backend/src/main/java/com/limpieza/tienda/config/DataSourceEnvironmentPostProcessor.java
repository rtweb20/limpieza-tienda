package com.limpieza.tienda.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

/**
 * Normaliza la config de la base de datos ANTES de crear los beans.
 * Render entrega la URL como: postgresql://usuario:clave@host:puerto/db
 * El driver JDBC necesita: jdbc:postgresql://host:puerto/db + user/pass aparte.
 */
public class DataSourceEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String dbUrl = environment.getProperty("DB_URL");
        if (dbUrl == null || dbUrl.isBlank()) {
            return; // sin DB_URL se usa el default de application.yml (desarrollo local)
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
        } catch (Exception e) {
            overrides.put("spring.datasource.url", dbUrl.trim());
        }

        environment.getPropertySources()
                .addFirst(new MapPropertySource("datasource-normalizer", overrides));
    }

    private Normalizada normalizar(String url) throws Exception {
        String sinJdbc = url.startsWith("jdbc:") ? url.substring("jdbc:".length()) : url;
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
