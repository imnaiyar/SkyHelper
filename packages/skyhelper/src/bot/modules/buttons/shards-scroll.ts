import { buildShardEmbed } from "@/utils/classes/Embeds";
import { defineButton } from "@/structures";
import { ShardsUtil as utils } from "@skyhelperbot/utils";
import type { DateTime } from "luxon";
import { MessageFlags } from "@discordjs/core";
import { CustomId } from "@/utils/customId-store";

export default defineButton({
  data: {
    name: "shards-scroll",
  },
  id: CustomId.ShardsScroll,
  async execute(interaction, t, helper, { date }) {
    const givenDate = utils.getDate(date) as DateTime;
    await helper.deferUpdate();
    const res = buildShardEmbed(givenDate, t);

    await helper.editReply({ ...res, flags: MessageFlags.IsComponentsV2, embeds: [] /* Reset embeds incase of old message */ }); // ideally the flag is not needed here since the message will already have it, but for older messages before the v2 component rewrite, it may cause error
  },
});
