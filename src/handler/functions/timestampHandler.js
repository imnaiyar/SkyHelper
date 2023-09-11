const {EmbedBuilder, Client} = require('discord.js')
const moment = require("moment-timezone");
function isTimezoneValid(timezone) {
  return moment.tz.zone(timezone) !== null;
};
function isTimeStringValid(timeString) {
  const timeRegex = /^(0[0-9]|1[0-9]|2[0-3])\s([0-5][0-9])\s([0-5][0-9])$/;
  return timeRegex.test(timeString);
}
function convertTime(interaction) {
  const { options } = interaction;

  const Time = options.getString("time");
  if (!isTimeStringValid(Time)) {
    interaction.reply({ content: `Invalid time format. Please provide time in \`HH mm ss\` format.`, ephemeral: true });
    return;
  }

  let timezone = options.getString("timezone");
  if (!timezone) {
    timezone = "America/Los_Angeles"; // default timezone to Los Angeles
  } else if (!isTimezoneValid(timezone)) {
    interaction.reply({ content: "Invalid timezone. Please provide a correct one. Use the format: `Continent/City`\nYou can use this website to get your timezone if you don't know it already -> https://timezonedb.com/time-zones", ephemeral: true});
    return;
  }
  const date = options.getInteger("date");
  const month = options.getInteger("month");
  const year = options.getInteger("year");

  const currentDate = new Date();
  
  const cDate = date || currentDate.getDate();
  const Year = year || currentDate.getFullYear();
  const Month = month || currentDate.getMonth() + 1;

    timestamp = moment
      .tz(
        `${cDate} ${Month} ${Year} ${Time}`,
        "DD MM YYYY HH mm ss",  timezone
      )
      .valueOf();


  const utcTimestamp = moment.utc(timestamp).valueOf();
  const offset = moment.tz(timezone).utcOffset();
  const offsetHours = Math.abs(Math.floor(offset / 60));
  const offsetMinutes = Math.abs(offset % 60);
  const offsetString = `UTC${offset >= 0 ? "+" : "-" }${offsetHours
    .toString()
    .padStart(2, "0")}:${offsetMinutes.toString().padStart(2, "0")}`;

  let result = "";
  const date1 = `<t:${Math.floor(utcTimestamp / 1000)}:d>`;
  const date2 = `<t:${Math.floor(utcTimestamp / 1000)}:D>`;
  const shortTime = `<t:${Math.floor(utcTimestamp / 1000)}:t>`;
  const longTime = `<t:${Math.floor(utcTimestamp / 1000)}:T>`;
  const shortDateAndTime = `<t:${Math.floor(utcTimestamp / 1000)}:f>`;
  const longDateAndTime = `<t:${Math.floor(utcTimestamp / 1000)}:F>`;
  const minutes = `<t:${Math.floor(utcTimestamp / 1000)}:R>`;

  const format = options.getString("format");
  if (!format) {
    result = new EmbedBuilder()
    .setAuthor({ name: `Unix Time Conversion`})
    .setColor('DarkGold')
    .setDescription("If you are on mobile, long press on the code blocks to copy.")
    .addFields(
      {name: `Date (1) - ${date1}`, value: `\`\`\`${date1}\`\`\``},
      { name: `Date (2) - ${date2}`, value: `\`\`\`${date2}\`\`\``},
      { name: `Short Time - ${shortTime}`, value : `\`\`\`${shortTime}\`\`\``},
      { name: `Long Time - ${longTime}`, value: `\`\`\`${longTime}\`\`\``},
      { name: `Short Date and Time - ${shortDateAndTime}`, value: `\`\`\`${shortDateAndTime}\`\`\``},
      { name: `Long Date and Time - ${longDateAndTime}`, value: `\`\`\`${longDateAndTime}\`\`\``},
      { name: `Relative - ${minutes}`, value: `\`\`\`${minutes}\`\`\``}
      )
    .setFooter({ text: `for ${interaction.user.id}`, iconURL: interaction.user.displayAvatarURL() });

  } else {
    switch (format) {
      case "date1":
        result = new EmbedBuilder()
        .setAuthor({ name: `Unix Time Conversion`})
        .setColor('DarkGold')
        .setDescription("If you are on mobile, long press on the code blocks to copy.")
        .addFields(
          {name: `Date (1) - ${date1}`, value: `\`\`\`${date1}\`\`\``}
        )
        .setFooter({ text: `for ${interaction.user.id}`, iconURL: interaction.user.displayAvatarURL() });
        break;
      case "date2":
        result = new EmbedBuilder()
        .setAuthor({ name: `Unix Time Conversion`})
        .setColor('DarkGold')
        .setDescription("If you are on mobile, long press on the code blocks to copy.")
        .addFields(
          {name: `Date (1) - ${date2}`, value: `\`\`\`${date2}\`\`\``}
        )
        .setFooter({ text: `for ${interaction.user.id}`, iconURL: interaction.user.displayAvatarURL() });
        break;
      case "shortTime":
        result = new EmbedBuilder()
        .setAuthor({ name: `Unix Time Conversion`})
        .setColor('DarkGold')
        .setDescription("If you are on mobile, long press on the code blocks to copy.")
        .addFields(
          {name: `Short Time - ${shortTime}`, value: `\`\`\`${shortTime}\`\`\``}
        )
        .setFooter({ text: `for ${interaction.user.id}`, iconURL: interaction.user.displayAvatarURL() });;
        break;
      case "longTime":
        result = new EmbedBuilder()
        .setAuthor({ name: `Unix Time Conversion`})
        .setColor('DarkGold')
        .setDescription("If you are on mobile, long press on the code blocks to copy.")
        .addFields(
          {name: `Long Time - ${longTime}`, value: `\`\`\`${longTime}\`\`\``}
        )
        .setFooter({ text: `for ${interaction.user.id}`, iconURL: interaction.user.displayAvatarURL() });
        break;
      case "shortDateAndTime":
        result = new EmbedBuilder()
        .setAuthor({ name: `Unix Time Conversion`})
        .setColor('DarkGold')
        .setDescription("If you are on mobile, long press on the code blocks to copy.")
        .addFields(
          {name: `Short Date and Time - ${shortDateAndTime}`, value: `\`\`\`${shortDateAndTime}\`\`\``}
        )
        .setFooter({ text: `for ${interaction.user.id}`, iconURL: interaction.user.displayAvatarURL() });
        break;
      case "longDateAndTime":
        result = new EmbedBuilder()
        .setAuthor({ name: `Unix Time Conversion`})
        .setColor('DarkGold')
        .setDescription("If you are on mobile, long press on the code blocks to copy.")
        .addFields(
          {name: `Long Date and Time - ${longDateAndTime}`, value: `\`\`\`${longDateAndTime}\`\`\``}
        )
        .setFooter({ text: `for ${interaction.user.id}`, iconURL: interaction.user.displayAvatarURL() });
        break;
      case "minutes":
        result = new EmbedBuilder()
        .setAuthor({ name: `Unix Time Conversion`})
        .setColor('DarkGold')
        .setDescription("If you are on mobile, long press on the code blocks to copy.")
        .addFields(
          {name: `Relative - ${minutes}`, value: `\`\`\`${minutes}\`\`\``}
        )
        .setFooter({ text: `for ${interaction.user.id}`, iconURL: interaction.user.displayAvatarURL() });
        break;
    }
  }

  const offset1 = `\nUTC Offset - \`${offsetString}\``;

  interaction.reply({ content: `${offset1}`, embeds: [result] });
}

module.exports = {convertTime}
