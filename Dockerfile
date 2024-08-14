FROM node:lts
WORKDIR /root/skyhelper

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm install --frozen-lockfile --production=false

COPY . .
EXPOSE 5000
CMD [ "pnpm", "start" ]