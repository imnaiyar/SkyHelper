import { ApplicationCommandOptionType, GuildMember } from "discord.js";
import type { SlashCommand } from "#structures";
import { SeasonCalculator, SeasonData as sn } from "#libs/index";
import moment from "moment";
export default {
  data: {
    name: "seasonal-calculator",
    description: "calculate seasonal currencies",
    integration_types: [0, 1],
    contexts: [0, 1, 2],
    options: [
      {
        name: "candles",
        description: "amount of candles you have?",
        required: true,
        type: ApplicationCommandOptionType.Integer,
      },
      {
        name: "dailies",
        description: "did you do your dailies today?",
        required: true,
        type: ApplicationCommandOptionType.Boolean,
      },
      {
        name: "season-pass",
        description: "do you have the season pass?",
        required: false,
        type: ApplicationCommandOptionType.Boolean,
      },
    ],
  },
  cooldown: 10,
  category: "Utility",
  async execute(interaction, client) {
    // const type = interaction.options.getString("type");
    await interaction.deferReply({ ephemeral: interaction.options.getBoolean("hide") ?? false });
    const hasPass = interaction.options.getBoolean("season-pass")!;
    const candles = interaction.options.getInteger("candles")!;
    const dailies = interaction.options.getBoolean("dailies")!;
    const now = moment().tz(client.timezone);
    const end = moment.tz(sn.end, "MM-DD-YYYY", client.timezone);
    // prettier-ignore
    if (now.isAfter(end)) return void await interaction.followUp('No active season at the moment. Please run this command when a seson is active.');
    const userData = await client.database.getUserData(interaction.user);
    if (hasPass !== undefined) {
      userData.hasPass = hasPass;
      await userData.save();
    }
    const calculator = new SeasonCalculator(
      interaction.inCachedGuild() ? (interaction.member as GuildMember) : interaction.user,
      userData,
      dailies,
      candles,
    );
    await calculator.handleInt(interaction);
  },
} satisfies SlashCommand;
