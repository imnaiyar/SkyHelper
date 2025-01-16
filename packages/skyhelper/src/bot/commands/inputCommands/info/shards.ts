import { buildShardEmbed } from "#utils";
import type { Command } from "#structures";
import { type BaseMessageOptions } from "discord.js";
import moment from "moment";
import { ShardsUtil } from "skyhelper-utils";
import type { getTranslator } from "#bot/i18n";
import { SHARDS_DATA } from "#bot/commands/commands-data/info-commands";

export default {
  async interactionRun(interaction, t) {
    const date = interaction.options.getString("date");
    const hide = interaction.options.getBoolean("hide") || false;
    const shard = getShards(t, date);
    if (typeof shard === "string") {
      return void (await interaction.reply({
        content: shard,
        ephemeral: true,
      }));
    }

    await interaction.reply({ ...shard, ephemeral: hide });
  },
  async messageRun({ message, args, t }) {
    await message.reply(getShards(t, args[0]));
  },

  ...SHARDS_DATA,
} satisfies Command;

const getShards = (t: ReturnType<typeof getTranslator>, date?: string | null): string | BaseMessageOptions => {
  if (date && !/^\d{4,6}-\d{2}-\d{2}$/.test(date)) {
    return t("commands:SHARDS.RESPONSES.INVALID_DATE");
  }

  const currentDate = ShardsUtil.getDate(date);
  if (typeof currentDate === "string" && currentDate === "invalid") {
    return t("commands:SHARDS.RESPONSES.DATE_NONEXIST", { DATE: date });
  }
  return buildShardEmbed(currentDate as moment.Moment, t, t("common:bot.name"));
};
