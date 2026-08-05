FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

FROM php:8.2-apache

WORKDIR /var/www/html

RUN a2enmod rewrite headers expires
COPY docker/apache/000-default.conf /etc/apache2/sites-available/000-default.conf

COPY --from=build /app /var/www/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD php -r "exit(file_exists('/var/www/html/play.pokemonshowdown.com/index.html') ? 0 : 1);"
