const { AutoPoster } = require("topgg-autoposter");
const Logger = require("@src/logger");

/**
 * Post Bot's stats on TopGG
 * @param {import('@src/structures').SkyHelper} client
 */
module.exports = async (client) => {
  const poster = AutoPoster(process.env.TOPGG_TOKEN, client);

  poster.on("posted", (stats) => {
    Logger.success(`Posted ${stats.serverCount} guilds to Top.gg`);
  });
};
