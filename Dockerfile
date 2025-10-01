# Base build image
FROM node:22.13.0 AS build

RUN npm i -g pnpm@10.15.1

WORKDIR /app
ARG TURBO_TOKEN
ARG TURBO_TEAM
ENV TURBO_TEAM=${TURBO_TEAM}
ENV TURBO_TOKEN=${TURBO_TOKEN}

COPY package.json pnpm-lock.yaml .npmrc ./
COPY pnpm-workspace.yaml ./
COPY patches patches

# Store it in virtual store
RUN pnpm fetch

ADD . ./

RUN pnpm install -r --offline

RUN pnpm build

ARG TARGET

RUN if [ "$TARGET" = "skyhelper" ]; then \
        pnpm deploy --filter="./packages/skyhelper" sky-out --prod; \
    elif [ "$TARGET" = "jobs" ]; then \
        pnpm deploy --filter="./packages/jobs" jobs-out --prod; \
    fi

# Skyhelper
FROM node:22.13-alpine AS skyhelper

ARG SENTRY_AUTH_TOKEN

RUN npm i -g pnpm@9.4.0

WORKDIR /app
COPY --from=build /app/sky-out .

ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN

RUN pnpm run sentry:sourcemaps

EXPOSE 5000
CMD [ "pnpm", "start" ]

# Jobs
FROM oven/bun:latest AS jobs

WORKDIR /app
COPY --from=build /app/jobs-out .

CMD ["bun", "run", "start"]
