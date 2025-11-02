# Transcendence

Full-stack 3D Pong game: Frontend TypeScript + Tailwind + Babylon.js, Backend Fastify + Prisma/SQLite, Nginx reverse proxy with self-signed TLS. Simple deployment via Docker Compose.

## Prerequisites
- Docker and Docker Compose
- Make

## Quick Start (production via Docker)
1) Create the `.env` file at the root of the project
```env
BACKEND_PORT=3000
FRONTENT_PORT=8443
NGINX_PORT=443

IP=127.0.0.1
DATABASE_URL=file:/app/data/db.sqlite
JWT_SECRET=change_me_please
```

**Configuration variables:**
- `BACKEND_PORT`: Backend API internal port (default: 3000)
- `FRONTENT_PORT`: Host port to access the application (default: 8443)
- `NGINX_PORT`: Nginx internal port (default: 443)
- `IP`: IP address for server_name (localhost + this IP accepted)
- `DATABASE_URL`: SQLite database path
- `JWT_SECRET`: Secret key for JWT token generation (⚠️ change in production!)

2) Launch the infrastructure (Makefile)
```bash
make prod
```

3) Access the app
- URL: `https://localhost:8443` or `https://<IP>:8443` (using IP from .env)
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
- SQLite data is persisted under `./app/api` (mounted in the container at `/app/data`)
- User avatars are stored in a Docker named volume `api_public` (persisted between restarts)

## Architecture and Access
The backend API is **not directly exposed** outside the Docker infrastructure. All access goes through the Nginx reverse proxy:
- **Frontend**: Served by Nginx from the shared volume (`frontend_dist`)
- **API**: Proxied by Nginx to `http://api:${BACKEND_PORT}` (internal Docker network)
- **WebSocket**: Proxied by Nginx to `ws://api:${BACKEND_PORT}` (internal Docker network)
- **Static files** (avatars): Served from `/api/public/` route, stored in `api_public` volume

**Security:**
- Nginx has a default server block that returns 444 (connection closed) for any request not matching `localhost` or the IP defined in `.env`
- Only authorized server names can access the application
- Frontend dynamically uses `window.location.origin` for API calls (no hardcoded IP)

## Entry Points
- API: `/api`
  - Health check: `GET /api/healthcheck`
  - Static files: `/api/public/...` (e.g., avatars)
- WebSocket: `/ws` (JWT token auth)

## Accessing Swagger Documentation (for dev)
The Swagger route (`/docs`) is enabled on the backend API, but is not exposed by Nginx in production. To access it for development purposes, temporarily expose the backend port.

Add the `ports` section to the `api` service in `docker-compose.prod.yml`:
```yaml
services:
  api:
    # ...existing config...
    ports:
      - "${BACKEND_PORT}:${BACKEND_PORT}"
```
Redeploy then open:
```
http://127.0.0.1:<BACKEND_PORT>/docs
```

## Environment Variables Usage

All configuration is centralized in the `.env` file at the project root:

**Build-time variables** (passed as `args` to Dockerfiles):
- `BACKEND_PORT`: Used to set the exposed port in backend Dockerfile
- `NGINX_PORT`: Used to set the exposed port in nginx Dockerfile
- `IP`: Injected into frontend bundle for initial config (now unused, using `window.location.origin`)

**Runtime variables** (passed as `environment` to containers):
- `DATABASE_URL`: Backend database connection
- `JWT_SECRET`: Backend JWT authentication
- `IP`: Nginx server_name configuration (via `envsubst`)
- `BACKEND_PORT`: Nginx proxy_pass configuration (via `envsubst`)

**Port mapping:**
- `${FRONTENT_PORT}:${NGINX_PORT}`: Maps host port to nginx container port

## Volumes

- `frontend_dist`: Named volume for frontend build artifacts (shared between frontend and nginx)
- `api_public`: Named volume for user-uploaded files (avatars, persisted across restarts)
- `./app/api`: Bind mount for SQLite database (persistent on host)

To backup user avatars:
```bash
docker cp api:/app/public ./backup_public
```