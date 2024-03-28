const mongoose = require("mongoose");
const { log, success, error } = require("../logger");
const chalk = require("chalk");
module.exports = {
  async initializeMongoose() {
    log(chalk.blueBright("<----------- Connecting ------------->"));
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
    botStats: require("./schemas/botStats"),
    Shards: require("./schemas/Shards"),
    User: require("./schemas/User"),
    autoShard: require("./schemas/autoShard"),
    autoTimes: require("./schemas/autoTimes"),
    guildBlackList: require("./schemas/guildBlackList"),
    quizData: require("./schemas/quizData.js"),
  },
};
