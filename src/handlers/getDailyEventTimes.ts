import { SpiritsData, Times } from "#libs/types";
import { SkyHelper } from "#structures";
import { EmbedBuilder, time } from "discord.js";
import getEvent from "#handlers/getSpecialEvent";
import moment from "moment-timezone";
import "moment-duration-format";

export default (offset: number): Times => {
  const now = moment().tz("America/Los_Angeles");
  const start = now.clone().startOf("day").add(offset, "minutes");
  const end = start.clone().add(15, "minute");
  while (start.isBefore(now) && end.isBefore(now)) {
    start.add(2, "hours");
    end.add(2, "hours");
  }
  if (now.isBetween(start, end)) {
    return {
      active: true,
      startTime: start,
      endTime: end,
      nextTime: start.clone().add(2, "hours"),
      duration: moment.duration(end.diff(now)).format("d[d] h[h] m[m] s[s]"),
    };
  } else {
    return {
      active: false,
      nextTime: start,
      duration: moment.duration(start.diff(now)).format("d[d] h[h] m[m] s[s]"),
    };
  }
};

export const getEdenTimes = (): Times => {
  const now = moment().tz("America/Los_Angeles");
  const currentDayOfWeek = now.day();
  const daysToAdd = 0 - currentDayOfWeek;
  const edenTargetTime = now.clone().startOf("day").add(daysToAdd, "days");
  if (daysToAdd <= 0 || (daysToAdd === 0 && now.isAfter(edenTargetTime))) {
    edenTargetTime.add(7, "days");
  }
  if (now.isSameOrAfter(edenTargetTime)) {
    edenTargetTime.add(7, "days");
  }
  const dur = moment.duration(edenTargetTime.diff(now)).format("d[d] h[h] m[m] s[s]");
  return {
    active: false,
    nextTime: edenTargetTime,
    duration: dur,
  };
};

import { getDailyEventTimes } from "#handlers";
import { getTS } from "#handlers";
export const getEventEmbed = async (client: SkyHelper): Promise<EmbedBuilder> => {
  const geyser = getTimes(0, "Geyser");
  const grandma = getTimes(30, "Grandma");
  const turtle = getTimes(50, "Turtle");
  const reset = getTimes(0, "Daily");
  const eden = `At ${time(getEdenTimes().nextTime.toDate(), "F")} (in ${getEdenTimes().duration}`;
  const tsData = await getTS();
  const event = await getEvent();
  const eventDesc =
    typeof event === "string"
      ? "No Active Events"
      : `**Event**: ${event.name}\n**From**: ${time(event.start.unix(), "F")} - ${time(event.end.unix(), "F")}\n**Total Days**: ${event.days}\n**${event.active ? "Ends In" : "Starts In"}**: ${event.duration}`;
  let tsDesc: string;
  if (!tsData) {
    tsDesc = "Unknown!";
  } else {
    const spirit: SpiritsData = client.spiritsData[tsData.value as keyof typeof client.spiritsData];
    const emote = spirit?.emote?.icon || spirit?.call?.icon || spirit?.stance?.icon || spirit?.action?.icon || "❓";
    tsDesc = tsData.visiting
      ? `**Currently Visiting:** ${emote} ${spirit?.name || "Yet to be updated"}\n**Departure:** At ${time(tsData.nextVisit.clone().add(3, "days").endOf("day").toDate(), "F")} (in ${tsData.duration})`
      : `${emote} ${spirit?.name || "Unknown Spirit"} arriving at ${time(tsData.nextVisit.toDate(), "F")} (in ${tsData.duration})`;
  }
  const embed = new EmbedBuilder()
    .setAuthor({ name: `SkyTimes`, iconURL: client.user.displayAvatarURL() })
    .setTitle("Times")
    .setColor("Random")
    .addFields(
      {
        name: geyser.title,
        value: geyser.description,
        inline: true,
      },
      {
        name: grandma.title,
        value: grandma.description,
        inline: true,
      },
      {
        name: turtle.title,
        value: turtle.description,
        inline: true,
      },
      {
        name: "Daily " + reset.title,
        value: reset.description,
        inline: true,
      },
      {
        name: "Eden Reset",
        value: eden,
        inline: true,
      },
      {
        name: "Traveling Spirit",
        value: tsDesc,
        inline: true,
      },
      {
        name: "Events",
        value: eventDesc,
        inline: true,
      },
    )
    .setTimestamp();
  return embed;
};

export function getTimes(offset: number, type: string): { title: string; description: string } {
  const times = getDailyEventTimes(offset);
  if (type.toLocaleLowerCase().includes("daily")) {
    const resetAt = moment().tz("America/Los_Angeles").startOf("day").add(1, "day");
    const duration = moment.duration(resetAt.diff(moment().tz("America/Los_Angeles"))).format("d[d] h[h] m[m] s[s]");
    return { title: type, description: `At ${time(resetAt.unix(), "t")} (in ${duration})` };
  }
  // TODO: Add emoji for active events

  if (times.active) {
    return {
      title: type + " <a:uptime:1228956558113771580>",
      description: `**Ongoing:** Ends in ${times.duration} (at ${time(times.endTime!.unix(), "t")})\nNext Occurence: ${time(times.nextTime.unix(), "t")}`,
    };
  }
  return { title: type, description: `**Next:** At ${time(times.nextTime.unix(), "t")} (in ${times.duration})` };
}
