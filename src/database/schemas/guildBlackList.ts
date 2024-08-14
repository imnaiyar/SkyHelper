import { model, Schema } from "mongoose";

const BlacklistedGuildSchema = new Schema({
  Guild: String,
  Name: String,
  Reason: String,
  Date: Date,
});

export default model("blacklist-guild", BlacklistedGuildSchema);
