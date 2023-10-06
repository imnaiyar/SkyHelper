const fs = require('fs');
module.exports = {
  data: {
    name: 'clearjson',
    description: 'clearjson',
    category: 'OWNER',
  },
  async execute(message, args) {
    if (args[0] !== 'embed' && args[0] !== 'message') {
      return message.reply(
        '**Invalid Comand Usage**\nAvailable Args: `embed`, `message`',
      );
    }
    const confirmationMessage = await message.channel.send(
      'Are you sure you want to shut down the bot?',
    );

    await confirmationMessage.react('✅');
    await confirmationMessage.react('❌');

    const filter = (reaction, user) =>
      ['✅', '❌'].includes(reaction.emoji.name) &&
      user.id === message.author.id;
    const collector = confirmationMessage.createReactionCollector({
      filter,
      time: 30000,
    });

    collector.on('collect', async (reaction) => {
      if (reaction.emoji.name === '✅') {
        try {
          if (args[0] === 'embed') {
            const newData = {};
            fs.writeFileSync(
              'embedData.json',
              JSON.stringify(newData, null, 2),
            );
          } else if (args[0] === 'message') {
            const newData = [];
            fs.writeFileSync(
              'messageData.json',
              JSON.stringify(newData, null, 2),
            );
          }
          confirmationMessage.edit('Json File has been cleared.');
          collector.stop();
        } catch (error) {
          console.error(error);
          message.reply('An error occurred while clearing embed data.');
        }
      } else if (reaction.emoji.name === '❌') {
        await confirmationMessage.edit('Json clear canceled.');
        collector.stop(); // Stop the collector
      }
    });

    collector.on('end', (collected, reason) => {
      if (reason === 'time') {
        confirmationMessage.edit(
          'Shutdown confirmation timed out. Shutdown canceled.',
        );
      }
      confirmationMessage.reactions
        .removeAll()
        .catch((error) => console.error('Failed to clear reactions:', error));
    });
  },
};
