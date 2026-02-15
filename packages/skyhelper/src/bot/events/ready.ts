import { ActivityType, GatewayDispatchEvents, GatewayOpcodes, PresenceUpdateStatus, type APIEmbed } from "@discordjs/core";
import type { Event } from "../structures/Event.js";
import { setTimeout as wait } from "node:timers/promises";
import chalk from "chalk";
import { bootstrap } from "@/api/main";
import { ShardsUtil } from "@skyhelperbot/utils";
import { DateTime } from "luxon";
import { fetchSkyData } from "@/planner";

const readyHandler: Event<GatewayDispatchEvents.Ready> = async (client) => {
  client.logger.custom(`Logged in as ${client.user.username}`, "BOT");

  // Enable Dashboard
  console.log(chalk.blueBright(`\n\n<${"-".repeat(24)} Dashboard ${"-".repeat(26)}>\n`));
  if (client.config.DASHBOARD.enabled) await bootstrap(client);

  setInterval(() => {
    client.gateway.send(0, {
      op: GatewayOpcodes.PresenceUpdate,
      d: {
        activities: [getActivity()],
        status: PresenceUpdateStatus.Online,
        since: Date.now(),
        afk: false,
      },
    });
  }, 2 * 60_000);
  // mark client ready;
  client.readTimestamp = Date.now();
  client.ready = true;

  // fetch planner data on ready so its cached;
  await fetchSkyData(client);

  // send ready log
  await wait(5000); // wait 5s for guilds cache to fill;
  const readyalertemb: APIEmbed = {
    fields: [
      {
        name: "Bot Status",
        value: `Total guilds: ${client.guilds.size}\nTotal Users: ${client.guilds.reduce((size, g) => size + g.member_count, 0)}`,
        inline: false,
      },
      {
        name: "Interactions",
        value: `Loaded Interactions`,
        inline: false,
      },
      {
        name: "Success",
        value: `SkyHelper is now online`,
      },
    ],
    color: 0xffd700, // Gold color
    timestamp: new Date().toISOString(),
  };

  // Ready alert
  const ready = process.env.READY_LOGS ? client.utils.parseWebhookURL(process.env.READY_LOGS) : null;
  if (ready) {
    await client.api.webhooks.execute(ready.id, ready.token, {
      username: "Ready",
      avatar_url: client.utils.getUserAvatar(client.user),
      embeds: [readyalertemb],
    });
  }
};

export default readyHandler;

function getActivity() {
  const status = ShardsUtil.getStatus(DateTime.now().setZone("America/Los_Angeles"));
  let shardStatus = "";

  if (status === "No Shard") {
    shardStatus = "😟 No shard today";
  } else {
    const isActive = status.find((s) => s.active);
    const allEnded = status.every((s) => s.ended);
    const yetToFall = status.find((s) => !s.active && !s.ended);
    const getIndex = (i: number) => i.toString() + ShardsUtil.getSuffix(i);
    shardStatus = allEnded
      ? "😟 All shards ended for today"
      : isActive
        ? `🌋 ${getIndex(isActive.index)} shard ends in ${isActive.duration}`
        : `🌋 ${getIndex(yetToFall!.index)} shard lands in ${yetToFall!.duration}`;
  }

  const activities = [
    {
      name: "Shards being menacing",
      type: ActivityType.Watching,
    },
    {
      name: "Shards fall",
      type: ActivityType.Watching,
    },
    {
      name: "Mellow Musician",
      type: ActivityType.Listening,
    },
    {
      name: "Custom status",
      state: shardStatus,
      type: ActivityType.Custom,
    },
    {
      name: "Valley Race",
      type: ActivityType.Competing,
    },
    {
      name: "Sky COTL Videos",
      type: ActivityType.Streaming,
      url: "https://www.twitch.tv/directory/category/sky-children-of-the-light",
    },
  ];
  return activities[Math.floor(Math.random() * activities.length)]!;
}
