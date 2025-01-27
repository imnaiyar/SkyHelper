import type { EventData } from "@/types/schemas";
import { Collection } from "@discordjs/collection";
import mongoose from "mongoose";
const cache = new Collection<string, EventData>();
const Schema = new mongoose.Schema({
  name: String,
  startDate: String,
  endDate: String,
});

const Model = mongoose.model<EventData>("Event", Schema);
export { Model as EventModel };
export async function getEvent(): Promise<EventData> {
  const cached = cache.first();
  if (cached) return cached;
  let eventData = await Model.findOne();
  if (!eventData) {
    eventData = new Model({
      name: "Days of Bloom",
      startDate: "25-03-2024",
      endDate: "23-04-2024",
    });

    await eventData.save();
  }
  cache.set("event", eventData);
  return eventData;
}
