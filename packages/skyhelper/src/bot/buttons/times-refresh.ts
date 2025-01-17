import { getTimesEmbed } from "#bot/utils/buildEventsEmbed";
import type { Button } from "#structures";

export default {
  data: {
    name: "times-refresh",
  },
  async execute(interaction, _t, client) {
    await interaction.deferUpdate();
    await interaction.editReply(await getTimesEmbed(client, _t));
  },
} satisfies Button;
