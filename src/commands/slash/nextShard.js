const { ApplicationCommandOptionType } = require("discord.js");
const moment = require('moment-timezone');
// Define the patterns for events and second events
const eventsPattern = ['C', 'b', 'A', 'a', 'B', 'b', 'C', 'a', 'A', 'b', 'B', 'a'];
const secondEventsPattern = ['Daylight Prairie', 'Hidden Forest', 'Valley of Triumph', 'Golden Wasteland', 'Vault of Knowledge'];

// Define the daysOfWeek exclusions
const dayExclusions = {
  'C': [1, 2],
  'B': [3, 4],
  'A': [2, 3],
};
module.exports = {
    data: {
        name: 'next-red',
        description: 'Get date and location of next 5 red shards.',
    },
    async execute(interaction) {
        const currentLosAngelesTime = moment().tz('America/Los_Angeles');
        const currentDay = currentLosAngelesTime.date();
        const nextRedEvents = getNextRedEvents(currentDay);

    let response = 'Next 5 Red Shards:\n';

    for (const eventInfo of nextRedEvents) {
      response += `- On \` ${eventInfo.day} \` in ${eventInfo.secondEvent}\n`;
    }
    response += "\n_For more information about a shard, use the corresponding date in </shards:1142231977328648364> command_"

    interaction.reply(response);
    }
}
// Function to calculate the next 5 red events
function getNextRedEvents() {
    const redEvents = [];
    const today = moment().tz('America/Los_Angeles');
    let dayCount = today.date() - 1;
  
    while (redEvents.length < 5) {
      const event = eventsPattern[dayCount % eventsPattern.length];
      const secondEvent = secondEventsPattern[dayCount % secondEventsPattern.length];
      const dayOfWeek = today.day();
  
      // Check if the event is a red event
      if (['C', 'B', 'A'].includes(event)) {
        // Check if the event should be excluded on that day of the week
        if (!dayExclusions[event].includes(dayOfWeek)) {
          // Format the day label to account for the new month
          const dayLabel = dayCount + 1 <= today.daysInMonth()
            ? dayCount + 1
            : `1 (New Month)`;
          const todayDate = today.format('YYYY-MM-DD');
          redEvents.push({ day: todayDate, event, secondEvent });
        }
      }

      dayCount++;
      today.add(1, 'day');
    }
  
    return redEvents;
  }
  
  