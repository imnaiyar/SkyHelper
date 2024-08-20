import mongoose, { Document } from "mongoose";
import { LimitedCollection } from "discord.js";
import { DailyQuest } from "#libs";
export interface DailyQuestsSchema extends Document {
  quests: DailyQuest[];
  last_updated: string;
  last_message?: string;
  rotating_candles: DailyQuest;
  seasonal_candles?: DailyQuest;
}
const questSchema = {
  title: String,
  date: String,
  description: String,
  images: [
    {
      url: String,
      by: String,
      source: String,
    },
  ],
};
const cache = new LimitedCollection<string, DailyQuestsSchema>({ maxSize: 1 });
const Schema = new mongoose.Schema<DailyQuestsSchema>({
  quests: [questSchema],
  last_message: String,
  last_updated: String,
  rotating_candles: questSchema,
  seasonal_candles: questSchema,
});

const Model = mongoose.model<DailyQuestsSchema>("quests", Schema);

export async function getDailyQuests(): Promise<DailyQuestsSchema> {
  const cached = cache.first();
  if (cached) return cached;

  let questData = await Model.findOne();
  if (!questData) {
    // create a new guild model
    questData = new Model({
      quests: [],
    });

    await questData.save();
  }
  cache.set("123456789", questData);
  return questData;
}
