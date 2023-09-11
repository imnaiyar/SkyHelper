const { ApplicationCommandOptionType } = require("discord.js");
const moment = require('moment-timezone');

const eventsPattern = ['C', 'b', 'A', 'a', 'B', 'b', 'C', 'a', 'A', 'b', 'B', 'a'];
const secondEventsPattern = ['Daylight Prairie', 'Hidden Forest', 'Valley of Triumph', 'Golden Wasteland', 'Vault of Knowledge'];

const dayToSkip = {
  'C': [1, 2],
  'B': [3, 4],
  'A': [2, 3],
};
module.exports = {
    data: {
        name: 'next-red',
        description: 'Get date and location of next red shards.',
        options: [
        {
          name: 'number',
          description: 'Number of next shards date to search for.',
          type: ApplicationCommandOptionType.Integer,
          required: false, 
        },
      ],
    },
    async execute(interaction) {
      const input = interaction.options.getInteger("number");
      if (input && interaction.guild && input > 10) {
        return interaction.reply({content: `Max number is 10 to prevent clogging up the channel, you provided \`${input}\`. Run the command in my dm for upto 45 results.`, ephemeral: true})
      }
      if (input && input > 45) {
        return interaction.reply({content: `Max number is 45. You provided \`${input}\``, ephemeral: true})
      }
      const daysNum = input || 5;
      
        const currentLosAngelesTime = moment().tz('America/Los_Angeles');
        const currentDay = currentLosAngelesTime.date();
        const nextRedEvents = getNextRedEvents(currentDay, daysNum);

    let response = `Next ${daysNum} Red Shards:\n`;

    for (const eventInfo of nextRedEvents) {
      response += `- On \`${eventInfo.day}\` in ${eventInfo.secondEvent}\n`;
    }
    response += "\n_For more information about a shard, use the corresponding date in </shards:1142231977328648364> command_"
    interaction.reply(response);
    }
}

function getNextRedEvents(currentDay, daysNum) {
    const redEvents = [];
    let today = moment().tz('America/Los_Angeles').startOf('day');
    
  
    while (redEvents.length < daysNum) {
      let dayCount = today.date() - 1;
      const event = eventsPattern[dayCount % eventsPattern.length];
      const secondEvent = secondEventsPattern[dayCount % secondEventsPattern.length];
      const dayOfWeek = today.day();
       const to = today.format('YYYY-MM-DD');

   if (['C', 'B', 'A'].includes(event)) {
     
        if (!dayToSkip[event].includes(dayOfWeek)) {

          const todayDate = today.format('DD-MMM-YYYY');
          redEvents.push({ day: todayDate, event, secondEvent });
        }
      }

      today.add(1, 'day');
    }
   
    return redEvents;
  }

  