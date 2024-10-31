import type { SeasonPrice, SpiritItems } from "#libs";
import { Collection, User } from "discord.js";
import { SeasonPrices } from "#libs/constants/seasonPrices";
import mongoose, { Document } from "mongoose";
interface SpiritCosmetics extends SpiritItems {
  acquired: boolean;
}
interface UserSpirit extends SeasonPrice {
  collectibles: SpiritCosmetics[];
}
export interface UserSpiritData extends Document {
  id: string;
  username: string;
  hasPass: boolean;
  currentCandles: number;
  spirits: {
    [key: string]: UserSpirit;
  };
}

// @ts-ignore
const cache = new Collection<string, UserSpiritData>();
const Schema = new mongoose.Schema<UserSpiritData>({
  id: String,
  username: String,
  hasPass: Boolean,
  currentCandles: Number,
  spirits: Object,
});

const Model = mongoose.model<UserSpiritData>("userSeasonData", Schema);
export { Model as UserSeasonModel };
export async function getUserData(user: User): Promise<UserSpiritData> {
  if (!user) throw new Error("User not provided");
  const cached = cache.first();
  if (cached) return cached;
  let data = await Model.findOne({ id: user.id });
  if (!data) {
    const pp: { [key: string]: UserSpirit } = {};
    Object.keys(SeasonPrices).forEach((k) => {
      const spirit = SeasonPrices[k];
      pp[k] = {
        icon: spirit.icon,
        collectibles: spirit.collectibles.map((c) => ({
          ...c,
          acquired: false,
        })),
      };
    });
    data = new Model({
      id: user.id,
      username: user.username,
      hasPass: false,
      currentCandles: 0,
      spirits: pp,
    });

    await data.save();
  }
  cache.set("ts", data);
  return data;
}
