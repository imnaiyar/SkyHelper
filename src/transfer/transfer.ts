import { SkyHelper } from "#structures";
import { transferData } from "./transferData.js";
const client = new SkyHelper();
client.on("ready", async () => {
    try {
        await transferData(client);
    } catch (err) {
        console.log(err);
    }
});
client.login(process.env.TOKEN)
