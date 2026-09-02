package com.limpieza.tienda.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Propiedades de configuración de la tienda (prefijo {@code app.*}).
 *
 * <p>Se sobreescriben con variables de entorno:
 * <ul>
 *   <li>{@code ADMIN_USERNAME} / {@code ADMIN_PASSWORD} → credenciales del backoffice</li>
 *   <li>{@code WHATSAPP_NUMBER} → número de WhatsApp destino (sin "+" ni espacios)</li>
 *   <li>{@code STORE_NAME} → nombre comercial mostrado en los mensajes</li>
 * </ul>
 */
@ConfigurationProperties(prefix = "app")
public class StoreProperties {

    private final Admin admin = new Admin();
    private final WhatsApp whatsapp = new WhatsApp();
    private final Store store = new Store();

    public Admin getAdmin() {
        return admin;
    }

    public WhatsApp getWhatsapp() {
        return whatsapp;
    }

    public Store getStore() {
        return store;
    }

    public static class Admin {
        private String username = "admin";
        private String password = "admin123";

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class WhatsApp {
        private String number = "5492612578860";

        public String getNumber() {
            return number;
        }

        public void setNumber(String number) {
            this.number = number;
        }
    }

    public static class Store {
        private String name = "Limpieza El Barrio";

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}
