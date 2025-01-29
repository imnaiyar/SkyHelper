import mongoose from "mongoose";
import type { UserSchema } from "@/@types/schemas";
import type { APIGuildMember, APIUser } from "@discordjs/core";
import Utils from "@/utils/classes/Utils";
import { LimitedCollection } from "@/utils/classes/LimitedCollection";
import config from "@/config";

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
  linkedRole: {
    username: String,
    metadata: {
      wings: { type: Number, default: 1 },
      since: String,
      hangout: Boolean,
      cr: Boolean,
      eden: Boolean,
    },
  },
});

const Model = mongoose.model<UserSchema>("users", Schema);

export async function getUser(user: APIUser): Promise<UserSchema> {
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
        createdAt: Utils.createdAt(user.id),
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
export const getGamesLeaderboard = async (_game: "hangman", guildMembers?: APIGuildMember[]) => {
  const query = guildMembers ? { _id: { $in: guildMembers.map((m) => m.user.id) } } : {};

  const users = await Model.find({ ...query, hangman: { $exists: true } });

  const singleModeLeaderboard = users
    .filter((user) => (user.hangman?.singleMode.gamesPlayed || 0) > 0)
    .sort((a, b) => (b.hangman?.singleMode.gamesWon || 0) - (a.hangman?.singleMode.gamesWon || 0))
    .slice(0, 10)
    .map((user) => ({
      id: user.data.id ?? user._id,
      username: user.data.username,
      gamesPlayed: user.hangman?.singleMode.gamesPlayed || 0,
      gamesWon: user.hangman?.singleMode.gamesWon || 0,
    }));

  const doubleModeLeaderboard = users
    .filter((user) => (user.hangman?.doubleMode.gamesPlayed || 0) > 0)
    .sort((a, b) => (b.hangman?.doubleMode.gamesWon || 0) - (a.hangman?.doubleMode.gamesWon || 0))
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
