import type { SkyHelper } from "#structures";
import { AutoPoster } from "topgg-autoposter";

/**
 * Post Bot's stats on TopGG
 */
export default async (client: SkyHelper) => {
  const poster = AutoPoster(process.env.TOPGG_TOKEN!, client);

  poster.on("posted", (stats) => {
    client.logger.success(`Posted ${stats.serverCount} guilds to Top.gg`);
  });
};
