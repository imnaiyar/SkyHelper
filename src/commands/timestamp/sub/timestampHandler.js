const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, time } = require("discord.js");
const config = require("@root/config");
const moment = require("moment-timezone");

function isTimezoneValid(timezone) {
  return moment.tz.zone(timezone) !== null;
}

function isTimeStringValid(timeString) {
  const timeRegex = /^(0[0-9]|1[0-9]|2[0-3])\s([0-5][0-9])\s([0-5][0-9])$/;
  return timeRegex.test(timeString);
}

async function convertTime(interaction) {
  const { options } = interaction;

  const Time = options.getString("time");
  if (!isTimeStringValid(Time)) {
    return interaction.reply({
      content: "Invalid time format. Please provide time in `HH mm ss` format.",
      ephemeral: true,
    });
  }

  const timezone = options.getString("timezone") || "America/Los_Angeles";
  if (!isTimezoneValid(timezone)) {
    return interaction.reply({
      content: "Invalid timezone. Please provide a correct one. Use the format: `Continent/City`",
      ephemeral: true,
    });
  }

  const currentDate = moment().tz(timezone);
  const date = options.getInteger("date") || currentDate.date();
  const month = options.getInteger("month") || currentDate.month() + 1;
  const year = options.getInteger("year") || currentDate.year();
  const fDate = `${date}-${month}-${year}`;
  const timestamp = moment.tz(`${fDate} ${Time}`, "DD-MM-YYYY HH mm ss", timezone);

  if (!moment(timestamp).isValid()) {
    return interaction.reply({
      content: `\`${fDate}\` does not exist, please provide a valid date.`,
      ephemeral: true,
    });
  }

  const offset = moment.tz(timezone).utcOffset();
  const offsetString = `${offset >= 0 ? "+" : "-"}${Math.abs(Math.floor(offset / 60))
    .toString()
    .padStart(2, "0")}:${Math.abs(offset % 60)
    .toString()
    .padStart(2, "0")} UTC`;

  const formats = ["date1", "date2", "shortTime", "longTime", "shortDateAndTime", "longDateAndTime", "minutes"];
  const formatted = {
    date1: "Date 1",
    date2: "Date 2",
    shortTime: "Short Time",
    longTime: "Long Time",
    shortDateAndTime: "Short Date and Time",
    longDateAndTime: "Long Date and Time",
    minutes: "Relative",
  };
  const selectedFormat = options.getString("format");
  const result = new EmbedBuilder()
    .setAuthor({ name: `Unix Time Conversion` })
    .setColor("DarkGold")
    .setDescription("Follow the link attached for easy copying.")
    .setFooter({
      text: `for ${interaction.user.username}`,
      iconURL: interaction.user.displayAvatarURL(),
    });

  for (const format of formats) {
    if (!selectedFormat || format === selectedFormat) {
      const formatKey = formatted[format];
      const timeValue = time(
        timestamp.toDate(),
        format === "minutes"
          ? "R"
          : format === "date1"
            ? "d"
            : format === "date2"
              ? "D"
              : format === "shortDateAndTime"
                ? "f"
                : format === "longDateAndTime"
                  ? "F"
                  : format === "shortTime"
                    ? "t"
                    : "T",
      );

      result.addFields({
        name: `${formatKey} - ${timeValue}`,
        value: `\`\`\`${timeValue}\`\`\``,
        inline: true,
      });
    }
  }

  const fieldsArray = Array.from(result.data.fields);
  const fieldsData = [];

  const formatMap = {
    "Date 1": "DD/MM/YYYY",
    "Date 2": "DD MMMM YYYY",
    "Short Time": "HH:mm",
    "Long Time": "HH:mm:ss",
    "Short Date and Time": "DD MMMM YYYY HH:mm",
    "Long Date and Time": "dddd, DD MMMM YYYY HH:mm",
    Relative: null,
  };

  for (const field of fieldsArray) {
    for (const [name, format] of Object.entries(formatMap)) {
      if (field.name.startsWith(name)) {
        fieldsData.push({
          name,
          example: format ? timestamp.format(format) : timestamp.fromNow(),
          value: field.value,
        });
        break;
      }
    }
  }
  const providedTime = timestamp.format("DD/MM/YYYY HH:mm:ss");
  const offset1 = `\nOffset - \` ${offsetString} \``;
  const { buildTimeHTML } = require("@src/handler");
  const { timeRoute } = require("@root/web/server");
  const webPath = `timestamp/${interaction.id}`;
  const content = buildTimeHTML(interaction, fieldsData, offsetString, timezone, providedTime);

  timeRoute(webPath, content);
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel("Copy").setURL(`${config.WEB_URL}/${webPath}`).setStyle(ButtonStyle.Link),
  );

  return interaction.reply({
    content: `${offset1}`,
    embeds: [result],
    components: [row],
    ephemeral: true,
  });
}

module.exports = { convertTime };
