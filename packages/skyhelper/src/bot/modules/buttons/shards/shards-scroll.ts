import embeds from "@/utils/classes/Embeds";
import type { Button } from "@/structures";
import { ShardsUtil as utils } from "@skyhelperbot/utils";
import type { DateTime } from "luxon";
export default {
  data: {
    name: "shards-scroll",
  },
  async execute(interaction, t, helper) {
    const date = helper.client.utils.parseCustomId(interaction.data.custom_id).date;
    const givenDate = utils.getDate(date) as DateTime;
    await helper.deferUpdate();
    const res = embeds.buildShardEmbed(givenDate, t, "SkyHelper");
    await helper.editReply(res);
  },
} satisfies Button;
