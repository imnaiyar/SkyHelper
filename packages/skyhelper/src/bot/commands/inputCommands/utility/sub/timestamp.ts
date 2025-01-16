import type { getTranslator } from "#bot/i18n";
import { ChatInputCommandInteraction, EmbedBuilder, type TimestampStylesString, time } from "discord.js";
import moment from "moment-timezone";

export async function handleTimestamp(
  interaction: ChatInputCommandInteraction,
  t: ReturnType<typeof getTranslator>,
): Promise<void> {
  const { options } = interaction;

  const Time = options.getString("time");
  if (!isTimeStringValid(Time!)) {
    return void (await interaction.reply({
      content: t("commands:UTILS.RESPONSES.INVALID-FORMAT"),
      ephemeral: true,
    }));
  }

  const timezone = options.getString("timezone") || "America/Los_Angeles";
  if (!isTimezoneValid(timezone)) {
    return void (await interaction.reply({
      content: t("commands:UTILS.RESPONSES.INVALID-TIMEZONE"),
      ephemeral: true,
    }));
  }

  const currentDate = moment().tz(timezone);
  const date = options.getInteger("date") || currentDate.date();
  const month = options.getInteger("month") || currentDate.month() + 1;
  const year = options.getInteger("year") || currentDate.year();
  const fDate = `${date}-${month}-${year}`;
  const timestamp = moment.tz(`${fDate} ${Time}`, "DD-MM-YYYY HH mm ss", timezone);

  if (!moment(timestamp).isValid()) {
    return void (await interaction.reply({
      content: `\`${fDate}\` does not exist, please provide a valid date.`,
      ephemeral: true,
    }));
  }

  const offset = moment.tz(timezone).utcOffset();
  const offsetString = `${offset >= 0 ? "+" : "-"}${Math.abs(Math.floor(offset / 60))
    .toString()
    .padStart(2, "0")}:${Math.abs(offset % 60)
    .toString()
    .padStart(2, "0")} UTC`;

  const getFormat = (type?: TimestampStylesString) => {
    return type
      ? `${time(timestamp.toDate(), type)} (\`<t:${timestamp.unix()}:${type}>\`)`
      : `${time(timestamp.toDate())} (\`<t:${timestamp.unix()}>\`)`;
  };
  const result = new EmbedBuilder()
    .setAuthor({ name: `Unix Time Conversion` })
    .setColor("DarkGold")
    .setDescription(
      `- **Default:** ${getFormat()}\n- **Relative:** ${getFormat("R")}\n- **Short Time:** ${getFormat(
        "t",
      )}\n- **Long Date:** ${getFormat("T")}\n- **Short Date:** ${getFormat("d")}\n- **Long Date:** ${getFormat(
        "D",
      )}\n- **Short Date & Time:** ${getFormat("f")}\n- **Long Date & Time:** ${getFormat("F")}`,
    )
    .setFooter({
      text: `UNIX Timestamp.`,
      iconURL: interaction.user.displayAvatarURL(),
    });

  const offset1 = `\nOffset: \` ${offsetString} \``;
  return void (await interaction.reply({
    content: `${offset1}\nTimestamp: \`${timestamp.unix()}\``,
    embeds: [result],
    /*  components: [row], */
    ephemeral: true,
  }));
}

const isTimezoneValid = (timezone: string) => {
  return moment.tz.zone(timezone) !== null;
};

const isTimeStringValid = (timeString: string) => {
  const timeRegex = /^(0[0-9]|1[0-9]|2[0-3])\s([0-5][0-9])\s([0-5][0-9])$/;
  return timeRegex.test(timeString);
};
