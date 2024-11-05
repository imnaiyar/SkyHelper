import { type GuildMember, time } from "discord.js";
import type { Command } from "#structures";
import { SeasonCalculator, SeasonData as sn } from "#libs/index";
import moment from "moment";
import { SEASON_CALCULATOR_DATA } from "#bot/commands/commands-data/utility-commands";
export default {
  async interactionRun(interaction, t, client) {
    // const type = interaction.options.getString("type");
    await interaction.deferReply({
      ephemeral: interaction.options.getBoolean("hide") ?? false,
    });
    const hasPass = interaction.options.getBoolean("season-pass");
    const candles = interaction.options.getInteger("candles", true);
    const dailies = interaction.options.getBoolean("dailies", true);
    const now = moment().tz(client.timezone);
    const start = moment.tz(sn.start, "DD-MM-YYYY", client.timezone);
    const end = moment.tz(sn.end, "DD-MM-YYYY", client.timezone);
    // prettier-ignore
    if (now.isAfter(end)) return void await interaction.followUp(t("commands:SEASONAL_CALCULATOR.RESPONSES.NOT_ACTIVE"));
    if (!sn.spiritsUpdated) {
      return void (await interaction.followUp(
        t("commands:SEASONAL_CALCULATOR.RESPONSES.SPIRITS_NOT_UPDATED", {
          SEASON: `${sn.icon} ${sn.name}`,
          START: `${time(start.toDate(), "F")} (${time(start.toDate(), "R")})`,
          END: `${time(end.toDate(), "F")} (${time(end.toDate(), "R")})`,
        }),
      ));
    }
    const userData = await client.database.getUserData(interaction.user);
    if (hasPass) {
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
  ...SEASON_CALCULATOR_DATA,
} satisfies Command;
