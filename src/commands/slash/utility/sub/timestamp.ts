import { ChatInputCommandInteraction, EmbedBuilder, TimestampStylesString, time } from "discord.js";
import moment from "moment-timezone";

export async function handleTimestamp(interaction: ChatInputCommandInteraction): Promise<void> {
  const { options } = interaction;

  const Time = options.getString("time");
  if (!isTimeStringValid(Time!)) {
    return void (await interaction.reply({
      content: "Invalid time format. Please provide time in `HH mm ss` format.",
      ephemeral: true,
    }));
  }

  const timezone = options.getString("timezone") || "America/Los_Angeles";
  if (!isTimezoneValid(timezone)) {
    return void (await interaction.reply({
      content:
        "Invalid timezone. Please provide a correct one. Use the format: `Continent/City`.\nUse this link to find your timezone if you are not sure: <https://timezonedb.com/time-zones>",
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
      ? `${time(timestamp.toDate(), type)} (\`<t:${timestamp.unix()}:${type}\`>)`
      : `${time(timestamp.toDate())} (\`<t:${timestamp.unix()}>\`)`;
  };
  const result = new EmbedBuilder()
    .setAuthor({ name: `Unix Time Conversion` })
    .setColor("DarkGold")
    .setDescription(
      `**Default:** ${getFormat()}\n**Relative:** ${getFormat("R")}\n**Short Time:** ${getFormat(
        "t",
      )}\n**Long Date:** ${getFormat("T")}\n**Short Date:** ${getFormat("d")}\n**Long Date:** ${getFormat(
        "D",
      )}\n**Short Date & Time:** ${getFormat("f")}\n**Long Date & Time:** ${getFormat("F")}`,
    )
    .setFooter({
      text: `Follow the link attached for easy copying.`,
      iconURL: interaction.user.displayAvatarURL(),
    });
  /* const fieldsData = [];

  const formatMap = {
    Default: { format: "DD MMMM YYYY HH:mm", type: null },
    "Short Time": { format: "HH:mm", type: "t" },
    "Long Time": { format: "HH:mm:ss", type: "T" },
    "Short Date": { format: "DD/MM/YYYY", type: "d" },
    "Long Date": { format: "DD MMMM YYYY", type: "D" },
    "Short Date & Time": { format: "DD MMMM YYYY HH:mm", type: "f" },
    "Long Date & Time": { format: "dddd, DD MMMM YYYY HH:mm", type: "F" },
    Relative: { format: null, type: "R" },
  };

  for (const [name, data] of Object.entries(formatMap)) {
    fieldsData.push({
      name,
      example: data.format ? timestamp.format(data.format) : timestamp.fromNow(),
      value: data.type ? `<t:${timestamp.unix()}:${data.type}` : `<t:${timestamp.unix()}>`,
    });
  }
  const providedTime = timestamp.format("DD/MM/YYYY HH:mm:ss");
  const { buildTimesHTML } = require("skyhelper-utils");
  const { timeRoute } = require("@root/web/server");
  const webPath = `timestamp/${interaction.id}`;
  const content = buildTimesHTML(interaction, fieldsData, offsetString, timezone, providedTime);

  timeRoute(webPath, content);
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel("Copy").setURL(`${config.WEB_URL}/${webPath}`).setStyle(ButtonStyle.Link),
  ); */
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
