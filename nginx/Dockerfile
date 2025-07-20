FROM debian:bullseye

RUN apt update && apt upgrade -y && apt install -y nginx

RUN apt install -y openssl

RUN mkdir -p /etc/nginx/ssl

RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
	-out /etc/nginx/ssl/inception-certificate.crt \
	-keyout /etc/nginx/ssl/inception-key.key \
	-subj "/C=FR/ST=ARA/L=lyon/O=42/OU=42/CN=evassy.42.fr"

COPY ./conf/config.conf /etc/nginx/sites-available/default

# COPY ./tools/index.html /var/www/html/index.html/

RUN chmod 755 /var/www/html
RUN chown -R www-data:www-data /var/www/html

ENTRYPOINT ["nginx", "-g", "daemon off;"]

# docker run -d --name transcendence-nginx -p 443:443 -v C:/Users/Eliott/Documents/Transcendence/dev_frontend/src:/var/www/html transcendence-nginx