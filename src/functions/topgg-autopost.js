import { AutoPoster } from 'topgg-autoposter';
import Logger from '@src/logger';

/**
 * Post Bot's stats on TopGG
 * @param {import('@src/frameworks').SkyHelper} client
 */
export default async (client) => {
  const poster = AutoPoster(process.env.TOPGG_TOKEN, client);

  poster.on("posted", (stats) => {
    Logger.success(`Posted ${stats.serverCount} guilds to Top.gg`);
  });
};
