import { getTranslator } from "./getTranslator";
import { Webhook, type WebhookMessageCreateOptions } from "@/structures/Webhook";
import { getActiveUpdates } from "@/database/getGuildDBValues";
import type { GuildSchema } from "@/types";
import { logger } from "@/structures/Logger";
import { throttleRequests } from "./throttleRequests";
import { DiscordAPIError } from "@discordjs/rest";
import { DateTime } from "luxon";
import { deleteWebhookAfterChecks } from "@/utils/deleteWebhookAfterChecks";
import { BASE_API } from "@/constants";
import type { APIActionRowComponent, APIComponentInMessageActionRow, APIEmbed, APIMessageComponent } from "discord-api-types/v10";
const getEmbed = async (type?: "shards" | "times", query: { locale?: string; date?: string; noBtn?: boolean } = {}) => {
  return (await fetch(BASE_API + `/${type}-embed?${new URLSearchParams(JSON.stringify(query))}`).then((res) => res.json())) as {
    embeds: APIEmbed[];
    components: APIActionRowComponent<APIComponentInMessageActionRow>[];
  };
};
/**
 * Updates Shards/Times Embeds
 * @param type Type of the event
 * @param client The bot client
 */
export async function eventSchedules(type: "shard" | "times"): Promise<void> {
  const currentDate = DateTime.now().setZone("America/Los_Angeles");
  switch (type) {
    case "times": {
      const response = async (locale?: string): Promise<WebhookMessageCreateOptions> => {
        return await getEmbed("times", { locale });
      };
      const data = await getActiveUpdates("times");
      await update(data, "autoTimes", response);
      break;
    }
    case "shard": {
      const response = async (locale?: string): Promise<WebhookMessageCreateOptions> =>
        getEmbed("shards", { date: currentDate.toFormat("yyyy-MM-dd"), locale, noBtn: true });
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
  response: (locale?: string) => Promise<WebhookMessageCreateOptions>,
): Promise<void> => {
  await throttleRequests(data, async (guild) => {
    const event = guild[type];
    if (!event.webhook.id) return;
    const webhook = new Webhook({ token: event.webhook.token || undefined, id: event.webhook.id });
    const t = getTranslator(guild.language?.value ?? "en-US");
    const now = DateTime.now();
    const d = await response(guild.language?.value ?? "en-US");
    const res = await webhook
      .editMessage(
        event.messageId,
        {
          ...d,
          components: [
            { type: 10, content: t("features:shards-embed.CONTENT", { TIME: `<t:${now.toUnixInteger()}:R>` }) },
            ...(d.components as APIMessageComponent[]),
          ],
        },
        { thread_id: event.webhook.threadId, retries: 3 },
      )
      .catch((e) => e);
    if (res instanceof DiscordAPIError && (res.message === "Unknown Message" || res.message === "Unknown Webhook")) {
      if (res.code === 10008) {
        // unknown message
        deleteWebhookAfterChecks(webhook, guild, [type]);
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
