const { WebhookClient, EmbedBuilder } = require("discord.js");
const ready = process.env.READY_LOGS ? new WebhookClient({ url: process.env.READY_LOGS }) : undefined;

/**
 * ready event handler
 * @param {import('@src/structures').SkyHelper} client
 */
module.exports = async (client) => {
  await client.guilds.fetch();
  let text;
  client.logger.log(`Logged in as ${client.user.tag}`);
  if (client.config.DASHBOARD.enabled) {
    text = `Website started on port ${client.config.DASHBOARD.port}`;
  } else {
    text = "Website is disabled";
  }
  const readyalertemb = new EmbedBuilder()
    .addFields(
      {
        name: "Bot Status",
        value: `Total guilds: ${client.guilds.cache.size}\nTotal Users: ${client.guilds.cache.reduce(
          (size, g) => size + g.memberCount,
          0
        )}`,
        inline: false,
      },
      {
        name: "Website",
        value: text,
        inline: false,
      },
      {
        name: "Interactions",
        value: `Loaded Interactions`,
        inline: false,
      },
      {
        name: "Success",
        value: `SkyHelper is now online`,
      }
    )
    .setColor("Gold")
    .setTimestamp();

  // Ready alert
  if (ready) {
    ready.send({
      username: "Ready",
      avatarURL: client.user.displayAvatarURL(),
      embeds: [readyalertemb],
    });
  }

  // Fetching for eval purpose
  await client.application.fetch();
};
