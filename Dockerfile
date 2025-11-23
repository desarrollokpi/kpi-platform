FROM node:20-bullseye-slim

RUN apt-get update \
  && apt-get install -y python3 make g++ \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable \
  && corepack prepare pnpm@latest --activate

WORKDIR /server
COPY ./server/package.json ./
RUN pnpm install

COPY ./server ./

WORKDIR /client
COPY ./client/package.json ./
RUN pnpm install
COPY ./client ./

WORKDIR /server
CMD ["pnpm", "start"]