import getDailyEventTimes from "#handlers/getDailyEventTimes";
import { SlashCommand } from "#structures";
import { ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction, time } from "discord.js";
import moment from "moment-timezone";
import "moment-duration-format";
import eventTimes from "#libs/datas/eventTimes";

export default {
  data: {
    name: "skytimes",
    description: "various in-game events countdown",
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  async execute(interaction, client) {
    await interaction.deferReply();
    const fulltimes = eventTimes();
    const geyser = getTimes(0, "geyser");
    const grandma = getTimes(30, "grandma");
    const turtle = getTimes(50, "turtle");
    const reset = getTimes(0, "daily");
    const embed = new EmbedBuilder()
      .setAuthor({ name: `SkyTimes`, iconURL: client.user.displayAvatarURL() })
      .setTitle("Times")
      .setColor("Random")
      .addFields(
        {
          name: "Geyser",
          value: geyser,
          inline: true,
        },
        {
          name: "Grandma",
          value: `${grandma}`,
          inline: true,
        },
        {
          name: "Turtle",
          value: turtle,
          inline: true,
        },
        {
          name: "Daily Reset",
          value: reset,
          inline: true,
        },
      );
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("skytimes-details")
        .setPlaceholder("Detailed Times")
        .addOptions([
          {
            label: "Geyser",
            value: `geyser`,
          },
          {
            label: "Grandma",
            value: `grandma`,
          },
          {
            label: "Turtle",
            value: `turtle`,
          },
        ]),
    );
    const msg = await interaction.followUp({ embeds: [embed], components: [row], fetchReply: true });
    const collector = msg.createMessageComponentCollector({ idle: 60_000 });
    collector.on("collect", async (int: StringSelectMenuInteraction) => {
      const buildEmbed = (data: string, info: any) => {
        return new EmbedBuilder()
          .setTitle(info === geyser ? "Geyser Times" : info === grandma ? "Grandma Times" : "Turtle Times")
          .setDescription(info + `\n\nTimeline\n` + data)
          .setColor("Random");
      };
      const value = int.values[0];
      switch (value) {
        case "geyser":
          await int.reply({ embeds: [buildEmbed(fulltimes.geyser, geyser)], ephemeral: true });
          break;
        case "grandma":
          await int.reply({ embeds: [buildEmbed(fulltimes.grandma, grandma)], ephemeral: true });
          break;
        case "turtle":
          await int.reply({ embeds: [buildEmbed(fulltimes.turtle, turtle)], ephemeral: true });
          break;
        default:
          await int.reply({ content: "Not a valid choice", ephemeral: true });
      }
    });
  },
} satisfies SlashCommand;

function getTimes(offset: number, type: string): string {
  const times = getDailyEventTimes(offset);
  if (type.toLocaleLowerCase().includes("daily")) {
    const resetAt = moment().tz("America/Los_Angeles").startOf("day").add(1, "day");
    const duration = moment.duration(resetAt.diff(moment().tz("America/Los_Angeles"))).format("d[d] h[h] m[m] s[s]");
    return `Daily reset in ${duration} (at ${time(resetAt.unix(), "t")})`;
  }
  // TODO: Add emoji for active events
  // prettier-ignore
  if (times.active) return `**Ongoing:** Ends in ${times.duration} (at ${time(times.endTime!.unix(), "t")})\nNext Occurence: ${time(times.nextTime.unix(), "t")}`;
  return `Next Occurence: In ${times.duration} (at ${time(times.nextTime.unix(), "t")})`;
}
