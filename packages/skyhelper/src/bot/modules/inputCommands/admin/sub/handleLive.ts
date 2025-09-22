import { getTranslator } from "@/i18n";
import type { GuildSchema } from "@/types/schemas";
import { SkyHelper } from "@/structures";
import { getTimesEmbed, buildShardEmbed } from "@/utils/classes/Embeds";
import { DateTime } from "luxon";
import {
  type APIInteractionDataResolvedChannel,
  MessageFlags,
  type APITextChannel,
  type APIGuildForumChannel,
} from "@discordjs/core";
import RemindersUtils from "@/utils/classes/RemindersUtils";
import { textDisplay } from "@skyhelperbot/utils";
import { SendableChannels } from "@skyhelperbot/constants";

export const handleLive = async (
  client: SkyHelper,
  type: string,
  sub: string,
  config: GuildSchema,
  t: ReturnType<typeof getTranslator>,
  resolvedChannel?: APIInteractionDataResolvedChannel,
) => {
  const liveType = type === "shards" ? "autoShard" : "autoTimes";
  const liveData = config[liveType];
  if (sub === "start") {
    if (!resolvedChannel) throw new Error("No channels provided");
    const isThread = "thread_metadata" in resolvedChannel;
    const channelToCreateWb = client.channels.get(isThread ? resolvedChannel.parent_id! : resolvedChannel.id) as
      | APITextChannel
      | APIGuildForumChannel;

    if (liveData.messageId && liveData.webhook.id) {
      const wbh = await client.api.webhooks
        .get(liveData.webhook.id, { token: liveData.webhook.token ?? undefined })
        .catch(() => {});
      const ms = await client.api.webhooks
        .getMessage(liveData.webhook.id, liveData.webhook.token!, liveData.messageId, { thread_id: liveData.webhook.threadId })
        .catch(() => {});
      if (ms && wbh) {
        return {
          embeds: [
            {
              description: t("commands:LIVE_UPDATES.RESPONSES.ALREADY_CONFIGURED", {
                CHANNEL: `<#${wbh.channel_id}>`,
                MESSAGE: client.utils.messageUrl(ms, channelToCreateWb.guild_id),
                TYPE: `"Live ${type}"`,
              }),
              color: 0xff0000,
            },
          ],
        };
      }
    }

    /*
      This probably won't trigger ever since command option won't allow any other channel type, but putting it here just in case
      */
    if (!SendableChannels.includes(resolvedChannel.type)) {
      return {
        embeds: [
          {
            description: t("commands:LIVE_UPDATES.RESPONSES.INVALID_CHANNEL", { CHANNEL: `<#${resolvedChannel.id}>` }),
            color: 0xff0000,
          },
        ],
      };
    }

    const wb = await new RemindersUtils(client).createWebhookAfterChecks(
      channelToCreateWb.id,
      {
        name: "SkyHelper Live Notifications",
        avatar: client.utils.getUserAvatar(client.user),
      },
      "For SkyHelper Live Notifications",
    );

    const currentDate = DateTime.now().setZone(client.timezone);
    const updatedAt = Math.floor(currentDate.valueOf() / 1000);
    const ts = getTranslator(config.language?.value ?? "en-us");
    const result = type === "shards" ? buildShardEmbed(currentDate, ts, true) : await getTimesEmbed(client, ts);

    const msg = await client.api.webhooks.execute(wb.id, wb.token!, {
      username: `${type} Updates`,
      avatar_url: client.utils.getUserAvatar(client.user),
      thread_id: isThread ? resolvedChannel.id : undefined,
      ...result,
      flags: MessageFlags.IsComponentsV2,
      components: [textDisplay(t("features:shards-embed.CONTENT", { TIME: `<t:${updatedAt}:R>` })), ...result.components],
      wait: true,
    });
    config[liveType] = {
      active: true,
      messageId: msg.id,
      webhook: { id: wb.id, token: wb.token!, channelId: wb.channel_id, threadId: isThread ? resolvedChannel.id : undefined },
    };
    await config.save();
    return {
      embeds: [
        {
          description: t("commands:LIVE_UPDATES.RESPONSES.CONFIGURED", {
            CHANNEL: `<#${resolvedChannel.id}>`,
            MESSAGE: client.utils.messageUrl(msg, channelToCreateWb.guild_id),
            TYPE: `"Live ${type}"`,
          }),
          color: 0x00ff00,
        },
      ],
    };
  } else {
    if (!liveData.webhook.id || !liveData.messageId) {
      return {
        embeds: [
          {
            description: t("commands:LIVE_UPDATES.RESPONSES.ALREADY_DISABLED", { TYPE: `"Live ${type}"` }),
            color: 0xff0000,
          },
        ],
      };
    }
    await client.api.webhooks
      .deleteMessage(liveData.webhook.id, liveData.webhook.token!, liveData.messageId, { thread_id: liveData.webhook.threadId })
      .catch(() => {});
    await new RemindersUtils(client).deleteAfterChecks(liveData.webhook as { id: string; token: string }, [liveType], config);

    config[liveType] = { active: false, webhook: { id: null, token: null, channelId: null }, messageId: "" };

    return {
      embeds: [
        {
          description: t("commands:LIVE_UPDATES.RESPONSES.DISABLED", { TYPE: `"Live ${type}"` }),
          color: 0xff0000,
        },
      ],
    };
  }
};
