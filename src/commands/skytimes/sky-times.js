const { ApplicationCommandOptionType, time } = require('discord.js');
const { skyTimes } = require('./sub/skyTimes');
const desc = require('@src/cmdDesc');
module.exports = {
  cooldown: 5,
  data: {
    name: 'sky-times',
    description: 'Get various times related to the world of Sky',
    longDesc: desc.skytimes,
    options: [
      {
        name: 'times',
        description: 'Select a specific time you want.',
        type: ApplicationCommandOptionType.String,
        required: false,
        choices: [
          { name: 'Geyser Time', value: 'geyser' },
          { name: 'Grandma Time', value: 'grandma' },
          { name: 'Turtle Time', value: 'turtle' },
          { name: 'Reset Time', value: 'reset' },
          { name: 'Eden Reset Time', value: 'eden' },
          { name: 'Special Event', value: 'event' },
        ],
      },
    ],
  },
  async execute(interaction) {
    const { client } = interaction;
    const result = await skyTimes(client);
    const chosenOption = interaction.options.getString('times');

    switch (chosenOption) {
      case 'geyser':
        await interaction.reply(`${result.geyserResultStr}\n**__All Geyser Times:__**
> <t:1699257600:t> 》<t:1699178400:t>》<t:1699185600:t> 》<t:1699192800:t> 》<t:1699200000:t> 》 <t:1699207200:t>》<t:1699214400:t> 》<t:1699221600:t> 》<t:1699228800:t> 》<t:1699236000:t> 》<t:1699243200:t> 》<t:1699250400:t>`);
        break;

      case 'turtle':
        await interaction.reply(
          `${result.turtleResultStr}\n**__All Turtle Times:__**\n> <t:1699260600:t> 》 <t:1699181400:t> 》<t:1699188600:t> 》<t:1699195800:t> 》<t:1699203000:t> 》 <t:1699210200:t>》<t:1699217400:t> 》<t:1699224600:t> 》<t:1699231800:t>》<t:1699239000:t> 》<t:1699246200:t> 》<t:1699253400:t>`,
        );
        break;

      case 'grandma':
        await interaction.reply(`${result.grandmaResultStr}\n**__All Grandma Times:__**
> <t:1699259400:t> 》<t:1699180200:t>》<t:1699187400:t> 》<t:1699194600:t> 》<t:1699201800:t> 》 <t:1699209000:t>》<t:1699216200:t>》<t:1699223400:t> 》<t:1699230600:t> 》<t:1699237800:t> 》<t:1699245000:t> 》<t:1699252200:t>`);
        break;

      case 'reset':
        await interaction.reply(
          `\`Next reset for you on:\` ${result.resetResultStr}`,
        );
        break;

      case 'eden':
        await interaction.reply(
          `\`Next eden reset for you on:\` ${result.edenResultStr}`,
        );
        break;

      case 'event':
        if (
          client.skyEvents.eventActive ||
          result.eventDescription !== 'No active events.'
        ) {
          await interaction.reply(
            `**Event:** ${client.skyEvents.eventName}\n**Start Date:** ${time(
              client.skyEvents.eventStarts.toDate(),
              'f',
            )}\n**End Date:** ${time(
              client.skyEvents.eventEnds.toDate(),
              'f',
            )}\n**Duration:** ${
              client.skyEvents.eventDuration
            }\n\`\`\`Countdown\`\`\`\n${result.eventDescription}`,
          );
        } else {
          await interaction.reply('No active events right now.');
        }

        break;

      default:
        await interaction.reply(
          `In-game events time:\n- **Geyser(upcoming):** ${result.geyserResultStr}\n- **Grandma(upcoming):** ${result.grandmaResultStr}\n- **Turtle(upcoming):** ${result.turtleResultStr}\n- **Reset(next):** ${result.resetResultStr}\n- **Eden(reset):** ${result.edenResultStr}\n\n\`\`\`Event\`\`\`\n${result.eventDescription}\n\n_Check individual options (geyser, grandma, etc.) for more information_`,
        );
        break;
    }
  },
};
