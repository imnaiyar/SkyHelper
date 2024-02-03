// presence/presence.js

const { ActivityType } = require("discord.js");
const cron = require("node-cron");
const { shardsTime } = require("./shardsTime");

module.exports = (client) => {
  cron.schedule("*/1 * * * *", async () => {
    const status = await shardsTime();
    client.user.setPresence({
      activities: [{ name: status, type: ActivityType.Custom }],
      status: "online",
    });
  });
};
