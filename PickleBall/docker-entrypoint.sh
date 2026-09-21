#!/bin/bash
set -e

# Configure Apache port based on Render's PORT environment variable
PORT="${PORT:-80}"
echo "Configuring Apache to listen on port ${PORT}..."
sed -i "s/Listen 80/Listen ${PORT}/" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:80>/<VirtualHost \*:${PORT}>/" /etc/apache2/sites-available/000-default.conf

# Ensure required storage and cache directories exist with correct permissions
mkdir -p /var/www/html/storage/framework/cache/data
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/storage/logs
mkdir -p /var/www/html/bootstrap/cache

chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Generate app key if not set
if [ -z "$APP_KEY" ]; then
    echo "APP_KEY is empty, generating one..."
    php artisan key:generate --force
fi

# Run database migrations if DB_HOST is set
if [ -n "$DB_HOST" ]; then
    echo "Running database migrations..."
    php artisan migrate --force || echo "Warning: Migration failed, continuing startup..."

    # If RUN_SEEDERS=true is set in Render environment, run the OfficialCatalogSeeder
    if [ "$RUN_SEEDERS" = "true" ]; then
        echo "Running OfficialCatalogSeeder..."
        php artisan db:seed --class=OfficialCatalogSeeder --force || echo "Warning: Seeder failed, continuing..."
    fi
fi

# Clear and optimize Laravel caches
php artisan config:clear || true
php artisan route:clear || true

echo "Starting Apache web server on port ${PORT}..."
exec apache2-foreground
