FROM node:22.13.0 AS build

RUN npm i -g pnpm@9.4.0

WORKDIR /app
COPY . .

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile 

RUN pnpm build; \
    pnpm deploy --filter="./packages/skyhelper" sky-out --prod; \
    pnpm deploy --filter="./packages/jobs" jobs-out --prod

# Run skyhelper image
FROM node:22.13-alpine AS skyhelper

ARG SENTRY_AUTH_TOKEN

RUN npm i -g pnpm@9.4.0

WORKDIR /app
COPY --from=build /app/sky-out .

ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN

RUN pnpm run sentry:sourcemaps


EXPOSE 5000
CMD [ "pnpm", "start" ]

# Run the jobs image
FROM oven/bun:latest AS jobs

WORKDIR /app
COPY --from=build /app/jobs-out .

CMD ["bun", "run", "start"]
