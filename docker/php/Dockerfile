FROM php:8.3-fpm-alpine

# Системные зависимости
RUN apk add --no-cache \
    linux-headers \
    $PHPIZE_DEPS \
    git \
    curl \
    libpng-dev \
    libzip-dev \
    oniguruma-dev \
    icu-dev \
    unzip

# PHP расширения
RUN docker-php-ext-install \
    pdo_mysql \
    mbstring \
    zip \
    intl \
    exif \
    pcntl \
    bcmath \
    gd

# Redis расширение
RUN pecl install redis && docker-php-ext-enable redis

# Opcache
RUN docker-php-ext-install opcache
COPY opcache.ini /usr/local/etc/php/conf.d/opcache.ini

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/backend

# Права
RUN addgroup -g 1000 appgroup && adduser -u 1000 -G appgroup -s /bin/sh -D appuser
USER appuser