DockerComposeFile 	= ./docker-compose.dev.yml

### PROD ###
# apiVolume 		= ./app/api
# frontendVolume 	= ./app/frontend
# folderVolume = ./app
# API_DOCKER_VOLUME	= transcendence_api
# FRONTEND_DOCKER_VOLUME	= transcendence_nginx

### DEV SYNC ###
backendNodeModules = ./dev_backend/node_modules
backendDb = ./dev_backend/prisma/db.sqlite*
backendPrismaMigration = ./dev_backend/prisma/migrations
backendPrismaGenerated = ./dev_backend/src/generated
backendAvatars = ./dev_backend/public/avatars/avatar_*
frontendNodeModules = ./dev_frontend/node_modules
frontendDist = ./dev_frontend/dist


### DEV ###

dev: dev-up

dev-up:
	cd dev_backend && pnpm install
	cd dev_backend && npx prisma migrate dev --name init
	cd dev_frontend && pnpm install
	docker compose -f $(DockerComposeFile) up -d --build

dev-down:
	docker compose -f $(DockerComposeFile) down

dev-stop:
	docker compose -f $(DockerComposeFile) stop

dev-start:
	docker compose -f $(DockerComposeFile) start

dev-clean: dev-down
	docker container prune --force
	docker image prune --all --force

dev-fclean: dev-clean
	rm -rdf $(backendNodeModules)
	rm -rdf $(backendDb)
	rm -rdf $(backendPrismaMigration)
	rm -rdf $(backendPrismaGenerated)
	rm -f $(backendAvatars)
	rm -rdf $(frontendNodeModules)
	rm -rdf $(frontendDist)
	docker volume prune --all --force

dev-re: dev-fclean dev

.PHONY: dev dev-up dev-down dev-stop dev-start dev-clean dev-fclean dev-re