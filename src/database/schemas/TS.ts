import { Collection } from "discord.js";
import mongoose from "mongoose";
const cache = new Collection<string, mongoose.Document>();
const Schema = new mongoose.Schema({
  name: String,
  value: String,
  visitDate: String,
  spiritImage: String,
  index: String,
});

const Model = mongoose.model("TS", Schema);

export async function getTS(): Promise<mongoose.Document> {
  const cached = cache.first();
  if (cached) return cached;
  let tsData = await Model.findOne();
  if (!tsData) {
    tsData = new Model({
      name: "Sassy Drifter",
      value: "sassy",
      visitData: "11-04-2024",
      spiritImage: "https://cdn.imnaiyar.site/Sassy_Drifter_Tree.png",
      index: "111",
    });

    await tsData.save();
  }
  return tsData;
}
