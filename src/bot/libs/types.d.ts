import moment from "moment-timezone";
import { Document } from "mongoose";
import type { ScheduleOptions } from "node-cron";

export interface ShardsCountdown {
  // The shard index
  index: number;

  // Whether if the shard is ready
  active?: boolean;

  // Whether if all shards are ended for the given date
  ended?: boolean;

  // The landing time for the given shard
  start: moment.Moment;

  // THe end time for the given shard
  end: moment.Moment;

  // THe countdown for the shard end/land
  duration: string;
}

export interface BaseTimes {
  /* Whether the event is active or not */
  active: boolean;

  /* The time when the event starts */
  nextTime: moment.Moment;

  /* The countdown to the event */
  duration: string;
}

interface ActiveTimes extends BaseTimes {
  active: true;
  /* The time when the event started if active */
  startTime: moment.Moment;

  /* The time when the event ends if active */
  endTime: moment.Moment;
}
interface NotActiveTimes extends BaseTimes {
  active: false;
  /* The time when the event started if active */
  startTime?: moment.Moment;

  /* The time when the event ends if active */
  endTime?: moment.Moment;
}
export type Times = ActiveTimes | NotActiveTimes;

export interface TSData extends Document {
  // Name of the returning TS
  name: string;

  /* The value of spirit in the spiritsData */
  value: string;

  /* Date of the visit */
  visitDate: string;

  /* Link to the image of the spirit */
  spiritImage: string;

  /* TS returning Index */
  index: number;
}

export interface EventData extends Document {
  /* Start date of the event */
  startDate: string;

  /* End date of the event */
  endDate: string;

  /* Name of the event */
  name: string;
}

export interface EventType {
  active: boolean;
  name: string;
  start: moment.Moment;
  end: moment.Moment;
  duration: string;
  days: number;
}
interface ExpressionLevel {
  title: string;
  description?: string;
  image: string;
}

type CollectibleTypes =
  | "Cape"
  | "Mask"
  | "Instrument"
  | "Instruments"
  | "Prop"
  | "Props"
  | "Face Accessory"
  | "Hair"
  | "Shoes"
  | "Hair Accessory"
  | "Music Sheet"
  | "Outfit"
  | "Neck Accessory";
interface Collectible {
  /** Name of the collectible */
  name: string;

  /** Type of this collectible */
  type?: CosmeticTypes;

  /** Emoji icon of the collectible */
  icon: string;

  /** Link to the collectible images (preview) */
  images: {
    /** Description of the image (to display on the embed) */
    description: string;

    /** The image's link */
    image: string;
  }[];

  /** Cosmetic Cost (absent for items that are unlocked via season pass and the spirit has yet to return as a TS)*/
  price?: string;

  /** If this was season pass exclusive */
  isSP?: boolean;

  /** Seasonal price, if any */
  spPrice?: string;

  /** Any extra notes about this collectible */
  notes?: string[];

  /**
   * Whether to skip including in the friendship tree calculations
   *  ! NOTE: This is for the future in case I decide to incorporate progress tracking
   */
  skipTree?: boolean;
}

type ExpressionType = "Emote" | "Stance" | "Call" | "Friend Action";
interface BaseSpiritData {
  /** Name of the spirit */
  name: string;
  /** Spirits preview image link */
  image?: string;

  /** Any extra title to add (To be displayed on the embed) */
  extra?: string;

  /** Type of the spirit (seasonal, or regular) */
  type: string;

  /** The realm where the spirit can be found, if any */
  realm?: string;

  /** Icon that represents the spirit (only applied if the spirit doesn't have an expression) */
  icon?: string;

  /** Expression of the spirit, if any */
  expression?: {
    /** Type of expression */
    type: ExpressionType;

    /** Icon of the expression */
    icon: string;

    /** Expression levels */
    level: ExpressionLevel[];
  };

  /** Collectibles offered by this spirit */
  collectibles?: Collectible[];
}

export interface SeasonalSpiritData extends BaseSpiritData {
  type: "Seasonal Spirit";
  season: string;
  current?: boolean;
  ts: {
    eligible: boolean;
    returned: boolean;
    total?: string;
    dates: string[];
  };
  tree?: {
    by: string;
    total: string;
    image: string;
  };
  location?: {
    by: string;
    description?: string;
    image: string;
  };
}

export interface RegularSpiritData extends BaseSpiritData {
  type: "Regular Spirit";
  main: {
    description: string;
    total?: string;
    image: string;
  };
}
export type SpiritsData = SeasonalSpiritData | RegularSpiritData;
export interface SpiritItems {
  item: string;
  icon: string;
  price: number;
  canSkip?: boolean;
  pass?: boolean;
}
export interface SeasonPrice {
  icon?: string;
  collectibles: SpiritItems[];
}
export interface LiveUpdates {
  active: boolean;
  messageId: string;
  webhook: {
    id: string | null;
    token: string | null;
  };
}
export interface EventReminder {
  active: boolean;
  last_messageId?: string;
  role: string | null;
}
export interface Reminders {
  active: boolean;
  default_role: string | null;
  dailies: EventReminder;
  grandma: EventReminder;
  turtle: EventReminder;
  geyser: EventReminder;
  reset: EventReminder;
  eden: EventReminder;
  webhook: {
    id: string | null;
    token: string | null;
    channelId: string | null;
  };
}
export interface GuildSchema extends Document {
  _id: string;
  data: {
    name: string;
    region: string;
    owner: string;
    joinedAt: Date;
    leftAt: Date;
    bots: number;
  };
  annoucement_channel: string | null;
  beta: boolean;
  prefix: string;
  language?: {
    name: string;
    value: string;
    flag?: string;
  };
  reminders: Reminders;
  autoShard: LiveUpdates;
  autoTimes: LiveUpdates;
}

export interface JobOptions {
  interval: string;
  callback: () => Promise<void>;
  options?: ScheduleOptions;
}

/** Reperesents a daily quest data */
export interface DailyQuest {
  /* Title for the quest */
  title: string;

  /*  The date this quest was saved on */
  date: string;

  /* Description for the quest (if any)*/
  description?: string;

  /* Image guide for the quest (if any) */
  images: {
    url: string;

    /* Credit for the guide */
    by: string;
    /* Source of the guide */
    source?: string;
  }[];
}

interface EventOffset {
  /** Hour offset */
  hours?: number;

  /** Minutes offset */
  minutes?: number;

  /** Interval of the evnt occurence */
  interval?: {
    hours?: number;
    minutes?: number;
  };
}
