import { getTranslator } from "@/i18n";
import type { GuildSchema } from "@/types/schemas";
import { SkyHelper } from "@/structures";
import embeds from "@/utils/classes/Embeds";
import { DateTime } from "luxon";
import { ChannelType, type APITextChannel } from "@discordjs/core";
import RemindersUtils from "@/utils/classes/RemindersUtils";

export const handleLive = async (
  client: SkyHelper,
  type: string,
  sub: string,
  config: GuildSchema,
  t: ReturnType<typeof getTranslator>,
  channel?: APITextChannel,
) => {
  const liveType = type === "shards" ? "autoShard" : "autoTimes";
  const liveData = config[liveType];
  if (sub === "start") {
    if (!channel) throw new Error("No channels provided");
    if (liveData.messageId && liveData.webhook?.id) {
      const wbh = await client.api.webhooks
        .get(liveData.webhook.id, { token: liveData.webhook.token ?? undefined })
        .catch(() => {});
      const ms = await client.api.channels.getMessage(channel.id, liveData.messageId).catch(() => {});
      if (ms && wbh) {
        return {
          embeds: [
            {
              description: t("commands:LIVE_UPDATES.RESPONSES.ALREADY_CONFIGURED", {
                CHANNEL: `<#${wbh.channel_id}>`,
                MESSAGE: client.utils.messageUrl(ms, channel.guild_id),
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
    if (channel.type !== ChannelType.GuildText) {
      return {
        embeds: [
          {
            description: t("commands:LIVE_UPDATES.RESPONSES.INVALID_CHANNEL", { CHANNEL: `<${channel.id}>` }),
            color: 0xff0000,
          },
        ],
      };
    }

    const wb = await new RemindersUtils(client).createWebhookAfterChecks(
      channel.id,
      {
        name: "SkyHelper Live Notifications",
        avatar: client.utils.getUserAvatar(client.user),
      },
      "For SkyHelper Live Notifications",
    );

    const currentDate = DateTime.now().setZone(client.timezone);
    const updatedAt = Math.floor(currentDate.valueOf() / 1000);
    const ts = getTranslator(config.language?.value ?? "en-us");
    const result =
      type === "Shards"
        ? embeds.buildShardEmbed(currentDate, ts, ts("features:shards-embed.FOOTER"), true)
        : await embeds.getTimesEmbed(client, ts, ts("features:times-embed.FOOTER"));
    const msg = await client.api.webhooks.execute(wb.id, wb.token!, {
      username: `${type} Updates`,
      avatar_url: client.utils.getUserAvatar(client.user),
      content: t("features:shards-embed.CONTENT", { TIME: `<t:${updatedAt}:R>` }),
      ...result,
      wait: true,
    });
    config[liveType] = {
      active: true,
      messageId: msg.id,
      webhook: { id: wb.id, token: wb.token!, channelId: wb.channel_id },
    };
    await config.save();
    return {
      embeds: [
        {
          description: t("commands:LIVE_UPDATES.RESPONSES.CONFIGURED", {
            CHANNEL: channel.toString(),
            MESSAGE: client.utils.messageUrl(msg, channel.guild_id),
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
    await client.api.webhooks.deleteMessage(liveData.webhook.id, liveData.webhook.token!, liveData.messageId).catch(() => {});
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
