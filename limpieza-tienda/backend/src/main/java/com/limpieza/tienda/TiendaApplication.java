package com.limpieza.tienda;

import com.limpieza.tienda.config.StoreProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

/**
 * Punto de entrada de la tienda "Aroma a Limpio".
 *
 * <p>Arranque local:
 * <pre>
 *   export DB_URL=jdbc:postgresql://localhost:5432/limpieza_tienda
 *   export DB_USER=postgres DB_PASSWORD=postgres
 *   ./mvnw spring-boot:run
 * </pre>
 */
@SpringBootApplication
@EnableConfigurationProperties(StoreProperties.class)
public class TiendaApplication {

    public static void main(String[] args) {
        SpringApplication.run(TiendaApplication.class, args);
    }
}
