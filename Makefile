DockerComposeProdFile   = ./docker-compose.prod.yml

### PROD ###
apiVolume 		= ./app/api
folderVolume = ./app
FRONTEND_DOCKER_VOLUME	= transcendence_frontend_dist

check-env:
	@if [ ! -f ./.env ]; then \
		echo "Error: File ./.env is missing!"; \
		exit 1; \
	fi

prod: check-env
	mkdir -p $(apiVolume)
	docker compose -f $(DockerComposeProdFile) up -d --build

prod-up: check-env
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


.PHONY: prod prod-up prod-down prod-stop prod-start prod-clean prod-fclean prod-re check-env
