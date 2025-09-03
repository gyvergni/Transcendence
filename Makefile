DockerComposeFile 	= ./docker-compose.yml
apiVolume 		= ./app/api
frontendVolume 	= ./app/frontend
folderVolume = ./app
API_DOCKER_VOLUME	= transcendence_api
FRONTEND_DOCKER_VOLUME	= transcendence_nginx

all: up

up:
	mkdir -p $(apiVolume)
	mkdir -p $(frontendVolume)
	docker compose -f $(DockerComposeFile) up -d --build

down: 
	docker compose -f $(DockerComposeFile) down

stop: 
	docker compose -f $(DockerComposeFile) stop

start: 
	docker compose -f $(DockerComposeFile) start

clean: down
	docker container prune --force
	docker image prune --all --force

fclean: clean
	docker volume rm $(API_DOCKER_VOLUME) $(FRONTEND_DOCKER_VOLUME)
	rm -rdf $(apiVolume)
	rm -rdf $(frontendVolume)
	rm -rdf $(folderVolume)
	docker volume prune --force

re: fclean all

.PHONY: all up down stop start clean fclean re
