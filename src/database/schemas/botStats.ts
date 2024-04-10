import { SkyHelper } from "#structures";
import mongoose from "mongoose";
const Schema = new mongoose.Schema({
  _id: String,
  data: {
    servers: Number,
    slash: Number,
    members: Number,
  },
});

const Model = mongoose.model("botStats", Schema);

export async function botSettings(client: SkyHelper): Promise<mongoose.Document> {
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
