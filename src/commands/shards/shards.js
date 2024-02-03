const { ApplicationCommandOptionType } = require("discord.js");
const { buildShardEmbed } = require("@handler");
const shardsUtil = require("@handler/shardsUtil");
const moment = require("moment-timezone");
const desc = require("@src/cmdDesc");
module.exports = {
  cooldown: 3,
  data: {
    name: "shards",
    description: "Get Sky Shards information",
    longDesc: desc.shards,
    options: [
      {
        name: "date",
        description: "Get Shards data for a specific date. (YYYY-MM-DD, e.g 2023-06-28)",
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },
  async execute(interaction) {
    const dateOption = interaction.options.getString("date");
    const regex = /^\d{4,6}-\d{2}-\d{2}$/;
    if (dateOption && !regex.test(dateOption)) {
      interaction.reply({
        content: "Invalid date format. Please use the YYYY-MM-DD format. Max input : **275760-09-12**",
        ephemeral: true,
      });
      return;
    }
    const util = shardsUtil;
    const currentDate = util.getDate(dateOption);
    if (currentDate === "invalid") {
      return interaction.reply({
        content: `\` ${dateOption} \` does not exist, please provide a valid date.`,
        ephemeral: true,
      });
    } else if (currentDate === "error") {
      return interaction.reply("An error occurred while processing the date.");
    }

    const { result, actionRow } = await buildShardEmbed(currentDate, "SkyHelper");

    await interaction.deferReply({ ephemeral: true });
    const reply = await interaction.editReply({
      embeds: [result],
      components: [actionRow],
      fetchReply: true,
    });
    const messageId = reply.id;

    util.saveMessageData({
      time: currentDate.format(),
      messageId,
      timestamp: moment().tz(interaction.client.timezone).format(),
    });
  },
};
