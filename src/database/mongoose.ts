import mongoose from "mongoose";
import logger from "#handlers/logger";
import chalk from "chalk";
const { log, success, error } = logger;
export async function initializeMongoose(): Promise<mongoose.Connection> {
  log(chalk.blueBright("<-------------- Connecting ----------------->"));
  log(`Connecting to MongoDb...`);

  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(process.env.MONGO_CONNECTION as string);

    success("Database connection established");

    return mongoose.connection;
  } catch (err) {
    error("Failed to connect to database", err);
    process.exit(1);
  }
}
