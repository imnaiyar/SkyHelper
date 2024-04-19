import getTS from "#handlers/getTS";
import { Spirits } from "#src/libs/classes/Spirits";
import { ContextTypes, IntegrationTypes, SpiritsData } from "#src/libs/types";
import { SlashCommand } from "#structures";
import { EmbedBuilder, time } from "discord.js";

export default {
  data: {
    name: "traveling-spirit",
    description: "get details about current/upcoming TS.",
    integration_types: [IntegrationTypes.Guilds, IntegrationTypes.Users],
    contexts: [ContextTypes.PrivateChannels, ContextTypes.Guild, ContextTypes.BotDM],
  },
  async execute(interaction, client) {
    const ts = await getTS();

    if (!ts) {
      await interaction.reply({
        content: "Oops! It seems no TS data was found, please try again later.",
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
        ? `is currently visiting the realms of Sky. They will depart at ${time(ts.nextVisit.clone().add(3, "days").endOf("day").toDate(), "F")} (in ${ts.duration})`
        : `will be visiting the realms of Sky on ${time(ts.nextVisit.toDate(), "F")} (in ${ts.duration})`;
      description += `\n\n**Visiting Dates:** ${visitingDates}\n**Realm:** ${
        client.emojisMap.get("realms")![spirit.realm!]
      } ${spirit.realm}\n**Season:**${client.emojisMap.get("seasons")![spirit.season!]} Season of ${spirit.season!}`;
      const embed = new EmbedBuilder()
        .setAuthor({ name: `Traveling spirit #${ts.index} summary!`, iconURL: ts.spiritImage })
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
        ? `A spirit is currently visiting the realms of Sky and will depart at ${time(ts.nextVisit.clone().add(3, "days").endOf("day").toDate(), "F")} (in ${ts.duration})`
        : `A spirit will be visiting the realms of Sky on ${time(ts.nextVisit.toDate(), "F")} (in ${ts.duration})`;
      description += `\n\n**Visiting Dates:** ${visitingDates}`;
      const embed = new EmbedBuilder().setAuthor({ name: `Traveling spirit summary!` }).setDescription(description);
      await interaction.followUp({ embeds: [embed] });
    }
  },
} satisfies SlashCommand;
