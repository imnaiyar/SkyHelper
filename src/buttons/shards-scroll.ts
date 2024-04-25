import { buildShardEmbed } from "#handlers";
import { Button } from "#structures";
import moment from "moment";
import { ShardsUtil as utils } from "skyhelper-utils";
export default {
  data: {
    name: "shards-scroll",
  },
  async execute(interaction) {
    const date = interaction.customId.split("_")[1];
    const givenDate = utils.getDate(date) as moment.Moment;
    await interaction.deferUpdate();
    const res = buildShardEmbed(givenDate, "SkyHelper");
    await interaction.editReply(res);
  },
} satisfies Button;
