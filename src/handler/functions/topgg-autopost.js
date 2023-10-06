const { Client } = require('discord.js');
const { AutoPoster } = require('topgg-autoposter');
const Logger = require('@src/logger');

/**
 * @param {Client} client
 */

async function topggAutopost(client) {
  const poster = AutoPoster(process.env.TOPGG_TOKEN, client);

  poster.on('posted', (stats) => {
    Logger.success(`Posted ${stats.serverCount} guilds to Top.gg`);
  });
}

module.exports = {
  topggAutopost,
};
