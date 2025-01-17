import mongo, { Document } from "mongoose";
interface TSData extends Document {
  // Name of the returning TS
  name: string;

  /* The value of spirit in the spiritsData */
  value: string;

  /* Date of the visit */
  visitDate: string;

  /* Link to the image of the spirit */
  spiritImage: string;

  /* TS returning Index */
  index: number;
}
const Schema = new mongo.Schema({
  name: String,
  value: String,
  visitDate: String,
  spiritImage: String,
  index: Number,
});
const TSmodel = mongo.model<TSData>("TS", Schema);
export const getTSDB = async () => {
  const data = await TSmodel.findOne();
  if (!data) return await new TSmodel().save();
  return data;
};
