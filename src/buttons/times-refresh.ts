import { getTimesEmbed } from "#handlers/getDailyEventTimes";
import type { Button } from "#structures";

export default {
  data: {
    name: "times-refresh",
  },
  async execute(interaction, _t, client) {
    const embed = await getTimesEmbed(client, _t);
    await interaction.update({ embeds: [embed] });
  },
} satisfies Button;
