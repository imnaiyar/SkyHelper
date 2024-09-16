import { buildShardEmbed } from "#utils";
import { useTranslations as x } from "#handlers/useTranslation";
import type { Command } from "#structures";
import { ApplicationCommandOptionType, type BaseMessageOptions } from "discord.js";
import moment from "moment";
import { ShardsUtil } from "skyhelper-utils";
import type { getTranslator } from "#bot/i18n";

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

  name: "shards",
  description: "Get the a specific shard information",
  prefix: {
    usage: "[date]",
    aliases: ["shard"],
  },
  slash: {
    name_localizations: x("commands.SHARDS.name"),
    description_localizations: x("commands.SHARDS.description"),
    options: [
      {
        name: "date",
        name_localizations: x("commands.SHARDS.options.DATE.name"),
        description: "The date to get the shard information",
        description_localizations: x("commands.SHARDS.options.DATE.description"),
        type: ApplicationCommandOptionType.String,
        required: false,
      },
      {
        name: "hide",
        name_localizations: x("common.hide-options.name"),
        description: "Hide the shard response",
        description_localizations: x("common.hide-options.description"),
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  category: "Info",
  cooldown: 30,
} satisfies Command;

const getShards = (t: ReturnType<typeof getTranslator>, date?: string | null): string | BaseMessageOptions => {
  if (date && !/^\d{4,6}-\d{2}-\d{2}$/.test(date)) {
    return t("commands.SHARDS.RESPONSES.INVALID_DATE");
  }

  const currentDate = ShardsUtil.getDate(date);
  if (typeof currentDate === "string" && currentDate === "invalid") {
    return t("commands.SHARDS.RESPONSES.DATE_NONEXIST", { DATE: date });
  }
  return buildShardEmbed(currentDate as moment.Moment, t, t("common.bot.name"));
};
