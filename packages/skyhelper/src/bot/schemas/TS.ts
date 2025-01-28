import type { TSData } from "@/types/schemas";
import { Collection } from "@discordjs/collection";
import mongoose from "mongoose";
const cache = new Collection<string, TSData>();
const Schema = new mongoose.Schema({
  name: String,
  value: String,
  visitDate: String,
  index: Number,
});

const Model = mongoose.model<TSData>("TS", Schema);
export { Model as TSModel };
export async function getTS(): Promise<TSData> {
  const cached = cache.first();
  if (cached) return cached;
  let tsData = await Model.findOne();
  if (!tsData) {
    tsData = new Model({
      name: "Sassy Drifter",
      value: "sassy",
      visitData: "11-04-2024",
      index: "111",
    });

    await tsData.save();
  }
  cache.set("ts", tsData);
  return tsData;
}
