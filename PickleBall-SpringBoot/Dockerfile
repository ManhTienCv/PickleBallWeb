# ── Stage 1: Build JAR with Maven & Eclipse Temurin JDK 21 ──
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Copy pom.xml and cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and package application
COPY src ./src
RUN mvn clean package -DskipTests -B

# ── Stage 2: Lightweight Runtime with JRE 21 ──
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Configure timezone to Asia/Ho_Chi_Minh
RUN apk add --no-cache bash curl tzdata \
    && cp /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime \
    && echo "Asia/Ho_Chi_Minh" > /etc/timezone

# Security: run as non-root user
RUN addgroup -S spring && adduser -S spring -G spring

# Copy compiled JAR artifact and entrypoint
COPY --from=builder /build/target/pickleball-backend-1.0.0.jar /app/app.jar
COPY docker-entrypoint.sh /app/docker-entrypoint.sh

RUN chmod +x /app/docker-entrypoint.sh && chown -R spring:spring /app

USER spring:spring

EXPOSE 8080

ENTRYPOINT ["/app/docker-entrypoint.sh"]
