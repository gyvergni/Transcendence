DockerComposeDevFile 	= ./docker-compose.dev.yml
DockerComposeProdFile   = ./docker-compose.prod.yml

### PROD ###
apiVolume 		= ./app/api
frontendVolume 	= ./app/frontend
folderVolume = ./app
API_DOCKER_VOLUME	= transcendence_api
FRONTEND_DOCKER_VOLUME	= transcendence_frontend_dist

### DEV SYNC ###
backendNodeModules = ./dev_backend/node_modules
backendDb = ./dev_backend/prisma/db.sqlite*
backendPrismaMigration = ./dev_backend/prisma/migrations
backendPrismaGenerated = ./dev_backend/src/generated
backendAvatars = ./dev_backend/public/avatars/avatar_*
frontendNodeModules = ./dev_frontend/node_modules
frontendDist = ./dev_frontend/dist


### DEV ###

dev: 
	cd dev_backend && pnpm install
	cd dev_backend && npx prisma migrate dev --name init
	cd dev_frontend && pnpm install
	make dev-up

dev-up:
	docker compose -f $(DockerComposeDevFile) up -d --build

dev-down:
	docker compose -f $(DockerComposeDevFile) down

dev-stop:
	docker compose -f $(DockerComposeDevFile) stop

dev-start:
	docker compose -f $(DockerComposeDevFile) start

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

### PROD ###

prod:
	mkdir -p $(apiVolume)
	docker compose -f $(DockerComposeProdFile) up -d --build

prod-up:
	docker compose -f $(DockerComposeProdFile) up -d --build

prod-down:
	docker compose -f $(DockerComposeProdFile) down

prod-stop:
	docker compose -f $(DockerComposeProdFile) stop

prod-start:
	docker compose -f $(DockerComposeProdFile) start

prod-clean: prod-down
	docker container prune --force
	docker image prune --all --force

prod-fclean: prod-clean
	docker volume rm $(API_DOCKER_VOLUME) || true
	docker volume rm $(FRONTEND_DOCKER_VOLUME) || true
	rm -rdf $(apiVolume)
	rm -rdf $(frontendVolume)
	rm -rdf $(folderVolume)
	docker volume prune --all --force

prod-re: prod-fclean prod


.PHONY: dev dev-up dev-down dev-stop dev-start dev-clean dev-fclean dev-re \
		prod prod-up prod-down prod-stop prod-start prod-clean prod-fclean prod-re
