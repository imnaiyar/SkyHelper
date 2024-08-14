import { buildShardEmbed } from "#handlers";
import type { Button } from "#structures";
import moment from "moment";
import { ShardsUtil as utils } from "skyhelper-utils";
export default {
  data: {
    name: "shards-scroll",
  },
  async execute(interaction, t) {
    const date = interaction.customId.split("_")[1];
    const givenDate = utils.getDate(date) as moment.Moment;
    await interaction.deferUpdate();
    const res = buildShardEmbed(givenDate, t, "SkyHelper");
    await interaction.editReply(res);
  },
} satisfies Button;
