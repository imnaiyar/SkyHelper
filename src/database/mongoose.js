const mongoose = require("mongoose");
const { log, success, error } = require("../logger");

module.exports = {
  async initializeMongoose() {
    log("---------------------------------------");
    log(`Connecting to MongoDb...`);

    try {
      mongoose.set("strictQuery", true);
      await mongoose.connect(process.env.MONGO_CONNECTION, {
        keepAlive: true,
      });

      success("Database connection established");

      return mongoose.connection;
    } catch (err) {
      error("Failed to connect to database", err);
      process.exit(1);
    }
  },

  schemas: {
    Guild: require("./schemas/Guild"),
    Shards: require("./schemas/Shards"),
    User: require("./schemas/User"),
  },
};
