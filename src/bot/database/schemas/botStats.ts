import type { SkyHelper } from "#structures";
import mongoose, { Document } from "mongoose";
interface BotSchema extends Document {
  _id: string;
  data: {
    servers: number;
    slash: number;
    members: number;
  };
}
const Schema = new mongoose.Schema<BotSchema>({
  _id: String,
  data: {
    servers: Number,
    slash: Number,
    members: Number,
  },
});

const Model = mongoose.model("botStats", Schema);

export { Model as BotStatsModel };

export async function botSettings(client: SkyHelper): Promise<BotSchema> {
  let botData = await Model.findById(client.user.id);
  const commands = await client.application.commands.fetch();
  if (!botData) {
    botData = new Model({
      _id: client.user.id,
      data: {
        servers: client.guilds.cache.size,
        slash: commands.size,
        members: client.guilds.cache.reduce((total, guild) => total + guild.memberCount, 0),
      },
    });

    await botData.save();
  }
  return botData;
}
