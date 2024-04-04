import { buildShardEmbed } from '@handler';
import shardsUtil from '@handler/shardsUtil';

export default {
  name: "shards-scroll",
  async execute(interaction, client) {
    const date = interaction.customId.split("_")[1];
    const currentDate = shardsUtil.getDate(date);
    if (currentDate === "invalid") {
      return await interaction.reply({
        content: `\` ${date} \` does not exist, try running the command again.`,
        ephemeral: true,
      });
    } else if (currentDate === "error") {
      return await interaction.reply({
        content: "An error occurred while processing the date.",
        ephemeral: true,
      });
    }

    await interaction.deferUpdate();
    const { result, actionRow } = await buildShardEmbed(currentDate, "SkyHelper");

    await interaction.editReply({
      embeds: [result],
      components: [actionRow],
      fetchReply: true,
    });
  },
};
