FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]



#RUN npx @tailwindcss/cli -i ./src/style.css -o ./public/style.css --watch
#
#RUN npx tsc
#
#RUN npm install -g serve
#
#EXPOSE 8080
#
#CMD ["npm", "run", "dev"]