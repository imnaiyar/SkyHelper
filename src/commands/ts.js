const moment = require("moment-timezone");
const { EmbedBuilder, time, ApplicationCommandOptionType } = require("discord.js");
const handleSpirits = require("./guides/sub/shared/handleSpirits");
/**
 * @type {import('@src/frameworks').SlashCommands}
 */

module.exports = {
  cooldown: 15,
  data: {
    name: "traveling-spirit",
    description: "get current/upcoming ts details",
    options: [
      {
        name: "hide",
        description: "hides the guide from others",
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
    ],
    longDesc: "To be decided",
  },

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   * @param {import('@src/frameworks').SkyHelper} client
   */
  async execute(interaction, client) {
    const hide = interaction.options.getBoolean("hide") || false;
    await interaction.deferReply({ ephemeral: hide });
    const { name, visitDate, departDate, value, index, spiritImage, emote } = client.ts;
    const now = moment().tz(client.timezone);
    const lastVisitDate = moment.tz(visitDate, "DD-MM-YYYY", client.timezone).startOf("day");
    const lastDepartDate = moment.tz(departDate, "DD-MM-YYYY", client.timezone).endOf("day");
    const nextDepartDate = lastDepartDate.clone();
    while (now.isAfter(nextDepartDate)) {
      nextDepartDate.add(14, "days");
    }
    const nextVisitDay = nextDepartDate.clone().subtract(3, "day").startOf("day");
    const visitingDates = `${time(nextVisitDay.toDate(), "D")} - ${time(nextDepartDate.toDate(), "D")}`;
    let embed;
    const endDur = moment.duration(nextDepartDate.diff(now)).format("d[d] h[h] mm[m] ss[s]");
    if (now.isBefore(nextVisitDay)) {
      const startDur = moment.duration(nextVisitDay.diff(now)).format("d[d] h[h] mm[m] ss[s]");
      if (nextVisitDay.isAfter(lastVisitDate)) {
        embed = new EmbedBuilder()
          .setAuthor({ name: `Traveling Spirit Summary` })
          .setTitle("Traveling Spirit")
          .setDescription(
            `Next traveling spirit is scheduled to arrive at ${time(
              nextVisitDay.toDate(),
              "F",
            )} (${startDur})\n\n**Visiting Dates**: ${visitingDates}`,
          );
      }

      if (nextVisitDay.isSame(lastVisitDate)) {
        const spirit = client.spiritsData[value];
        embed = new EmbedBuilder()
          .setAuthor({ name: `Traveling Spirit Summary #${index}`, iconURL: spiritImage })
          .setTitle(`${emote} ${name}`)
          .setDescription(
            `is scheduled to arrive at ${time(
              nextVisitDay.toDate(),
              "F",
            )} (${startDur}) during which SkyKids can get a chance to get acquanted and buy their cosmetics.\n\n**Visiting Dates:** ${visitingDates}\n**Realm:** ${
              client.emojisMap.get("realms")[spirit.realm]
            } ${spirit.realm}\n**Season:**${client.emojisMap.get("seasons")[spirit.season]} Season of ${spirit.season}`,
          );
        await handleSpirits(interaction, value, false, embed);
        return;
      }
    }

    if (now.isBetween(nextVisitDay, nextDepartDate)) {
      if (lastDepartDate.isBefore(nextDepartDate)) {
        embed = new EmbedBuilder()
          .setAuthor({ name: `Traveling Spirit Summary` })
          .setTitle("Traveling Spirit")
          .setDescription(
            `A spirit is currently visiting the realms of Sky and will depart at ${time(
              nextDepartDate.toDate(),
              "D",
            )} (${endDur})\n\n**Visiting Dates:** ${visitingDates}`,
          )
          .setFooter({ text: "Rest of the data will soon be updated, thank you for your patience" });
      }

      if (lastDepartDate.isSame(nextDepartDate)) {
        const spirit = client.spiritsData[value];
        embed = new EmbedBuilder()
          .setAuthor({ name: `Traveling Spirit Summary #${index}`, iconURL: spiritImage })
          .setTitle(`${emote} ${spirit.name}`)
          .setDescription(
            `is currently visiting the realms of Sky. They will enjoy their stay till ${time(
              nextDepartDate.toDate(),
              "F",
            )} (${endDur}) during which SkyKids can get a chance to get acquanted and buy their cosmetics.\n\n**Vsiting Dates:** ${visitingDates}\n**Realm:** ${
              client.emojisMap.get("realms")[spirit.realm]
            } ${spirit.realm}\n**Season:**${client.emojisMap.get("seasons")[spirit.season]} Season of ${spirit.season}`,
          )
          .setFields({
            name: "Previous Visits",
            value: spirit.ts.returned
              ? spirit.ts.dates
                  .map((date) => {
                    let indx;
                    const formatDate = date
                      .replace(/\([^)]+\)/g, (match) => {
                        indx = match.trim();
                        return "";
                      })
                      .trim();
                    const dateM = moment.tz(formatDate, "MMMM DD, YYYY", "America/Los_Angeles").startOf("day");
                    const dateE = dateM.clone().add(3, "days");
                    return `- ${time(dateM.toDate(), "D")} - ${time(dateE.toDate(), "D")} ${indx}`;
                  })
                  .join("\n")
              : "<:purpleright:1207596527737118811> No previous visits",
          });

        await handleSpirits(interaction, value, false, embed);
        return;
      }
    }

    interaction.editReply({ embeds: [embed] }).catch((err) => {
      client.logger.error("Error while serving TS Details", err);
    });
  },
};
