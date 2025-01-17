FROM oven/bun:latest

WORKDIR /root/skyhelper-jobs

COPY package.json ./

# Replace the workspace dependencies with the latest version
RUN sed -i 's/"workspace:[^"]*"/"latest"/g' package.json

RUN bun install

COPY . .

CMD ["bun", "run", "start"]
