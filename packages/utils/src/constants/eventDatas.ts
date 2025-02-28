export interface EventData {
  /** Name of the event */
  name: string;

  /** The index of the event to appear on the embed */

  index: number;

  /** The Offset of the event (in minutes) */
  offset: number;

  /** Approximate duration of the event during which its active after it starts (in minutes) */
  duration?: number;

  /** The interval at which the event occurs (in minutes) */
  interval?: number;

  /** Whether to display all their occurrence times in the embed */
  displayAllTimes?: boolean;

  /** The days on which the event occurs */
  occursOn?: {
    /** Weekdays on which the event occurs */
    weekDays?: number[];

    /** The day on which the event occurs */
    dayOfTheMonth?: number;
  };

  /** Infographic related to the event, if any (Discord link)*/
  infographic?: {
    /** Credit */
    by: string;

    /** The guide */
    image: string;
  };
}

export type EventKey =
  | "geyser"
  | "grandma"
  | "turtle"
  | "daily-reset"
  | "eden"
  | "aurora"
  | "dream-skater"
  | "passage-quests"
  | "nest-sunset"
  | "fireworks-festival"
  | "fairy-ring"
  | "brook-rainbow";

const getMinutes = (hours: number) => hours * 60;

export const eventData: Record<EventKey, EventData> = {
  geyser: {
    name: "Geyser",
    index: 0,
    duration: 15,
    offset: 0,
    infographic: {
      by: "Clement",
      image:
        "https://media.discordapp.net/attachments/867638574571323424/1252998364941914243/Visit_Geyser_Clement.png?ex=66744129&is=6672efa9&hm=8d76d1767aca362d23547b1e3beb2b610f58e4fbec24b12af56fdc745f7074e8&",
    },
    displayAllTimes: true,
    interval: getMinutes(2),
  },
  grandma: {
    name: "Grandma",
    index: 1,
    duration: 15,
    offset: 30,
    infographic: {
      by: "Clement",
      image:
        "https://media.discordapp.net/attachments/867638574571323424/1252998366288416849/Visit_Grandma_Clement.png?ex=6674412a&is=6672efaa&hm=7228b695ec7008204fede2f3d6b4864a06a7cfa25a14ab4d7572957ee940044c&",
    },
    displayAllTimes: true,
    interval: getMinutes(2),
  },
  turtle: {
    name: "Turtle",
    index: 2,
    duration: 10,
    offset: 50,
    infographic: {
      by: "Velvet",
      image:
        "https://media.discordapp.net/attachments/867638574571323424/1252998363205472316/Visit_Turtle_Velvet.jpg?ex=66744129&is=6672efa9&hm=8c189ff8501fc88810606b832addbea8a9a81eb7a7a6b17019ff1ced593e1ae8&",
    },
    displayAllTimes: true,
    interval: getMinutes(2),
  },
  "daily-reset": {
    name: "Daily Reset",
    index: 3,
    offset: 0,
    interval: getMinutes(24),
  },
  eden: {
    name: "Eden/Weekly Reset",
    index: 4,
    offset: 0,
    interval: getMinutes(24 * 7),
    occursOn: { weekDays: [7] },
  },
  aurora: {
    name: "Aurora's concert",
    index: 5,
    offset: 0,
    duration: 50,
    displayAllTimes: true,
    interval: getMinutes(2),
  },
  "dream-skater": {
    name: "Dream Skater",
    index: 6,
    duration: 15,
    displayAllTimes: true,
    occursOn: { weekDays: [5, 6, 7] },
    offset: getMinutes(1),
    interval: getMinutes(2),
  },
  "passage-quests": {
    name: "Passage Quests",
    index: 7,
    offset: 0,
    displayAllTimes: true,
    interval: 15,
  },
  "nest-sunset": {
    name: "Nest Sunset",
    index: 8,
    offset: 40,
    displayAllTimes: true,
    interval: getMinutes(1),
  },
  "fireworks-festival": {
    name: "Fireworks Festival",
    index: 9,
    offset: 0,
    displayAllTimes: true,
    interval: getMinutes(4),
    occursOn: { dayOfTheMonth: 1 },
  },
  "fairy-ring": {
    name: "Fairy Ring",
    index: 11,
    offset: 50,
    displayAllTimes: true,
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
