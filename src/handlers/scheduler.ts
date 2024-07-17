import { Jobs } from "#libs";
import { eventSchedules, reminderSchedules } from "#handlers";
import type { SkyHelper } from "#structures";
import { ScheduleOptions } from "node-cron";
export default (client: SkyHelper) => {
  const options: ScheduleOptions = {
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
    options: {
      ...options,
      name: "Shards Job",
    },
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
    options: {
      ...options,
      name: "SkyTimes Job",
    },
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
      options: {
        ...options,
        name: "Reminders (Common) Job",
      },
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
    options: {
      ...options,
      name: "Reset Reminder Job",
    },
  });

  // Eden Reminders
  new Jobs({
    interval: "0 0 * * 0",
    async callback() {
      try {
        await reminderSchedules(client, "eden");
      } catch (err) {
        client.logger.error(`"eden" Reminder Error: `, err);
      }
    },
    options: {
      ...options,
      name: "Eden Job",
    },
  });
};
