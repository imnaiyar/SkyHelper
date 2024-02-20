const { model, Schema } = require("mongoose");

// Define the schema
const BlacklistedGuildSchema = new Schema({
  Guild: String,
  Name: String,
  Reason: String,
  Date: Date,
});

// Create and export the BlacklistedGuild model
module.exports = model("blacklist-guild", BlacklistedGuildSchema);
