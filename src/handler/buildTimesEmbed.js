const { skyTimes } = require("@commands/skytimes/sub/skyTimes");
const moment = require("moment-timezone");
const { EmbedBuilder, time } = require("discord.js");
const config = require("@root/config");

/**
 * Returns an embed with SkyTimes data
 * @param {import('@src/frameworks').SkyHelper} client
 * @param {string} footer
 * @returns
 */
module.exports = async (client, footer) => {
  const { geyserResultStr, grandmaResultStr, resetResultStr, edenResultStr, turtleResultStr, eventDescription } =
    await skyTimes(client);
  const result = new EmbedBuilder()
    .setAuthor({
      name: `SkyTimes`,
      iconURL: config.BOT_ICON,
    })
    .addFields(
      {
        name: "Geyser Time",
        value: geyserResultStr,
        inline: true,
      },
      {
        name: "Grandma Times",
        value: grandmaResultStr,
        inline: true,
      },
      {
        name: "Turtle Times",
        value: turtleResultStr,
        inline: true,
      },
      {
        name: "Next Reset",
        value: resetResultStr,
        inline: true,
      },
      {
        name: "Next Eden Reset",
        value: edenResultStr,
        inline: true,
      },
      {
        name: "Traveling Spirit",
        value: getTS(client) ?? "An Error Occured",
        inline: true,
      },
      {
        name: "Event",
        value: eventDescription,
        inline: true,
      },
    )
    .setTimestamp(Date.now())
    .setFooter({
      text: footer,
      iconURL: config.BOT_ICON,
    });

  return { result };
};

function getTS(client) {
  const { name, visitDate, departDate, value, index, spiritImage } = client.ts;
  const now = moment().tz(client.timezone);
  const lastVisitDate = moment.tz(visitDate, "DD-MM-YYYY", client.timezone).startOf("day");
  const lastDepartDate = lastVisitDate.clone().add("3", "day").endOf("day");
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
      embed = `Next traveling spirit is scheduled to arrive at ${time(
        nextVisitDay.toDate(),
        "F",
      )} (${startDur})\n\n**Visiting Dates**: ${visitingDates}`;
    }

    if (nextVisitDay.isSame(lastVisitDate)) {
      const spirit = client.spiritsData[value];
      const emote = spirit.call?.icon || spirit.emote?.icon || spirit.action?.icon || spirit.stance?.icon;
      embed = `${emote} ${name} is scheduled to arrive at ${time(nextVisitDay.toDate(), "F")} (${startDur})`;
    }
  }

  if (now.isBetween(nextVisitDay, nextDepartDate)) {
    if (lastDepartDate.isBefore(nextDepartDate)) {
      embed = `A spirit is currently visiting the realms of Sky and will depart at ${time(
        nextDepartDate.toDate(),
        "D",
      )} (${endDur})\n\n**Visiting Dates:** ${visitingDates}`;
    }

    if (lastDepartDate.isSame(nextDepartDate)) {
      const spirit = client.spiritsData[value];
      const emote = spirit.call?.icon || spirit.emote?.icon || spirit.action?.icon || spirit.stance?.icon;
      embed = `${emote} ${spirit.name} is currently visiting the realms of Sky. They will depart at ${time(
        nextDepartDate.toDate(),
        "F",
      )} (${endDur})`;
    }
  }
  return embed;
}
