import { model, Schema } from "mongoose";

const BlacklistedSchema = new Schema({
  _id: String,
  type: String,
  name: String,
  reason: String,
  Date: Date,
});

export default model("blacklist-guild", BlacklistedSchema);
