# ============================================================================
#  LIMPIEZA EL BARRIO — Dockerfile multi-etapa (para Render o cualquier host)
#  Etapa 1: compila el jar con Maven (imagen con Maven incluido)
#  Etapa 2: ejecuta con un JRE liviano
#  → No necesitás tener Java ni Maven instalados: Docker se encarga de todo.
# ============================================================================

# ---------- BUILD ----------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copiamos primero el pom para cachear las dependencias
COPY backend/pom.xml .
RUN mvn -B dependency:go-offline

# Copiamos el código fuente y empaquetamos
COPY backend/src ./src
RUN mvn -B -DskipTests package

# ---------- RUN ----------
FROM eclipse-temurin:17-jre
WORKDIR /app

# El fat jar ya incluye los estáticos (index.html, admin.html, css, js)
COPY --from=build /app/target/tienda-*.jar app.jar

EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
