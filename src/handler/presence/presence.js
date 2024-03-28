// presence/presence.js

const { ActivityType } = require("discord.js");
const cron = require("node-cron");
const { shardsTime } = require("./shardsTime");

const getActivity = async () => {
  const activities = [
    {
      activities: [
        {
          name: "Sky: Children of the Light",
          type: ActivityType.Playing,
        },
      ],
      status: "idle",
    },
    {
      activities: [
        {
          name: "Shards Fall!",
          type: ActivityType.Watching,
        },
      ],
      status: "dnd",
    },
    {
      activities: [
        {
          name: "Sky: CoTL",
          type: ActivityType.Streaming,
          url: "",
        },
      ],
      status: "dnd",
    },
    {
      activities: [
        {
          name: "Shards Fall!",
          type: ActivityType.Watching,
        },
      ],
      status: "dnd",
    },
    {
      activities: [
        {
          name: "Shards Fall!",
          type: ActivityType.Watching,
        },
      ],
      status: "dnd",
    },
  ];
};
module.exports = (client) => {
  cron.schedule("*/1 * * * *", async () => {
    const status = await shardsTime();
    client.user.setPresence({
      activities: [{ name: status, type: ActivityType.Custom }],
      status: "online",
    });
  });
};
