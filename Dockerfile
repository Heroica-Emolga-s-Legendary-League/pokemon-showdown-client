FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build
# Fail the image build immediately if the critical output is missing
RUN test -f play.pokemonshowdown.com/index.html || \
    (echo "ERROR: npm run build did not produce play.pokemonshowdown.com/index.html" && exit 1)

FROM php:8.2-apache

WORKDIR /var/www/html

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
RUN a2enmod rewrite headers expires
COPY docker/apache/000-default.conf /etc/apache2/sites-available/000-default.conf

COPY --from=build /app /var/www/html

EXPOSE 80

# Verify Apache is actually serving the testclient entry point over HTTP.
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -fsSL http://localhost/testclient.html -o /dev/null || exit 1
