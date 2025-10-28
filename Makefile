DockerComposeProdFile   = ./docker-compose.prod.yml

### PROD ###
apiVolume 		= ./app/api
folderVolume = ./app
FRONTEND_DOCKER_VOLUME	= $(shell basename $(CURDIR) | tr '[:upper:]' '[:lower:]')_frontend_dist

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
	docker volume rm $(FRONTEND_DOCKER_VOLUME) || true
	rm -rdf $(apiVolume)
	rm -rdf $(folderVolume)
	docker volume prune --all --force

prod-re: prod-fclean prod


.PHONY: prod prod-up prod-down prod-stop prod-start prod-clean prod-fclean prod-re
