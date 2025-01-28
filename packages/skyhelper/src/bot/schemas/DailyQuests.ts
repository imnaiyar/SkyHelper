import mongoose from "mongoose";
import { Collection } from "@discordjs/collection";
import type { DailyQuestsSchema } from "@/types/schemas";

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
const cache = new Collection<string, DailyQuestsSchema>();
const Schema = new mongoose.Schema<DailyQuestsSchema>({
  quests: [questSchema],
  last_message: String,
  last_updated: String,
  rotating_candles: questSchema,
  seasonal_candles: questSchema,
});

const Model = mongoose.model<DailyQuestsSchema>("quests", Schema);
export { Model as QuestsModel };
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
