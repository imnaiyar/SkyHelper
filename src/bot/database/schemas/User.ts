import mongoose, { Document } from "mongoose";
import config from "#bot/config";
import { type User, GuildMember, LimitedCollection } from "discord.js";

interface UserSchema extends Document {
  _id: string;
  data: {
    id: string;
    username: string;
    createdAt: Date;
  };
  language?: {
    name: string;
    value: string;
    flag?: string;
  };
  isBlacklisted: boolean;
  hangman?: {
    singleMode: { gamesPlayed: number; gamesWon: number };
    doubleMode: { gamesPlayed: number; gamesWon: number };
  };
}

const cache = new LimitedCollection<string, UserSchema>({ maxSize: config.CACHE_SIZE.USERS });
const Schema = new mongoose.Schema<UserSchema>({
  _id: String,
  data: {
    id: String,
    username: String,
    createdAt: Date,
  },
  language: {
    name: String,
    value: String,
    flag: String,
  },
  isBlacklisted: Boolean,
  hangman: {
    singleMode: {
      gamesPlayed: { type: Number, default: 0 },
      gamesWon: { type: Number, default: 0 },
    },
    doubleMode: {
      gamesPlayed: { type: Number, default: 0 },
      gamesWon: { type: Number, default: 0 },
    },
  },
});

const Model = mongoose.model<UserSchema>("users", Schema);

export async function getUser(user: User): Promise<UserSchema> {
  if (!user) throw new Error("User id undefined");
  if (!user.id) throw new Error("User Id is undefined");

  const cached = cache.get(user.id);
  if (cached) return cached;

  let userData = await Model.findById(user.id);
  if (!userData) {
    // create a new guild model
    userData = new Model({
      _id: user.id,
      data: {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt,
      },
    });

    await userData.save();
  }
  cache.set(user.id, userData);
  return userData;
}

/**
 * Returns top  10 players in the given type, returns global players, unless a guild is provided
 * @param type Type of game to get leaderboard for
 * @param guildMembers Guild members for which to get leaderboard for
 */
export const getGamesLeaderboard = async (_game: "hangman", guildMembers?: GuildMember[]) => {
  const query = guildMembers ? { _id: { $in: guildMembers.map((m) => m.id) } } : {};

  const users = await Model.find(query);

  const singleModeLeaderboard = users
    .filter((user) => (user.gameData?.hangman.singleMode.gamesPlayed || 0) > 0)
    .sort((a, b) => (b.gameData?.hangman.singleMode.gamesWon || 0) - (a.gameData?.hangman.singleMode.gamesWon || 0))
    .slice(0, 10)
    .map((user) => ({
      id: user.data.id ?? user._id,
      username: user.data.username,
      gamesPlayed: user.hangman?.singleMode.gamesPlayed || 0,
      gamesWon: user.hangman?.singleMode.gamesWon || 0,
    }));

  const doubleModeLeaderboard = users
    .filter((user) => (user.gameData?.hangman.doubleMode.gamesPlayed || 0) > 0)
    .sort((a, b) => (b.gameData?.hangman.doubleMode.gamesWon || 0) - (a.gameData?.hangman.doubleMode.gamesWon || 0))
    .slice(0, 10)
    .map((user) => ({
      id: user.data.id ?? user._id,
      username: user.data.username,
      gamesPlayed: user.hangman?.doubleMode.gamesPlayed || 0,
      gamesWon: user.hangman?.doubleMode.gamesWon || 0,
    }));

  return {
    singleMode: singleModeLeaderboard,
    doubleMode: doubleModeLeaderboard,
  };
};
