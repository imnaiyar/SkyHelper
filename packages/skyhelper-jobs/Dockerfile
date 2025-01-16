FROM oven/bun:latest

WORKDIR /root/skyhelper-jobs

COPY package.json bun.lockb ./

RUN bun install --frozen-lockfile

COPY . .

CMD ["bun", "run", "start:bun"]
