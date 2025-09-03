FROM debian:bookworm

RUN apt update && apt upgrade -y && \
    apt install -y curl sudo

RUN curl -fsSL https://deb.nodesource.com/setup_21.x | bash - && \
    apt install -y nodejs

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN npx prisma migrate dev --name init

EXPOSE 3000

ENTRYPOINT ["pnpm", "run", "dev"]

# ENTRYPOINT ["tail", "-f"]
