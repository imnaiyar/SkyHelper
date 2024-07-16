declare global {
  namespace NodeJS {
    interface Process {
      isBun?: boolean;
    }
    interface ProcessEnv {
      TOKEN: string;
      NODE_ENV: "development" | "production";
      MONGO_CONNECTION: string;
      SENTRY_DSN: string;
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
