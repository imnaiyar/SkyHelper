const {EmbedBuilder, Client, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js')
const { unixPage } = require('@root/website/mainPage')
const config = require('@root/config')
const moment = require("moment-timezone");
function isTimezoneValid(timezone) {
  return moment.tz.zone(timezone) !== null;
};
function isTimeStringValid(timeString) {
  const timeRegex = /^(0[0-9]|1[0-9]|2[0-3])\s([0-5][0-9])\s([0-5][0-9])$/;
  return timeRegex.test(timeString);
}
async function convertTime(interaction) {
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
  const unixTime = Math.floor(utcTimestamp / 1000)
  const date1 = `<t:${unixTime}:d>`;
  const date2 = `<t:${unixTime}:D>`;
  const shortTime = `<t:${unixTime}:t>`;
  const longTime = `<t:${unixTime}:T>`;
  const shortDateAndTime = `<t:${unixTime}:f>`;
  const longDateAndTime = `<t:${unixTime}:F>`;
  const minutes = `<t:${unixTime}:R>`;

  const format = options.getString("format");

  result = new EmbedBuilder()
    .setAuthor({ name: `Unix Time Conversion`})
    .setColor('DarkGold')
    .setDescription("If you are on mobile, long press on the code blocks to copy (android only).")
    .setFooter({ text: `for ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });
  if (!format) {
    result.addFields(
      {name: `Date (1) - ${date1}`, value: `\`\`\`${date1}\`\`\``},
      { name: `Date (2) - ${date2}`, value: `\`\`\`${date2}\`\`\``},
      { name: `Short Time - ${shortTime}`, value : `\`\`\`${shortTime}\`\`\``},
      { name: `Long Time - ${longTime}`, value: `\`\`\`${longTime}\`\`\``},
      { name: `Short Date and Time - ${shortDateAndTime}`, value: `\`\`\`${shortDateAndTime}\`\`\``},
      { name: `Long Date and Time - ${longDateAndTime}`, value: `\`\`\`${longDateAndTime}\`\`\``},
      { name: `Relative - ${minutes}`, value: `\`\`\`${minutes}\`\`\``}
      );

  } else {
    switch (format) {
      case "date1":
        result.addFields(
          {name: `Date (1) - ${date1}`, value: `\`\`\`${date1}\`\`\``}
        ).
        break;
      case "date2":
        result.addFields(
          {name: `Date (1) - ${date2}`, value: `\`\`\`${date2}\`\`\``}
        );
        break;
      case "shortTime":
        result.addFields(
          {name: `Short Time - ${shortTime}`, value: `\`\`\`${shortTime}\`\`\``}
        );
        break;
      case "longTime":
        result.addFields(
          {name: `Long Time - ${longTime}`, value: `\`\`\`${longTime}\`\`\``}
        );
        break;
      case "shortDateAndTime":
        result.addFields(
          {name: `Short Date and Time - ${shortDateAndTime}`, value: `\`\`\`${shortDateAndTime}\`\`\``}
        );
        break;
      case "longDateAndTime":
        result.addFields(
          {name: `Long Date and Time - ${longDateAndTime}`, value: `\`\`\`${longDateAndTime}\`\`\``}
        );
        break;
      case "minutes":
        result.addFields(
          {name: `Relative - ${minutes}`, value: `\`\`\`${minutes}\`\`\``}
        )
        break;
    }
  }
const fieldsArray = Array.from(result.data.fields);

let fieldsData = '';

for (const field of fieldsArray) {
    fieldsData += `${field.name}\n\n-------------------\n\n`;
}
 const offset1 = `\nUTC Offset - \`${offsetString}\``;
 await unixPage(interaction, fieldsArray, unixTime, offsetString);
     const  row = new ActionRowBuilder()
       .addComponents( 
           new ButtonBuilder().setLabel("Copy").setURL(`${config.WEB_URL}/${interaction.id}`).setStyle(ButtonStyle.Link) 
         ) 
     
  
  interaction.reply({ content: `${offset1}`, embeds: [result], components: [row], ephemeral: true});
}

module.exports = {convertTime}
