import mongoose from "mongoose";

export * from "./GuildSchema.js";
export * from "./UserSchema.js";
export * from "./SpecialEvents.js";
export * from "./TS.js";
export * from "./BlackList.js";
export * from "./DailyQuests.js";

const StatisticSchema = new mongoose.Schema({
  command: {
    name: { type: String },
    user: { type: String },
  },
  guildEvent: {
    event: { type: String },
    guildId: { type: String },
  },
  timestamp: { type: Date, required: true, default: Date.now, expires: "30d" },
});

export const StatisticsModel = mongoose.model("statistics", StatisticSchema);
