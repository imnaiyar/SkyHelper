import type { TimestampStyles } from "@/types/utils";
import type { InteractionHelper } from "@/utils/classes/InteractionUtil";
import type { APIEmbed } from "@discordjs/core";
import type { InteractionOptionResolver } from "@sapphire/discord-utilities";
import { DateTime } from "luxon";

export async function handleTimestamp(helper: InteractionHelper, options: InteractionOptionResolver): Promise<void> {
  const { client, t } = helper;

  const Time = options.getString("time");
  if (!isTimeStringValid(Time!)) {
    return void (await helper.reply({
      content: t("commands:UTILS.RESPONSES.INVALID-FORMAT"),
      flags: 64,
    }));
  }

  const timezone = options.getString("timezone") || "America/Los_Angeles";
  if (!isTimezoneValid(timezone)) {
    return void (await helper.reply({
      content: t("commands:UTILS.RESPONSES.INVALID-TIMEZONE"),
      flags: 64,
    }));
  }

  const currentDate = DateTime.now().setZone(timezone);
  const day = options.getInteger("date") || currentDate.day;
  const month = options.getInteger("month") || currentDate.month;
  const year = options.getInteger("year") || currentDate.year;
  const fDate = `${day}-${month}-${year}`;
  const timestamp = DateTime.fromObject({ day, month, year }, { zone: timezone });

  if (!timestamp.isValid) {
    return void (await helper.reply({
      content: `\`${fDate}\` does not exist, please provide a valid date.`,
      flags: 64,
    }));
  }

  const offset = currentDate.offset;
  const offsetString = `${offset >= 0 ? "+" : "-"}${Math.abs(Math.floor(offset / 60))
    .toString()
    .padStart(2, "0")}:${Math.abs(offset % 60)
    .toString()
    .padStart(2, "0")} UTC`;

  const getFormat = (type?: TimestampStyles) => {
    return type
      ? `${client.utils.time(timestamp.toUnixInteger(), type)} (\`<t:${timestamp.toUnixInteger()}:${type}>\`)`
      : `${client.utils.time(timestamp.toUnixInteger())} (\`<t:${timestamp.toUnixInteger()}>\`)`;
  };
  const result: APIEmbed = {
    author: { name: "Unix Time Conversion" },
    color: 0xdaa520, // DarkGold color in hex
    description: `- **Default:** ${getFormat()}\n- **Relative:** ${getFormat("R")}\n- **Short Time:** ${getFormat(
      "t",
    )}\n- **Long Date:** ${getFormat("T")}\n- **Short Date:** ${getFormat("d")}\n- **Long Date:** ${getFormat(
      "D",
    )}\n- **Short Date & Time:** ${getFormat("f")}\n- **Long Date & Time:** ${getFormat("F")}`,
    footer: {
      text: "UNIX Timestamp.",
      icon_url: client.utils.getUserAvatar(helper.user),
    },
  };

  const offset1 = `\nOffset: \` ${offsetString} \``;
  return void (await helper.reply({
    content: `${offset1}\nTimestamp: \`${timestamp.toUnixInteger()}\``,
    embeds: [result],
    flags: 64,
  }));
}

const isTimezoneValid = (timezone: string) => {
  return DateTime.local().setZone(timezone).isValid;
};

const isTimeStringValid = (timeString: string) => {
  const timeRegex = /^(0[0-9]|1[0-9]|2[0-3])\s([0-5][0-9])\s([0-5][0-9])$/;
  return timeRegex.test(timeString);
};
