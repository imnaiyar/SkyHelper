# Base build image
FROM node:22.20.0 AS build

RUN corepack enable

WORKDIR /app
ARG TURBO_TOKEN
ARG TURBO_TEAM
ARG SENTRY_AUTH_TOKEN
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG SENTRY_URL

ENV TURBO_TEAM=${TURBO_TEAM}
ENV TURBO_TOKEN=${TURBO_TOKEN}
ENV SENTRY_AUTH_TOKEN="${SENTRY_AUTH_TOKEN}"
ENV SENTRY_ORG="${SENTRY_ORG}"
ENV SENTRY_PROJECT="${SENTRY_PROJECT}"
ENV SENTRY_URL="${SENTRY_URL}"


RUN npm i -g @sentry/cli

COPY package.json pnpm-lock.yaml .npmrc ./
COPY pnpm-workspace.yaml ./
COPY patches patches

# Store it in virtual store
RUN pnpm fetch

ADD . ./

RUN pnpm install -r --offline

RUN pnpm build --filter=!./apps/docs --filter=!./apps/website

ARG TARGET

# Create sentry release
RUN pnpm --filter ${TARGET} exec chmod +x scripts/sentry-release.sh
RUN pnpm --filter ${TARGET} exec ./scripts/sentry-release.sh


RUN if [ "$TARGET" = "skyhelper" ]; then \
    pnpm deploy --filter="./packages/skyhelper" sky-out --prod --legacy; \
    elif [ "$TARGET" = "jobs" ]; then \
    pnpm deploy --filter="./packages/jobs" jobs-out --prod --legacy; \
    fi

# Skyhelper
FROM node:22.13-alpine AS skyhelper


WORKDIR /app
COPY --from=build /app/sky-out .


EXPOSE 5000
CMD [ "pnpm", "start" ]

# Jobs
FROM oven/bun:latest AS jobs

WORKDIR /app
COPY --from=build /app/jobs-out .

CMD ["bun", "run", "start"]