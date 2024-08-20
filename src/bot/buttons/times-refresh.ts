import { getTimesEmbed } from "#handlers/getDailyEventTimes";
import type { Button } from "#structures";

export default {
  data: {
    name: "times-refresh",
  },
  async execute(interaction, _t, client) {
    await interaction.deferUpdate();
    const embed = await getTimesEmbed(client, _t);
    await interaction.editReply({ embeds: [embed] });
  },
} satisfies Button;
