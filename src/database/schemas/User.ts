import mongoose, { Document } from "mongoose";
import config from "#src/config";
import { type User, LimitedCollection } from "discord.js";

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
