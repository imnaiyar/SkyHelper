import "dotenv/config";
import { SkyHelper } from "#structures";
import { transferData } from "./transferData.js";
import { initializeMongoose } from "#src/database/mongoose";
const client = new SkyHelper();
await initializeMongoose();
client.on("ready", async () => {
  try {
    await transferData(client);
  } catch (err) {
    console.log(err);
  }
});
client.login(process.env.TOKEN);
