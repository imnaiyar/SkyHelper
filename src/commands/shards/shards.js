const {
  ApplicationCommandOptionType,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
} = require('discord.js');
const { shardsReply } = require('@shards/sub/shardsReply');
const fs = require('fs');
const moment = require('moment-timezone');
const desc = require('@src/cmdDesc');
module.exports = {
  cooldown: 3,
  data: {
    name: 'shards',
    description: 'Get Sky Shards information',
    longDesc: desc.shards,
    options: [
      {
        name: 'date',
        description:
          'Get Shards data for a specific date. (YYYY-MM-DD, e.g 2023-06-28)',
        type: ApplicationCommandOptionType.String,
        required: false,
      },
    ],
  },
  async execute(interaction) {
    const timezone = 'America/Los_Angeles';
    const dateOption = interaction.options.getString('date');

    const regex = /^\d{4,6}-\d{2}-\d{2}$/;

    if (dateOption && !regex.test(dateOption)) {
      interaction.reply({
        content:
          'Invalid date format. Please use the YYYY-MM-DD format. Max input : **275760-09-12**',
        ephemeral: true,
      });
      return;
    }
    let currentDate;
    try {
      if (dateOption) {
        currentDate = moment.tz(dateOption, 'Y-MM-DD', timezone).startOf('day');

        if (!currentDate.isValid()) {
          await interaction.reply({
            content: `\` ${dateOption} \` does not exist, please provide a valid date.`,
            ephemeral: true,
          });
          return;
        }
      } else {
        currentDate = moment().tz(timezone);
      }
    } catch (error) {
      await interaction.reply('An error occurred while processing the date.');
      return;
    }
    const {
      type,
      location,
      rewards,
      colors,
      showButtons,
      thumbUrl,
      noShard,
      eventStatus,
      timeRemaining,
      currentEvent,
      currentSecondEvent,
      dayOfWeek,
    } = await shardsReply(currentDate);
    let result = new EmbedBuilder()
      .setAuthor({
        name: `Shards Info`,
        iconURL:
          'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925',
      })
      .setTitle(`${noShard}`)
      .setTimestamp(Date.now())
      .setFooter({
        text: 'SkyHelper',
        iconURL: interaction.client.user.displayAvatarURL(),
      });
    let disabled;
    if (showButtons) {
      result
        .addFields(
          { name: `Shard Type`, value: `${type} (${rewards})`, inline: true },
          { name: 'Location', value: `${location}`, inline: true },
          { name: 'Status', value: `${eventStatus}` },
          { name: 'Countdown', value: `${timeRemaining}`, inline: true },
        )
        .setColor(colors)
        .setThumbnail(thumbUrl);
      disabled = false;
    } else {
      result
        .setImage(
          'https://media.discordapp.net/attachments/867638574571323424/1155727524911923220/5F1548AC-C7DD-4127-AF6F-0BC388-unscreen.gif',
        )
        .setDescription(`**It's a no shard day.**`)
        .setColor('#9fb686');

      disabled = true;
    }
    const actionRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setEmoji('<a:left:1148644073670975640>')
        .setCustomId('prev')
        .setStyle('1'),
      new ButtonBuilder()
        .setEmoji('<a:right:1148627450608222278>')
        .setCustomId('next')
        .setStyle('1'),
      new ButtonBuilder()
        .setLabel('Timeline')
        .setCustomId('timeline')
        .setDisabled(disabled)
        .setStyle('3'),
      new ButtonBuilder()
        .setLabel('Location/Data')
        .setCustomId('location')
        .setDisabled(disabled)
        .setStyle('3'),
      new ButtonBuilder()
        .setLabel('About Shard')
        .setCustomId('about')
        .setStyle('3'),
    );

    await interaction.deferReply({ ephemeral: true });
    const reply = await interaction.editReply({
      embeds: [result],
      components: [actionRow],
      fetchReply: true,
    });
    const messageId = reply.id;

    saveMessageData({
      time: currentDate.format(),
      messageId,
      timestamp: moment().tz(timezone).format(),
    });
  },
};

function saveMessageData(data) {
  fs.readFile('messageData.json', 'utf8', (err, fileData) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fileData = '[]';
      } else {
        console.error('Error reading file:', err);
        return;
      }
    }

    let jsonData = JSON.parse(fileData);
    jsonData.push(data);

    fs.writeFile(
      'messageData.json',
      JSON.stringify(jsonData, null, 2),
      (err) => {
        if (err) {
          console.error('Error writing file:', err);
        }
      },
    );
  });
}
