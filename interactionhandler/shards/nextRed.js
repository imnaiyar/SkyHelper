// Doesn't work as expected, I've ket it on hold for now until I make it work
const moment = require('moment-timezone');
const eventSequence = ['C', 'b', 'A', 'a', 'B', 'b', 'C', 'a', 'A', 'b', 'B', 'a'];
const secondEventSequence = ['prairie', 'forest', 'valley', 'wasteland', 'vault'];

async function nextRedEvents(interaction) {
  const timezone = 'America/Los_Angeles';
  const currentDate = moment().tz(timezone);
  if (!currentDate) return;

  const dayOfMonth = currentDate.date();
  const currentEventIndex = (dayOfMonth - 1) % eventSequence.length;

  const redEventDates = [];
  let i = 0;

  // Find the next 5 unique dates for red events
  while (redEventDates.length < 5) {
    const nextEventIndex = (currentEventIndex + i) % eventSequence.length;
    if (eventSequence[nextEventIndex].toUpperCase() === 'C' || eventSequence[nextEventIndex].toUpperCase() === 'A' || eventSequence[nextEventIndex].toUpperCase() === 'B') {
      const dateOfEvent = currentDate.clone().add(i, 'days');
      redEventDates.push(dateOfEvent.toISOString());
    }
    i++;
  }

  // Generate the response with event information for the next 5 days
  const response = redEventDates.map((date, i) => {
    const redEventIndex = (currentEventIndex + i) % eventSequence.length;
    const redEvent = eventSequence[redEventIndex];
    const secondEventIndex = redEventIndex % secondEventSequence.length;
    const secondEvent = secondEventSequence[secondEventIndex];
    return `${date} - Red Event: ${redEvent}, Second Event: ${secondEvent}`;
  });

  await interaction.reply(response.join('\n'));
}

module.exports = { nextRedEvents };
