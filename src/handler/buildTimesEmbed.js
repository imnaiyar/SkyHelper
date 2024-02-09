const { skyTimes } = require("@commands/skytimes/sub/skyTimes");
const { EmbedBuilder } = require("discord.js");
const config = require("@root/config");

/**
 * Returns an embed with SkyTimes data
 * @param {import('@src/structures').SkyHelper} client
 * @param {string} footer
 * @returns
 */
module.exports = async (client, footer) => {
  const { geyserResultStr, grandmaResultStr, resetResultStr, edenResultStr, turtleResultStr, eventDescription } =
    await skyTimes(client);
  let result = new EmbedBuilder()
    .setAuthor({
      name: `SkyTimes`,
      iconURL: config.BOT_ICON,
    })
    .addFields(
      {
        name: "Geyser Time",
        value: geyserResultStr,
      },
      {
        name: "Grandma Times",
        value: grandmaResultStr,
      },
      {
        name: "Turtle Times",
        value: turtleResultStr,
      },
      {
        name: "Next Reset",
        value: resetResultStr,
      },
      {
        name: "Next Eden Reset",
        value: edenResultStr,
      },
      {
        name: "Event",
        value: eventDescription,
      }
    )
    .setTimestamp(Date.now())
    .setFooter({
      text: footer,
      iconURL: config.BOT_ICON,
    });

  return { result };
};
