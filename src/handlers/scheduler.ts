import { Jobs } from "#libs";
import { eventSchedules, reminderSchedules } from "#handlers";
import type { SkyHelper } from "#structures";

export default (client: SkyHelper) => {
  const options = {
    timezone: client.timezone,
  };

  // Shards
  new Jobs({
    interval: "*/5 * * * *",
    callback: async () => {
      try {
        await eventSchedules("shard", client);
      } catch (err) {
        client.logger.error("AutoShard:", err);
      }
    },
    options,
  });

  // SkyTimes
  new Jobs({
    interval: "*/1 * * * *",
    callback: async () => {
      try {
        await eventSchedules("times", client);
      } catch (err) {
        client.logger.error("AutoTimes:", err);
      }
    },
    options,
  });

  // reminders
  const offsets = [0, 30, 50];
  for (const offset of offsets) {
    const type = offset === 0 ? "geyser" : offset === 30 ? "grandma" : "turtle";
    new Jobs({
      interval: `${offset} */2 * * *`,
      async callback() {
        try {
          await reminderSchedules(client, type);
        } catch (err) {
          client.logger.error(`${type} Reminder Error: `, err);
        }
      },
      options,
    });
  }

  // Reset Reminders
  new Jobs({
    interval: "0 0 * * *",
    async callback() {
      try {
        await reminderSchedules(client, "reset");
      } catch (err) {
        client.logger.error(`"reset" Reminder Error: `, err);
      }
    },
    options,
  });
};
