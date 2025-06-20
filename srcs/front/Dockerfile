FROM node:latest

WORKDIR /app

COPY ./package*.json ./

RUN npm install

COPY . .

COPY ./src ./src

CMD npx @tailwindcss/cli -i ./src/css/input.css -o ./src/css/style.css --watch


##THIS IS FOR PRODUCTION USE AFTER

#RUN npm run build
#
#RUN npx tsc
#
#RUN npx @tailwindcss/cli -i ./src/css/input.css -o ./dist/style.css
#
#RUN cp ./src/index.html ./dist/index.html

