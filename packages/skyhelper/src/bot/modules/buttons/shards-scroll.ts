import { buildShardEmbed } from "@/utils/classes/Embeds";
import type { Button } from "@/structures";
import { ShardsUtil as utils } from "@skyhelperbot/utils";
import type { DateTime } from "luxon";
import { MessageFlags } from "@discordjs/core";
export default {
  data: {
    name: "shards-scroll",
  },
  async execute(interaction, t, helper) {
    const date = helper.client.utils.parseCustomId(interaction.data.custom_id).date;
    const givenDate = utils.getDate(date) as DateTime;
    await helper.deferUpdate();
    const res = buildShardEmbed(givenDate, t);

    await helper.editReply({ ...res, flags: MessageFlags.IsComponentsV2 });
  },
} satisfies Button;
