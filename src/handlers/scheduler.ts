import { Jobs } from "#libs";
import { scheduledUpdates } from "#handlers";
import type { SkyHelper } from "#structures";

export default (client: SkyHelper) => {
  const option = {
    timezone: client.timezone,
  };

  // Shards
  new Jobs({
    interval: "*/1 * * * *",
    callback: async () => {
      try {
        await scheduledUpdates("shard", client);
      } catch (err) {
        client.logger.error("AutoShard:", err);
      }
    },
    options: option,
  });

  // SkyTimes
  new Jobs({
    interval: "*/1 * * * *",
    callback: async () => {
      try {
        await scheduledUpdates("times", client);
      } catch (err) {
        client.logger.error("AutoTimes:", err);
      }
    },
    options: option,
  });
};
