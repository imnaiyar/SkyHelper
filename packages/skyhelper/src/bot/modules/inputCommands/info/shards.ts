import type { Command } from "@/structures";
import { ShardsUtil } from "@skyhelperbot/utils";
import type { getTranslator } from "@/i18n";
import { SHARDS_DATA } from "@/modules/commands-data/info-commands";
import { MessageFlags, type APIInteractionResponseCallbackData } from "@discordjs/core";
import { buildShardEmbed } from "@/utils/classes/Embeds";
import type { UserSchema } from "@/types/schemas";
import { PlannerDataService } from "@/planner";

export default {
  async interactionRun({ t, helper, options }) {
    const date = options.getString("date");
    const hide = options.getBoolean("hide") ?? false;
    const shard = getShards(t, helper.user.id, await helper.getUserSettings(), date);
    if (typeof shard === "string") {
      return void (await helper.reply({
        content: shard,
        flags: MessageFlags.Ephemeral,
      }));
    }
    await helper.reply({ ...shard, flags: MessageFlags.IsComponentsV2 | (hide ? MessageFlags.Ephemeral : 0) });
  },

  ...SHARDS_DATA,
} satisfies Command;

const getShards = (
  t: ReturnType<typeof getTranslator>,
  user: string,
  settings: UserSchema,
  date?: string | null,
): APIInteractionResponseCallbackData | string => {
  if (date && !/^\d{4,6}-\d{2}-\d{2}$/.test(date)) {
    return t("commands:SHARDS.RESPONSES.INVALID_DATE");
  }

  const currentDate = ShardsUtil.getDate(date);
  if (typeof currentDate === "string") {
    return t("commands:SHARDS.RESPONSES.DATE_NONEXIST", { DATE: date });
  }
  return buildShardEmbed(currentDate, t, false, user, PlannerDataService.shardsCleared(settings.plannerData));
};
