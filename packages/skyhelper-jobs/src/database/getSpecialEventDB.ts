import mongo, { Document } from "mongoose";

interface EventData extends Document {
  /* Start date of the event */
  startDate: string;

  /* End date of the event */
  endDate: string;

  /* Name of the event */
  name: string;
}
const Schema = new mongo.Schema({
  name: String,
  startDate: String,
  endDate: String,
});
const eventModel = mongo.model<EventData>("Event", Schema);
export const getSpecialEventDB = async () => {
  const data = await eventModel.findOne();
  if (!data) return await new eventModel().save();
  return data;
};
