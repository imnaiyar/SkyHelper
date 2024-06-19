import { ApplicationCommandOptionType, GuildMember } from "discord.js";
import type { SlashCommand } from "#structures";
import { SeasonCalculator, SeasonData as sn } from "#libs/index";
import moment from "moment";
import { useTranslations as x } from "#handlers/useTranslation";
export default {
  async execute(interaction, t, client) {
    // const type = interaction.options.getString("type");
    await interaction.deferReply({
      ephemeral: interaction.options.getBoolean("hide") ?? false,
    });
    const hasPass = interaction.options.getBoolean("season-pass")!;
    const candles = interaction.options.getInteger("candles")!;
    const dailies = interaction.options.getBoolean("dailies")!;
    const now = moment().tz(client.timezone);
    const end = moment.tz(sn.end, "MM-DD-YYYY", client.timezone);
    // prettier-ignore
    if (now.isAfter(end)) return void await interaction.followUp(t("commands.SEASONAL_CALCULATOR.RESPONSES.NOT_ACTIVE"));
    const userData = await client.database.getUserData(interaction.user);
    if (hasPass !== undefined) {
      userData.hasPass = hasPass;
      await userData.save();
    }
    const calculator = new SeasonCalculator(
      t,
      interaction.inCachedGuild() ? (interaction.member as GuildMember) : interaction.user,
      userData,
      dailies,
      candles,
    );
    await calculator.handleInt(interaction);
  },
  data: {
    name: "seasonal-calculator",
    name_localizations: x("commands.SEASONAL_CALCULATOR.name"),
    description: "calculate seasonal currencies",
    description_localizations: x("commands.SEASONAL_CALCULATOR.description"),
    integration_types: [0, 1],
    contexts: [0, 1, 2],
    options: [
      {
        name: "candles",
        name_localizations: x("commands.SEASONAL_CALCULATOR.options.CANDLES.name"),
        description: "amount of candles you have?",
        description_localizations: x("commands.SEASONAL_CALCULATOR.options.CANDLES.description"),
        required: true,
        type: ApplicationCommandOptionType.Integer,
      },
      {
        name: "dailies",
        name_localizations: x("commands.SEASONAL_CALCULATOR.options.DAILIES.name"),
        description: "did you do your dailies today?",
        description_localizations: x("commands.SEASONAL_CALCULATOR.options.DAILIES.description"),
        required: true,
        type: ApplicationCommandOptionType.Boolean,
      },
      {
        name: "season-pass",
        name_localizations: x("commands.SEASONAL_CALCULATOR.options.SEASON_PASS.name"),
        description: "do you have the season pass?",
        description_localizations: x("commands.SEASONAL_CALCULATOR.options.SEASON_PASS.description"),
        required: false,
        type: ApplicationCommandOptionType.Boolean,
      },
    ],
  },
  cooldown: 10,
  category: "Utility",
} satisfies SlashCommand;
