const config = require('@root/config');
const moment = require('moment-timezone');
const fs = require('fs');

module.exports = class shardsUtil {
  getDate(date) {
    const timezone = 'America/Los_Angeles';

    let currentDate;
    try {
      if (date) {
        currentDate = moment.tz(date, 'Y-MM-DD', timezone).startOf('day');
      } else {
        currentDate = moment().tz(timezone);
      }
      if (!currentDate.isValid()) {
        return 'invalid';
      } else {
        return currentDate;
      }
    } catch (error) {
      console.log(error);
      return 'error';
    }
  }

  shardsIndex(date) {
    const dayOfMonth = date.date();
    const shardIndex = (dayOfMonth - 1) % config.shardSequence.length;
    const currentShard = config.shardSequence[shardIndex];
    const realmIndex = (dayOfMonth - 1) % config.realmSequence.length;
    const currentRealm = config.realmSequence[realmIndex];

    return { currentShard, currentRealm };
  }

  getSuffix(number) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const remainder10 = number % 10;
    const remainder100 = number % 100;

    // Suffix for shards index
    return suffixes[
      remainder10 === 1 && remainder100 !== 11
        ? 1
        : remainder10 === 2 && remainder100 !== 12
          ? 2
          : remainder10 === 3 && remainder100 !== 13
            ? 3
            : 0
    ];
  }

  saveMessageData(data) {
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

  getMessageDate(interaction, messageId) {
    const filePath = 'messageData.json';

    try {
      const data = fs.readFileSync(filePath, 'utf8');
      const messageData = JSON.parse(data);
      const message = messageData.find((data) => data.messageId === messageId);

      if (!message) {
        interaction.reply({
          content:
            'No dates found for this message. The interaction might be expired, please run the command again',
          ephemeral: true,
        });
        return false;
      }

      const dateOption = message.time;

      let currentDate;
      if (dateOption) {
        currentDate = moment
          .tz(dateOption, 'Y-MM-DD', interaction.client.timezone)
          .startOf('day');
        if (!currentDate.isValid()) {
          console.log(
            `${dateOption} does not exist, please provide a valid date.`,
          );
          return null;
        }
      } else {
        currentDate = moment.tz(interaction.client.timezone).startOf('day');
      }

      return currentDate;
    } catch (error) {
      console.error('Error reading messageData.json:', error);
    }
  }
};
