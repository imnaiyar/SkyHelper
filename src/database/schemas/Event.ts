import { Collection } from "discord.js";
import mongoose from "mongoose";
const cache = new Collection<string, mongoose.Document>();
const Schema = new mongoose.Schema({
  eventActive: Boolean,
  eventName: String,
  eventStarts: String,
  eventEnds: String,
  eventDuration: String,
});

const Model = mongoose.model("Event", Schema);

export async function getEvent(): Promise<mongoose.Document> {
  const cached = cache.first();
  if (cached) return cached;
  let eventData = await Model.findOne();
  if (!eventData) {
    eventData = new Model({
      eventActive: true,
      eventName: "Days of Bloom",
      eventStarts: "25-03-2024",
      eventEnds: "23-04-2024",
      eventDuration: "13 Days",
    });

    await eventData.save();
  }
  return eventData;
}
