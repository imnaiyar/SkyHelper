FROM node:22.10.0
WORKDIR /root/skyhelper

RUN corepack enable && corepack install pnpm@latest-9 -g

COPY package.json ./

# Replace the workspace dependencies with the latest version
RUN sed -i 's/"workspace:[^"]*"/"latest"/g' package.json

RUN pnpm install --production=false

COPY . .
EXPOSE 5000
CMD [ "pnpm", "start" ]