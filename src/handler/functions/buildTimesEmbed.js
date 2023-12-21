const { skyTimes } = require('@commands/skytimes/sub/skyTimes');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const config = require('@root/config');
module.exports = {
  buildTimesEmbed: async (footer) => {
    const {
      geyserResultStr,
      grandmaResultStr,
      resetResultStr,
      edenResultStr,
      turtleResultStr,
    } = await skyTimes();
    let result = new EmbedBuilder()
      .setAuthor({
        name: `SkyTimes`,
        iconURL: config.BOT_ICON,
      })
      .addFields(
        {
          name: 'Geyser Time',
          value: geyserResultStr,
        },
        {
          name: 'Grandma Times',
          value: grandmaResultStr,
        },
        {
          name: 'Turtle Times',
          value: turtleResultStr,
        },
        {
          name: 'Next Reset',
          value: resetResultStr,
        },
        {
          name: 'Next Eden Reset',
          value: edenResultStr,
        },
      )
      .setTimestamp(Date.now())
      .setFooter({
        text: footer,
        iconURL: config.BOT_ICON,
      });

    return { result };
  },
};
