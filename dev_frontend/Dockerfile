# ---------- STAGE 1: Build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy source
COPY . .

# Clean dist
RUN rm -rf dist

# 1️⃣ Bundle TS
RUN npm run build:bundler

# 2️⃣ Build Tailwind CSS
RUN npm run build:css

# 3️⃣ Copy assets
RUN npm run build:assets


# Optional: list dist content for debug
RUN ls -Rla dist

# ---------- STAGE 2: Serve with Nginx ----------
FROM nginx:alpine

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: copy custom Nginx config
# COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
