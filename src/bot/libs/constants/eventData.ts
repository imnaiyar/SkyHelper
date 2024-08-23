interface EventData {
  [key: string]: {
    /** Name of the event */
    name: string;

    /** The index of the event to appear on the embed */

    index: number;

    /** The Offset of the event (in minutes) */
    offset: number;

    /** Approximate duration of the event during which its active when it starts */
    duration?: number;

    /** The interval at which the event occurs (in minutes) */
    interval?: number;

    /** Whether to display all their occurrence times in the main embed */
    displayAllTimes?: boolean;

    /** The days on which the event occurs */
    occursOn?: {
      /** Weekdays on which the event occurs */
      weekDays?: number[];

      /** The day on which the event occurs */
      dayOfTheMonth?: number;
    };
  };
}

const getMinutes = (hours: number) => hours * 60;

export const eventData: EventData = {
  geyser: {
    name: "Geyser",
    index: 0,
    duration: 10,
    offset: 5,
    interval: getMinutes(2),
  },
  grandma: {
    name: "Grandma",
    index: 1,
    duration: 10,
    offset: 35,
    interval: getMinutes(2),
  },
  turtle: {
    name: "Turtle",
    index: 2,
    duration: 10,
    offset: 50,
    interval: getMinutes(2),
  },
  reset: {
    name: "Daily Reset",
    index: 3,
    offset: 0,
    interval: getMinutes(24),
  },
  "eden-reset": {
    name: "Eden/Weekly Reset",
    index: 4,
    offset: 0,
    interval: getMinutes(24 * 7),
    occursOn: { weekDays: [7] },
  },
  aurora: {
    name: "Aurora",
    index: 5,
    offset: 0,
    duration: 50,
    displayAllTimes: true,
    interval: getMinutes(4),
  },
  "dream-skater": {
    name: "Dream Skater",
    index: 6,
    duration: 15,
    occursOn: { weekDays: [5, 6, 7] },
    offset: getMinutes(1),
    interval: getMinutes(2),
  },
  "passage-quests": {
    name: "Passage Quests",
    index: 7,
    offset: 0,
    interval: 15,
  },
  "nest-sunset": {
    name: "Nest Sunset",
    index: 8,
    offset: 40,
    interval: getMinutes(1),
  },
  "fireworks-festival": {
    name: "Fireworks Festival",
    index: 9,
    offset: 60,
    displayAllTimes: true,
    interval: getMinutes(4),
    occursOn: { dayOfTheMonth: 1 },
  },
  "sanctuary-sunset": {
    name: "Sanctuary Sunset",
    index: 10,
    offset: 50,
    interval: getMinutes(2),
  },
  "fairy-ring": {
    name: "Fairy Ring",
    index: 11,
    offset: 50,
    interval: 60,
  },
  "brook-rainbow": {
    name: "Forest Brook Rainbow",
    index: 12,
    displayAllTimes: true,
    offset: getMinutes(5),
    interval: getMinutes(12),
  },
};

