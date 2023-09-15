const { ApplicationCommandOptionType } = require("discord.js");
const moment = require('moment-timezone');

const eventsPattern = ['C', 'b', 'A', 'a', 'B', 'b', 'C', 'a', 'A', 'b', 'B', 'a'];
const secondEventsPattern = ['<:Prairie:1150605405408473179> Daylight Prairie', '<:Forest:1150605383656800317> Hidden Forest', '<:Valley:1150605355777273908> Valley of Triumph', '<:Wasteland:1150605333862027314> Golden Wasteland', '<:Vault:1150605308364861580> Vault of Knowledge'];

const dayToSkip = {
  'C': [1, 2],
  'B': [3, 4],
  'A': [2, 3],
};
module.exports = {
    data: {
        name: 'next-red',
        description: 'Get date and location of next red shards.',
        longDesc: `Provides information about the date and location of the next 5 upcoming red shards by default. Optionally, you can request more results.

\`Usage:\`
/next-red [number]

- [number] (optional): Specify the number of results you want (1 to 10 in server channels, 1 to 20 in DMs).

This command offers details on the date and location of the upcoming red shards. Use the optional [--number] flag to adjust the number of results.`,
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
        return interaction.reply({content: `Max number is 10 to prevent clogging up the channel, you provided \`${input}\`. Run the command in my dm for upto 20 results.`, ephemeral: true})
      }
      if (input && input > 20) {
        return interaction.reply({content: `Max number is 20. You provided \`${input}\``, ephemeral: true})
      }
      const daysNum = input || 5;
      
        const currentLosAngelesTime = moment().tz('America/Los_Angeles');
        const currentDay = currentLosAngelesTime.date();
        const nextRedEvents = getNextRedEvents(currentDay, daysNum);

    let response = `Next ${daysNum} Red Shards:\n`;

    for (const eventInfo of nextRedEvents) {
      response += `- On \`${eventInfo.day}\` at <t:${eventInfo.unix}:T> in ${eventInfo.secondEvent}\n`;
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
   const eventTimes ={
     'B': today.clone().startOf('day').add(3, 'hours').add(38, 'minutes').add(40, 'seconds'),
     'C': today.clone().startOf('day').add(7, 'hours').add(48, 'minutes').add(40, 'seconds'),
     'A': today.clone().startOf('day').add(2, 'hours').add(28, 'minutes').add(40, 'seconds'),
   }

   if (['C', 'B', 'A'].includes(event)) {
     
        if (!dayToSkip[event].includes(dayOfWeek)) {
          
          const fallTime = eventTimes[event]
          const unix = Math.floor(fallTime.valueOf() / 1000);

          const todayDate = today.format('DD-MMM-YYYY');
          redEvents.push({ day: todayDate, event, secondEvent, unix });
        }
      }

      today.add(1, 'day');
    }
   
    return redEvents;
  }

  