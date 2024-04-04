import { WebhookClient, EmbedBuilder } from 'discord.js';
import cron from 'node-cron';
import reminders from '@functions/reminders';
import { shardsUpdate, timesUpdate } from '@functions';
import { setupPresence } from '@handler';
import { UpdateEvent, UpdateTS } from '@src/libs/classes';
const ready = process.env.READY_LOGS ? new WebhookClient({ url: process.env.READY_LOGS }) : undefined;

/**
 * ready event handler
 * @param {import('@src/frameworks').SkyHelper} client
 */
export default async (client) => {
  let text;
  client.logger.log(`Logged in as ${client.user.tag}`);
  if (client.config.DASHBOARD.enabled) {
    text = `Website started on port ${client.config.DASHBOARD.port}`;
  } else {
    text = "Website is disabled";
  }

  // Fetching for eval purpose
  await client.application.fetch();

  client.classes.set("UpdateTS", UpdateTS);
  client.classes.set("UpdateEvent", UpdateEvent);

  // bots presence
  setupPresence(client);

  // cron jobs

  // live shards
  cron.schedule("*/5 * * * *", async () => {
    try {
      await shardsUpdate(client);
    } catch (err) {
      client.logger.error("AutoShard Error:", err);
    }
  });

  // live times
  cron.schedule("*/2 * * * *", async () => {
    try {
      await timesUpdate(client);
    } catch (err) {
      client.logger.error("AutoTimes Error:", err);
    }
  });

  // geyser reminder
  cron.schedule(
    "0 */2 * * *",
    async () => {
      try {
        await reminders(client, "geyser");
      } catch (err) {
        client.logger.error(err);
      }
    },
    {
      timezone: "America/Los_Angeles",
    },
  );

  // grandma reminder
  cron.schedule(
    "30 */2 * * *",
    async () => {
      try {
        await reminders(client, "grandma");
      } catch (err) {
        client.logger.error(err);
      }
    },
    {
      timezone: "America/Los_Angeles",
    },
  );

  // reset reminder
  cron.schedule(
    "0 0 * * *",
    async () => {
      try {
        await reminders(client, "reset");
      } catch (err) {
        client.logger.error(err);
      }
    },
    {
      timezone: "America/Los_Angeles",
    },
  );

  // turtle reminder
  cron.schedule(
    "50 */2 * * *",
    async () => {
      try {
        await reminders(client, "turtle");
      } catch (err) {
        client.logger.error(err);
      }
    },
    {
      timezone: "America/Los_Angeles",
    },
  );

  const readyalertemb = new EmbedBuilder()
    .addFields(
      {
        name: "Bot Status",
        value: `Total guilds: ${client.guilds.cache.size}\nTotal Users: ${client.guilds.cache.reduce(
          (size, g) => size + g.memberCount,
          0,
        )}`,
        inline: false,
      },
      {
        name: "Website",
        value: text,
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
    )
    .setColor("Gold")
    .setTimestamp();

  // Ready alert
  if (ready) {
    ready.send({
      username: "Ready",
      avatarURL: client.user.displayAvatarURL(),
      embeds: [readyalertemb],
    });
  }
};
