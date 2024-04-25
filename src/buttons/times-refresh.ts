import { getEventEmbed } from "#handlers/getDailyEventTimes";
import { Button } from "#structures";

export default {
  data: {
    name: "times-refresh",
  },
  async execute(interaction, client) {
    const embed = await getEventEmbed(client);
    await interaction.update({ embeds: [embed] });
  },
} satisfies Button;
