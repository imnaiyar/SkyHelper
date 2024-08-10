FROM node:lts
WORKDIR /root/skyhelper

COPY package.json pnpm-lock.yaml ./

# SECRETS
ENV NODE_ENV=
ENV TOKEN=
ENV MONGO_CONNECTION=
ENV TOPGG_TOKEN=
ENV DBL_TOKEN=
ENV SENTRY_DSN=
# WEBHOOKS [OPTIONAL]
ENV GUILD=
ENV SUGGESTION=
ENV ERROR_LOGS=
ENV READY_LOGS=
ENV COMMANDS_USED=
ENV CONTACT_US=
ENV BUG_REPORTS=

RUN npm install -g pnpm

RUN pnpm install --frozen-lockfile --production=false

COPY . .
EXPOSE 5000
CMD [ "pnpm", "start" ]