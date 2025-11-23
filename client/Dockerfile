FROM node:20-bullseye-slim

RUN apt-get update \
  && apt-get install -y python3 make g++ \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable \
  && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY ./ ./
RUN pnpm install

EXPOSE 3000

CMD ["pnpm", "start"]