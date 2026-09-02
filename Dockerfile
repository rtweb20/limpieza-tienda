FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY limpieza-tienda/limpieza-tienda/backend/pom.xml .
COPY limpieza-tienda/limpieza-tienda/backend/src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/tienda-*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
