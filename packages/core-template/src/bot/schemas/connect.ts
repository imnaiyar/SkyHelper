import mongoose from "mongoose";
import logger from "@/handlers/logger";
import chalk from "chalk";
const { custom, error } = logger;
export async function initializeMongoose(): Promise<mongoose.Connection> {
  console.log(chalk.blueBright("\n\n<------------------------ Connecting --------------------------->\n"));
  custom(`Connecting to MongoDb...`, "DATABASE");

  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(process.env.MONGO_CONNECTION as string);

    custom("Database connection established", "DATABASE");

    return mongoose.connection;
  } catch (err) {
    error("Failed to connect to database", err);
    process.exit(1);
  }
}
