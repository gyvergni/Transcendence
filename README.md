# Transcendence

Full-stack 3D Pong game: Frontend TypeScript + Tailwind + Babylon.js, Backend Fastify + Prisma/SQLite, Nginx reverse proxy with self-signed TLS. Simple deployment via Docker Compose.

## Prerequisites
- Docker and Docker Compose
- Make

## Quick Start (production via Docker)
1) Create the `backend/.env.prod` file
```
JWT_SECRET="change_me_please"
DATABASE_URL="file:/app/data/prod.db"
```

2) Launch the infrastructure (Makefile)
```
make prod
```

3) Access the app
- URL: https://127.0.0.1:8443
- Accept the security exception (self-signed certificate)

## Available Make Commands
- `make prod` or `make prod-up`: Build and start all containers in detached mode
- `make prod-down`: Stop and remove containers
- `make prod-stop`: Stop containers without removing them
- `make prod-start`: Restart stopped containers (without rebuild)
- `make prod-clean`: Stop containers + clean unused images and containers
- `make prod-fclean`: Full cleanup (volumes, networks, data) ⚠️ **Deletes all data**
- `make prod-re`: Complete rebuild

Notes:
- SQLite data is persisted under `./app/api` (mounted in the container at `/app/data`).

## Architecture and Access
The backend API (port 3000) is **not directly exposed** outside the Docker infrastructure. All access goes through the Nginx reverse proxy (port 8443 on the host):
- Frontend: served by Nginx from the shared volume
- API: proxied by Nginx to `http://api:3000` (internal Docker network)
- WebSocket: proxied by Nginx to `ws://api:3000` (internal Docker network)

To access the backend directly (e.g., Swagger, debugging), you need to map port 3000 in `docker-compose.prod.yml` (see section below).

## Entry Points
- API: `/api`
  - Health check: `GET /api/healthcheck`
  - Static files: `/api/public/...` (e.g., avatars)
- WebSocket: `/ws` (JWT token auth)

## Accessing Swagger Documentation (for dev)
The Swagger route (`/docs`) is enabled on the backend API, but is not exposed by Nginx in production. To access it for development purposes, map the backend port 3000 to the host, then open the API service local page.

Simple option: add the `ports` section to the `api` service in `docker-compose.prod.yml` (temporarily for dev):
```yaml
services:
  api:
    # ...existing config...
    ports:
      - "3000:3000"
```
Redeploy then open:
```
http://127.0.0.1:3000/docs
```