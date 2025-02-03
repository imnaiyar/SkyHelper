# Build the monorepo
FROM node:22.10.0 AS build

RUN corepack enable && corepack install -g pnpm@latest-9
WORKDIR /app
COPY . .

# Cache to reduce build time
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile 

RUN pnpm build

# Deploy relevant packages
RUN pnpm deploy --filter="./packages/skyhelper" sky-out
RUN pnpm deploy --filter="@skyhelperbot/jobs" jobs-out

# Run skyhelper image
FROM node:22.10.0 AS skyhelper

ARG SENTRY_AUTH_TOKEN

RUN corepack enable && corepack install -g pnpm@latest-9

WORKDIR /app
COPY --from=build /app/sky-out .

# Build and upload sourcemaps to sentry
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN

RUN pnpm build:prod

EXPOSE 5000
CMD [ "pnpm", "start" ]

# Run the jobs image
FROM oven/bun:latest AS jobs

WORKDIR /app
COPY --from=build /app/jobs-out .
CMD ["bun", "run", "start"]