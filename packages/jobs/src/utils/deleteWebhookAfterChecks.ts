import { logger } from "@/structures/Logger";
import type { Webhook } from "@/structures/Webhook";
import type { GuildSchema } from "@/types";

export async function deleteWebhookAfterChecks(webhook: Webhook, schema: GuildSchema, excludeKeys: string[] = []): Promise<void> {
  const keys = Object.keys(schema.reminders.events).filter((k) => !excludeKeys.includes(k));
  const liveUse =
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    (!excludeKeys.includes("autoShard") && schema.autoShard?.webhook?.id === webhook.id) ||
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    (!excludeKeys.includes("autoTimes") && schema.autoTimes?.webhook?.id === webhook.id);
  const inUse =
    keys.some((key) => schema.reminders.events[key as keyof GuildSchema["reminders"]["events"]]?.webhook?.id === webhook.id) ||
    liveUse;

  if (!inUse) {
    await webhook.delete();
    logger.debug(`Deleted webhook ${webhook.id} from guild ${schema._id}`);
  }
}
