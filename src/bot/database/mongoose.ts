import mongoose from "mongoose";
import logger from "#handlers/logger";
import chalk from "chalk";
const { log, error } = logger;
export async function initializeMongoose(): Promise<mongoose.Connection> {
  console.log(chalk.blueBright("\n\n<------------------------ Connecting --------------------------->\n"));
  log(`Connecting to MongoDb...`, "DATABASE");

  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(process.env.MONGO_CONNECTION as string);

    log("Database connection established", "DATABASE");

    return mongoose.connection;
  } catch (err) {
    error("Failed to connect to database", err);
    process.exit(1);
  }
}
