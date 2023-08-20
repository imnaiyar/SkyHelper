const moment = require("moment-timezone");
function isTimezoneValid(timezone) {
  return moment.tz.zone(timezone) !== null;
};
function isTimeStringValid(timeString) {
  const timeRegex = /^(0[0-9]|1[0-9]|2[0-3])\s([0-5][0-9])\s([0-5][0-9])$/;
  return timeRegex.test(timeString);
}
function timestampInteraction(interaction) {
  const { options } = interaction;

  const timeString = options.getString("time");
  if (!isTimeStringValid(timeString)) {
    interaction.reply({ content: `Invalid time format. Please provide time in \`HH mm ss\` format.`, ephemeral: true });
    return;
  }
  const formattedTimeString = `\`${timeString}\``; // Add backticks to escape the time string

  let timezone = options.getString("timezone");
  if (!timezone) {
    timezone = "America/Los_Angeles"; // Set default timezone to Los Angeles
  } else if (!isTimezoneValid(timezone)) {
    interaction.reply({ content: "Invalid timezone. Please provide a correct one. Use the format: `Continent/City`\nYou can use this website to get your timezone if you don't know it already -> https://timezonedb.com/time-zones", ephemeral: true});
    return;
  }
  const date = options.getInteger("date");
  const month = options.getString("month");
  const year = options.getInteger("year");

  const currentDate = new Date();
  const currentYear = year || currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDateValue = date || currentDate.getDate();
const dateValue = date || currentDateValue;
  const monthValue = month || currentMonth;
  const yearValue = year || currentYear;
  console.log('Date, Month and Year:', dateValue, monthValue, yearValue)
    timestamp = moment
      .tz(
        `${dateValue} ${monthValue} ${yearValue} ${formattedTimeString}`,
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

  if (!date || !month && !format) {
    result = `Short Time - ${shortTime}\nLong Time - ${longTime}\n`;
  } else if (date && month && year && !format) {
    result = `Date (1) - ${date1}\nDate (2) - ${date2}\nShort Time - ${shortTime}\nLong Time - ${longTime}\nShort Date and Time - ${shortDateAndTime}\nLong Date and Time - ${longDateAndTime}\nMinutes - ${minutes}\n`;
  } else {
    switch (format) {
      case "date1":
        result = `Date (1) - ${date1}`;
        break;
      case "date2":
        result = `Date (2) - ${date2}`;
        break;
      case "shortTime":
        result = `Short Time - ${shortTime}`;
        break;
      case "longTime":
        result = `Long Time - ${longTime}`;
        break;
      case "shortDateAndTime":
        result = `Short Date and Time - ${shortDateAndTime}`;
        break;
      case "longDateAndTime":
        result = `Long Date and Time - ${longDateAndTime}`;
        break;
      case "minutes":
        result = `Minutes - ${minutes}`;
        break;
    }
  }

  result += `UTC Offset - \`${offsetString}\``;

  interaction.reply({ content: result });
}

module.exports = {timestampInteraction}
