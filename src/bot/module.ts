declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TOKEN: string;
      NODE_ENV: "development" | "production";
      CLIENT_ID: string;
      MONGO_CONNECTION: string;
      SENTRY_DSN: string;
      SENTRY_RELEASE?: string;
      PUBLIC_KEY: string;
      AUTH_TOKEN: string;
      TOPGG_TOKEN?: string;
      GUILD?: string;
      ERROR_LOGS?: string;
      READY_LOGS?: string;
      SUGGESTION?: string;
      CONTACT_US?: string;
      COMMANDS_USED?: string;
      BUG_REPORTS?: string;
    }
  }
}
