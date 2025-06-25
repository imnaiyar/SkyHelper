import { defineButton } from "@/structures";
import { buildShardEmbed } from "@/utils/classes/Embeds";
import { CustomId } from "@/utils/customId-store";
import { MessageFlags } from "@discordjs/core";
import { DateTime } from "luxon";

export default defineButton({
  data: { name: "shards-reminders-info" },
  id: CustomId.ShardsRemindersDetails,
  async execute(_interaction, t, helper, { date }) {
    const [day, month, year] = date.split("-").map(Number);
    const shardDate = DateTime.fromObject({ year, month, day }, { zone: "America/Los_Angeles" });
    if (!shardDate.isValid) {
      return void (await helper.editReply({
        content: t("commands:SHARDS.RESPONSES.INVALID_DATE"),
        flags: MessageFlags.Ephemeral,
      }));
    }
    await helper.reply(buildShardEmbed(shardDate, t, true));
  },
});
