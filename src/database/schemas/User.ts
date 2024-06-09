import mongoose, { Document } from "mongoose";
import config from "#src/config";
import FixedSizeMap from "fixedsize-map";
import type { User } from "discord.js";
interface UserSchema extends Document {
    _id: string;
    data: {
        username: string;
        createdAt: Date;
    };
    isBlacklisted: boolean;
}
const cache = new FixedSizeMap<string, UserSchema>(config.CACHE_SIZE.USERS);
const Schema = new mongoose.Schema<UserSchema>({
    _id: String,
    data: {
        username: String,
        createdAt: Date
    },
    isBlacklisted: Boolean
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
                username: user.username,
                createdAt: user.createdAt
            }
        });

        await userData.save();
    }
    cache.add(user.id, userData);
    return userData;
}
