import type { DateTime } from "luxon";
import { Document } from "mongoose";

/** Data of users provided for making a game leaderboard card */
export interface UserData {
  /** The position of the player in the leaderboard */
  top: Number;
  /** The Avatar of the player */
  avatar: string;
  /** The username of the player */
  tag: string;
  /** The score of the player */
  score: number;
  /** Number of the games played by the user */
  games: number;
}

/** Customize colors for the game Leaderboard Card */
export interface ColorsType {
  box: string;
  username: string;
  score: string;
  firstRank: string;
  secondRank: string;
  thirdRank: string;
}

export interface LeaderboardOptions {
  usersData: UserData[];
  colors?: ColorsType;
}

export interface Background {
  type: string;
  background: string;
}

export interface SkyEvent {
  eventActive: Boolean;
  eventName: string;
  eventStarts: DateTime;
  eventEnds: DateTime;
  eventDuration: string;
}

export interface ShardsCountdown {
  /** The shard index */
  index: number;
  /** Whether if the shard is ready */
  active?: boolean;
  /** Whether if all shards are ended for the given date */
  ended?: boolean;
  /** The landing time for the given shard */
  start: DateTime;
  /** The end time for the given shard */
  end: DateTime;
  /** The countdown for the shard end/land */
  duration: string;
}

export interface EventType {
  active: boolean;
  name: string;
  start: DateTime;
  end: DateTime;
  duration: string;
  days: number;
}

export interface SkyGameStatsData {
  singleMode: {
    id: string;
    username: string;
    gamesPlayed: number;
    gamesWon: number;
  }[];
  doubleMode: {
    id: string;
    username: string;
    gamesPlayed: number;
    gamesWon: number;
  }[];
}
