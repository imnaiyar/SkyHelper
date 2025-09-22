import type { DateTime } from "luxon";

export interface EventType {
  active: boolean;
  name: string;
  start: DateTime;
  end: DateTime;
  duration: string;
  days: number;
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
  images?: Array<{
    url: string;

    /* Credit for the guide */
    by: string;
    /* Source of the guide */
    source?: string;
  }>;
}

export interface SkyGameStatsData {
  singleMode: Array<{
    id: string;
    username: string;
    gamesPlayed: number;
    gamesWon: number;
  }>;
  doubleMode: Array<{
    id: string;
    username: string;
    gamesPlayed: number;
    gamesWon: number;
  }>;
}
