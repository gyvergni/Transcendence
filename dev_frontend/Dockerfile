# ---------- STAGE 1: Build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm@latest-10
RUN pnpm install

# Copy source code
COPY . .

# Clean dist
RUN rm -rf dist

# 1️⃣ Bundle TS
RUN pnpm run build:bundler

# 2️⃣ Build Tailwind CSS
RUN pnpm run build:css

# 3️⃣ Copy assets
RUN pnpm run build:assets

# Optional: list dist content for debug
RUN ls -Rla dist

# ---------- STAGE 2: Serve with Nginx ----------
FROM debian:bookworm

# Install system dependencies including Node.js
RUN apt update && apt upgrade -y && \
    apt install -y nginx curl sudo openssl && \
    curl -fsSL https://deb.nodesource.com/setup_21.x | bash - && \
    apt install -y nodejs && \
    npm install -g pnpm && \
    rm -rf /var/lib/apt/lists/*

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create SSL directory and generate certificates
RUN mkdir -p /etc/nginx/ssl

RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -out /etc/nginx/ssl/inception-certificate.crt \
    -keyout /etc/nginx/ssl/inception-key.key \
    -subj "/C=FR/ST=ARA/L=lyon/O=42/OU=42/CN=transcendence.42.fr"

# Copy custom Nginx config
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 443

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]