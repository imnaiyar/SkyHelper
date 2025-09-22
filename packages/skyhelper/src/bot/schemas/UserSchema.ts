import mongoose from "mongoose";
import config from "@/config";
import type { APIUser, APIGuildMember } from "@discordjs/core";
import Utils from "@/utils/classes/Utils";
import { LimitedCollection } from "@/utils/classes/LimitedCollection";
import type { UserSchema } from "@/types/schemas";
import type { SkyGameStatsData } from "@/types/custom";

const cache = new LimitedCollection<string, UserSchema>({ maxSize: config.CACHE_SIZE.USERS });
export { cache as userSchemaCache };
const gameModeSchema = new mongoose.Schema({
  singleMode: {
    gamesPlayed: { type: Number, default: 0 },
    gamesWon: { type: Number, default: 0 },
  },
  doubleMode: {
    gamesPlayed: { type: Number, default: 0 },
    gamesWon: { type: Number, default: 0 },
  },
});
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
  hangman: gameModeSchema,
  scrambled: gameModeSchema,
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

export { Model as UserModel };
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
        createdAt: Utils.createdAt(user),
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
export const getGamesLeaderboard = async (
  _game: "hangman" | "scrambled",
  guildMembers?: APIGuildMember[],
): Promise<SkyGameStatsData> => {
  const query = guildMembers ? { _id: { $in: guildMembers.map((m) => m.user!.id) } } : {};

  const users = await Model.find({ ...query, [_game]: { $exists: true } });

  const singleModeLeaderboard = users
    .filter((user) => (user[_game]?.singleMode.gamesPlayed ?? 0) > 0)
    .sort((a, b) => (b[_game]?.singleMode.gamesWon ?? 0) - (a[_game]?.singleMode.gamesWon ?? 0))
    .slice(0, 10)
    .map((user) => ({
      id: user.data.id ?? user._id,
      username: user.data.username,
      gamesPlayed: user[_game]?.singleMode.gamesPlayed ?? 0,
      gamesWon: user[_game]?.singleMode.gamesWon ?? 0,
    }));

  const doubleModeLeaderboard = users
    .filter((user) => (user[_game]?.doubleMode.gamesPlayed ?? 0) > 0)
    .sort((a, b) => (b[_game]?.doubleMode.gamesWon ?? 0) - (a[_game]?.doubleMode.gamesWon ?? 0))
    .slice(0, 10)
    .map((user) => ({
      id: user.data.id ?? user._id,
      username: user.data.username,
      gamesPlayed: user[_game]?.doubleMode.gamesPlayed ?? 0,
      gamesWon: user[_game]?.doubleMode.gamesWon ?? 0,
    }));

  return {
    singleMode: singleModeLeaderboard,
    doubleMode: doubleModeLeaderboard,
  };
};
