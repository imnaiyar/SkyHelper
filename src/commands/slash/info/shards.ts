import { buildShardEmbed } from "#handlers";
import { useTranslations } from "#handlers/useTranslation";
import { ContextTypes, IntegrationTypes } from "#libs/types";
import type { SlashCommand } from "#structures";
import { ApplicationCommandOptionType } from "discord.js";
import moment from "moment";
import { ShardsUtil } from "skyhelper-utils";
const x = useTranslations;
export default {
  data: {
    name: "shards",
    name_localizations: x("commands.SHARDS.name"),
    description: "Get the a specific shard information",
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
    integration_types: [IntegrationTypes.Guilds, IntegrationTypes.Users],
    contexts: [ContextTypes.BotDM, ContextTypes.Guild, ContextTypes.PrivateChannels],
  },
  category: "Info",
  cooldown: 5,
  async execute(interaction) {
    const date = interaction.options.getString("date");
    const hide = interaction.options.getBoolean("hide") || false;
    const regex = /^\d{4,6}-\d{2}-\d{2}$/;
    if (date && !regex.test(date)) {
      interaction.reply({
        content: "Invalid date format. Please use the YYYY-MM-DD format. Max input : **275760-09-12**",
        ephemeral: true,
      });
      return;
    }
    const currentDate = ShardsUtil.getDate(date);
    if (typeof currentDate === "string" && currentDate === "invalid") {
      await interaction.reply({
        content: `\` ${date} \` does not exist, please provide a valid date.`,
        ephemeral: true,
      });
      return;
    }

    const res = buildShardEmbed(currentDate as moment.Moment, await interaction.t(), "SkyHelper");

    await interaction.deferReply({ ephemeral: hide });
    await interaction.editReply(res);
  },
} satisfies SlashCommand;
