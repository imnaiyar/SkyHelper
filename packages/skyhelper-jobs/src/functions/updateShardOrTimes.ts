import moment from "moment-timezone";
import { getTranslator } from "./getTranslator.js";
import { Webhook, WebhookMessageCreateOptions } from "#src/structures/Webhook.js";
import { getActiveUpdates } from "#src/database/getGuildDBValues.js";
import getShardsEmbed from "./getShardsEmbed.js";
import { getTimesEmbed } from "./getTimesEmbed.js";
import { GuildSchema } from "#src/types.js";
import { logger } from "#src/structures/Logger.js";
import { throttleRequests } from "./throttleRequests.js";
import { DiscordAPIError } from "@discordjs/rest";

/**
 * Updates Shards/Times Embeds
 * @param type Type of the event
 * @param client The bot client
 */
export async function eventSchedules(type: "shard" | "times"): Promise<void> {
  const currentDate = moment().tz("America/Los_Angeles");
  switch (type) {
    case "times": {
      const response = async (_t: ReturnType<typeof getTranslator>): Promise<WebhookMessageCreateOptions> => {
        const embed = await getTimesEmbed(_t);
        return { embeds: [embed] };
      };
      const data = await getActiveUpdates("times");
      await update(data, "autoTimes", response);
      break;
    }
    case "shard": {
      const response = async (t: ReturnType<typeof getTranslator>): Promise<WebhookMessageCreateOptions> =>
        getShardsEmbed(currentDate, t, t("features:shards-embed.FOOTER"), true);
      const data = await getActiveUpdates("shard");
      await update(data, "autoShard", response);
    }
  }
}

/**
 * Updates the message
 * @param data Arrray of Guild Documents from database
 * @param type Type of the event
 * @param client The bot client
 * @param response Response to send
 */
const update = async (
  data: GuildSchema[],
  type: "autoShard" | "autoTimes",
  response: (t: ReturnType<typeof getTranslator>) => Promise<WebhookMessageCreateOptions>,
): Promise<void> => {
  await throttleRequests(data, async (guild) => {
    const event = guild[type];
    if (!event.webhook.id) return;
    const webhook = new Webhook({ token: event.webhook.token || undefined, id: event.webhook.id });
    const t = getTranslator(guild.language?.value ?? "en-US");
    const now = moment();
    const res = await webhook
      .editMessage(event.messageId, {
        content: t("features:shards-embed.CONTENT", { TIME: `<t:${now.unix()}:R>` }),
        ...(await response(t)),
      })
      .catch((e) => e);
    if (res instanceof DiscordAPIError && (res.message === "Unknown Message" || res.message === "Unknown Webhook")) {
      if (res.code === 10008) {
        webhook.delete().catch(() => {});
        logger.error(`Live ${type} disabled for ${guild.data.name}, message found deleted!`);
      }
      if (res.code === 10015) {
        logger.error(`Live ${type} disabled for ${guild.data.name}, webhook not found!`);
      }
      guild[type] = {
        active: false,
        webhook: { id: null, token: null },
        messageId: "",
      };
      await guild.save().catch((er) => logger.error("Error Saving to Database" + ` ${type}[Guild: ${guild.data.name}]`, er));
    }
  });
};
