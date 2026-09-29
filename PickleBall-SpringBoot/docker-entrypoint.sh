#!/bin/sh
set -e

# Port configuration (defaults to 8080 or uses Render's $PORT)
PORT="${PORT:-8080}"
echo "🚀 Khởi động PickleBall Spring Boot Backend trên cổng ${PORT}..."

# Export server port for Spring Boot
export SERVER_PORT="${PORT}"

# Execute Java JAR application with memory optimization
exec java -XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom -Dserver.port="${PORT}" -jar /app/app.jar
