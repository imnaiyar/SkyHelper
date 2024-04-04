// presence/presence.js

import { ActivityType } from 'discord.js';

import cron from 'node-cron';
import { shardsTime } from './shardsTime';

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

export default (client) => {
  cron.schedule("*/1 * * * *", async () => {
    const status = await shardsTime();
    client.user.setPresence({
      activities: [{ name: status, type: ActivityType.Custom }],
      status: "online",
    });
  });
};
