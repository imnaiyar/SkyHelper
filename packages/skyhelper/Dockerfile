FROM node:22.10.0
WORKDIR /root/skyhelper

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm install --frozen-lockfile --production=false

COPY . .
EXPOSE 5000
CMD [ "pnpm", "start" ]