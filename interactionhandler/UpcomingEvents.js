const moment = require('moment');

function isValidEventDay(currentEvent, dayOfWeek) {
  const redEventDays = {
    'C': [1, 2],
    'B': [3, 4],
    'A': [2, 3],
  };

  const blackEventDays = {
    'a': [6, 0],
    'b': [0, 1],
  };

  if (currentEvent.toUpperCase() === currentEvent) {
    return redEventDays[currentEvent].includes(dayOfWeek);
  } else {
    return blackEventDays[currentEvent].includes(dayOfWeek);
  }
}

function getNextEvents(events, currentEvent, numEvents) {
  const nextEvents = [];
  let index = events.indexOf(currentEvent);
  while (nextEvents.length < numEvents) {
    index = (index + 1) % events.length;
    const event = events[index];
    const eventDay = moment().add(nextEvents.length, 'days').day();
    if (isValidEventDay(event, eventDay)) {
      nextEvents.push(event);
    }
  }
  return nextEvents;
}

function getLocation(event, currentSecondEvent) {
  const locations = {
    'C': {
      'prairie': 'caves',
      'forest': 'Forest end',
      'valley': 'Village',
      'wasteland': 'graveyard',
      'vault': 'cove',
    },
    'B': {
      'prairie': 'sanctuary',
      'forest': 'sunny forest',
      'valley': 'Hermit',
      'wasteland': 'ark',
      'vault': 'cove',
    },
    'A': {
      'prairie': 'birds',
      'forest': 'tree end',
      'valley': 'Village',
      'wasteland': 'crab',
      'vault': 'cove',
    },
    'a': {
      'prairie': 'butterfly',
      'forest': 'brook',
      'valley': 'ice',
      'wasteland': 'broken temple',
      'vault': 'desert',
    },
    'b': {
      'prairie': 'koi',
      'forest': 'boneyard',
      'valley': 'ice',
      'wasteland': 'battle',
      'vault': 'desert',
    },
  };

  return locations[event][currentSecondEvent];
}

async function nextEvent(interaction) {
  const currentDate = moment();
  const dayOfMonth = currentDate.date();
  const dayOfWeek = currentDate.day();

  // Event sequences
  const eventSequence = ['C', 'b', 'A', 'a', 'B', 'b', 'C', 'a', 'A', 'b', 'B', 'a'];
  const secondEventSequence = ['prairie', 'forest', 'valley', 'wasteland', 'vault'];

  // Calculate the index in the event sequences
  const sequenceIndex = (dayOfMonth - 1) % eventSequence.length;
  const currentEvent = eventSequence[sequenceIndex];
  const currentSecondEvent = secondEventSequence[dayOfWeek % secondEventSequence.length];
  
  let result = '';

  
  if (interaction.options.getString('next-shards') === 'red') {
    const redEvents = ['C', 'B', 'A'];
    const nextRedEvents = getNextEvents(redEvents, currentEvent, 5);
    result = nextRedEvents.map((event, index) => {
      const eventDate = currentDate.clone().add(index, 'days').format('YYYY-MM-DD');
      const location = getLocation(event, currentSecondEvent);
      return `Red event ${index + 1}: ${event} (${location}, Date: ${eventDate})`;
    }).join('\n');
    
  } else 
  if (interaction.options.getString('next-shards') === 'black') {
    const blackEvents = ['a', 'b'];
    const nextBlackEvents = getNextEvents(blackEvents, currentEvent.toLowerCase(), 5);
    result = nextBlackEvents.map((event, index) => {
      const eventDate = currentDate.clone().add(index, 'days').format('YYYY-MM-DD');
      const location = getLocation(event, currentSecondEvent);
      return `Black event ${index + 1}: ${event} (${location}, Date: ${eventDate})`;
    }).join('\n');
  } else {
    result = "Invalid input. Please select 'red' or 'black'.";
  }

  await interaction.reply(`Next 5 events:\n${result}`);
}

module.exports = {
  nextEvent
};
