import { logger } from "#src/structures/Logger.js";
import mongoose from "mongoose";
export async function initializeMongoose(): Promise<mongoose.Connection> {
  logger.log({ timestamp: false, hideLevel: true }, "\n\n<------------------------ Connecting --------------------------->\n");
  logger.log({ level: { name: "DATABASE" } }, `Connecting to MongoDb...`);

  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(process.env.MONGO_CONNECTION as string);

    logger.log({ level: { name: "DATABASE" } }, "Database connection established");

    return mongoose.connection;
  } catch (err) {
    logger.error("Failed to connect to database", err);
    process.exit(1);
  }
}
