import { buildShardEmbed, getEventEmbed } from "#handlers";
import type { GuildSchema } from "#libs";
import type { SkyHelper } from "#structures";
import { type WebhookMessageCreateOptions, time } from "discord.js";
import moment from "moment";

export default async (type: "shard" | "times", client: SkyHelper): Promise<void> => {
  const currentDate = moment().tz(client.timezone);
  switch (type) {
    case "times": {
      const embed = await getEventEmbed(client);
      const response: WebhookMessageCreateOptions = { embeds: [embed] };
      const data = await client.database.getActiveUpdates("times");
      await update(data, "autoTimes", client, response);
      break;
    }
    case "shard": {
      const response: WebhookMessageCreateOptions = buildShardEmbed(currentDate, "Live Shard (updates every 5 min.)", true);
      const data = await client.database.getActiveUpdates("shard");
      await update(data, "autoShard", client, response);
    }
  }
};

const update = async (
  data: GuildSchema[],
  type: "autoShard" | "autoTimes",
  client: SkyHelper,
  response: WebhookMessageCreateOptions,
): Promise<void> => {
  data.forEach(async (guild) => {
    const event = guild[type];
    if (!event.webhook.id) return;
    const webhook = await client.fetchWebhook(event.webhook.id, event.webhook.token ?? undefined).catch(() => null);
    if (!webhook) {
      guild[type].active = false;
      guild[type].messageId = "";
      guild[type].webhook.id = null;
      guild[type].webhook.token = null;
      await guild.save();
      client.logger.error(`Live ${type} disabled for ${guild.data.name}, webhook found deleted!`);
      return;
    }

    webhook
      .editMessage(event.messageId, {
        content: `Last Update At: ${time(new Date(), "R")}`,
        ...response,
      })
      .catch((e) => {
        if (e.message === "Unknown Message") {
          guild[type].webhook.id = null;
          guild[type].active = false;
          guild[type].messageId = "";
          guild[type].webhook.token = null;
          guild.save();
          webhook.delete().catch(() => {});
          client.logger.error(`Live ${type} disabled for ${guild.data.name}, message found deleted!`);
          return;
        }
        client.logger.error(`AutoUpdate [${type}]:`, e);
      });
  });
};
