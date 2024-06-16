import getTS from "#handlers/getTS";
import { useTranslations } from "#handlers/useTranslation";
import { Spirits } from "#libs";
import { ContextTypes, IntegrationTypes, type SpiritsData } from "#libs";
import type { SlashCommand } from "#structures";
import { EmbedBuilder, time } from "discord.js";
const x = useTranslations;
export default {
  async execute(interaction, t, client) {
    const ts = await getTS();

    if (!ts) {
      await interaction.reply({
        content: t("commands.TRAVELING-SPIRIT.RESPONSES.NO_DATA"),
        ephemeral: true,
      });
      return;
    }
    await interaction.deferReply();

    const visitingDates = `${time(ts.nextVisit.toDate(), "D")} - ${time(ts.nextVisit.clone().add(3, "days").endOf("day").toDate(), "D")}`;
    if (ts.value) {
      const spirit: SpiritsData = client.spiritsData[ts.value as keyof typeof client.spiritsData];
      const emote = spirit.emote?.icon ?? spirit.call?.icon ?? spirit.stance?.icon ?? spirit.action?.icon;
      let description = ts.visiting
        ? t("commands.TRAVELING-SPIRIT.RESPONSES.VISITING", {
            SPIRIT: "↪",
            TIME: time(ts.nextVisit.clone().add(3, "days").endOf("day").toDate(), "F"),
            DURATION: ts.duration,
          })
        : t("commands.TRAVELING-SPIRIT.RESPONSES.EXPECTED", {
            SPIRIT: "↪",
            DATE: time(ts.nextVisit.toDate(), "F"),
            DURATION: ts.duration,
          });
      description += `\n\n**${t("commands.TRAVELING-SPIRIT.RESPONSES.VISITING_TITLE")}** ${visitingDates}\n**${t("SPIRITS.REALM_TITLE")}:** ${
        client.emojisMap.get("realms")![spirit.realm!]
      } ${spirit.realm}\n**${t("SPIRITS.SEASON_TITLE")}:**${client.emojisMap.get("seasons")![spirit.season!]} Season of ${spirit.season!}`;
      const embed = new EmbedBuilder()
        .setAuthor({ name: t("commands.TRAVELING-SPIRIT.RESPONSES.EMBED_AUTHOR", { INDEX: ts.index }), iconURL: ts.spiritImage })
        .setDescription(description)
        .setTitle(emote! + " " + spirit.name)
        .addFields({
          name: spirit.tree!.by,
          value: spirit.tree!.total,
        })
        .setImage("https://cdn.imnaiyar.site/" + spirit.tree!.image);
      const manager = new Spirits(spirit, client);
      await interaction.followUp({ embeds: [embed], components: [manager.getButtons()] });
      manager.handleInt(interaction).catch((err) => client.logger.error(err));
    } else {
      let description = ts.visiting
        ? t("commands.TRAVELING-SPIRIT.RESPONSES.VISITING", {
            SPIRIT: t("SPIRITS.UNKNOWN"),
            TIME: time(ts.nextVisit.clone().add(3, "days").endOf("day").toDate(), "F"),
            DURATION: ts.duration,
          })
        : t("commands.TRAVELING-SPIRIT.RESPONSES.EXPECTED", {
            SPIRIT: t("SPIRITS.UNKNOWN"),
            DATE: time(ts.nextVisit.toDate(), "F"),
            DURATION: ts.duration,
          });
      description += `\n\n**${t("commands.TRAVELING-SPIRIT.RESPONSES.VISITING_TITLE")}** ${visitingDates}`;
      const embed = new EmbedBuilder()
        .setAuthor({ name: t("commands.TRAVELING-SPIRIT.RESPONSES.EMBED_AUTHOR", { INDEX: "X" }) })
        .setDescription(description);
      await interaction.followUp({ embeds: [embed] });
    }
  },
  data: {
    name: "traveling-spirit",
    name_localizations: x("commands.TRAVELING-SPIRIT.name"),
    description: "get details about current/upcoming TS.",
    description_localizations: x("commands.TRAVELING-SPIRIT.description"),
    integration_types: [IntegrationTypes.Guilds, IntegrationTypes.Users],
    contexts: [ContextTypes.PrivateChannels, ContextTypes.Guild, ContextTypes.BotDM],
  },
  cooldown: 20,
  category: "Info",
} satisfies SlashCommand;

