import mongoose from "mongoose";
import logger from "#handlers/logger";
const { log, success, error } = logger;
export default {
  async initializeMongoose() {
    log("---------------------------------------");
    log(`Connecting to MongoDb...`);

    try {
      mongoose.set("strictQuery", true);
      await mongoose.connect(process.env.MONGO_CONNECTION as string, {
        keepAlive: true,
      });

      success("Database connection established");

      return mongoose.connection;
    } catch (err) {
      error("Failed to connect to database", err);
      process.exit(1);
    }
  },
};
