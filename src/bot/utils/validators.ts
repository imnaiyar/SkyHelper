import logger from "#bot/handlers/logger";

export function validateEnv() {
  if (!process.env.TOKEN) throw new Error("TOKEN is not provided in the environment variables");
  if (!process.env.MONGO_CONNECTION) throw new Error("MONGO_CONNECTION is not provided in the environment variables");
  if (!process.env.SENTRY_DSN) throw new Error("SENTRY_DSN is not provided in the environment variables");
  if (!process.env.PUBLIC_KEY) throw new Error("PUBLIC_KEY is not provided in the environment variables");
  if (!process.env.CONTACT_US) logger.warn("CONTACT_US Webhook is not provided, command '/contact-us' will not work properly");
  for (const key of ["TOPGG_TOKEN", "DBL_TOKEN"]) {
    // prettier-ignore
    if (!process.env[key]) logger.warn(`${key} is not provided in the environment variables, the bot will not be able to post stats`);
  }
}
