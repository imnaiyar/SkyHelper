import { getTimes, getShard } from "./autoSchema.js";
import { SkyHelper } from "#structures";
export async function transferData(client: SkyHelper) {
    await transfer("autoTimes", client);
    console.log("Completed 'autoTimes' transfer...");
    await transfer("autoShard", client);
    console.log("Completed 'autoShard' transfer...");
    process.exit();
}
async function transfer(type: "autoTimes" | "autoShard", client: SkyHelper) {
    let datas;
    if (type === "autoShard") datas = await getShard();
    else datas = await getTimes();
    for (const data of datas) {
        const guild = client.guilds.cache.get(data._id);
        if (!guild) continue;
        const settings = await client.database.getSettings(guild);
        settings[type] = {
            active: true,
            messageId: data.messageId,
            webhook: data.webhook
        };
        await settings.save();
        console.log("Trasferred " + guild.name + "...");
    }
}
