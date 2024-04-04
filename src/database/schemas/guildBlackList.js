import { model, Schema } from 'mongoose';

// Define the schema
const BlacklistedGuildSchema = new Schema({
  Guild: String,
  Name: String,
  Reason: String,
  Date: Date,
});

// Create and export the BlacklistedGuild model
export default model("blacklist-guild", BlacklistedGuildSchema);
