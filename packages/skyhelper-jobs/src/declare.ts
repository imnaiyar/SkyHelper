declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TOKEN: string;
      NODE_ENV: "development" | "production";
      MONGO_CONNECTION: string;
      ERROR_WEBHOOK?: string;
    }
  }
}
