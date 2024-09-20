import { getTranslator } from "#bot/i18n";
import type { GuildSchema } from "#bot/libs/types";
import { SkyHelper } from "#bot/structures/SkyHelper";
import { buildShardEmbed, getTimesEmbed } from "#bot/utils/index";
import { EmbedBuilder, TextChannel } from "discord.js";
import moment from "moment-timezone";

export const handleLive = async (
  client: SkyHelper,
  type: "Shards" | "SkyTimes",
  sub: string,
  config: GuildSchema,
  t: ReturnType<typeof getTranslator>,
  channel?: TextChannel,
) => {
  const liveType = type === "Shards" ? "autoShard" : "autoTimes";
  const liveData = config[liveType];
  if (sub === "start") {
    if (!channel) throw new Error("No channels provided");
    if (liveData.messageId && liveData.webhook?.id) {
      const wbh = await client.fetchWebhook(liveData.webhook.id, liveData.webhook.token ?? undefined).catch(() => {});
      const ms = await wbh?.fetchMessage(liveData.messageId).catch(() => {});
      if (ms && wbh) {
        return {
          embeds: [
            new EmbedBuilder()
              .setDescription(
                t("commands.SHARDS_LIVE.RESPONSES.ALREADY_CONFIGURED", {
                  CHANNEL: `<#${wbh.channelId}>`,
                  MESSAGE: ms.url,
                  TYPE: `"Live ${type}"`,
                }),
              )
              .setColor("Red"),
          ],
        };
      }
    }

    /*
      This probably won't trigger ever since command option won't allow any other channel type, but putting it here just in case
      */
    if (!channel.isSendable() || channel.isVoiceBased()) {
      return {
        embeds: [
          new EmbedBuilder()
            .setDescription(t("commands.SHARDS_LIVE.RESPONSES.INVALID_CHANNEL", { CHANNEL: channel }))
            .setColor("Red"),
        ],
      };
    }
    if (!channel.permissionsFor(channel.guild.members.me!).has("ManageWebhooks")) {
      return {
        embeds: [new EmbedBuilder().setDescription(t("common.NO-WB-PERM-BOT", { CHANNEL: channel.toString() })).setColor("Red")],
      };
    }
    const wb = await client.createWebhook(channel, `For live ${type} Update`);
    const currentDate = moment().tz(client.timezone);
    const updatedAt = Math.floor(currentDate.valueOf() / 1000);
    const ts = getTranslator(config.language?.value ?? "en-us");
    const result =
      type === "Shards"
        ? buildShardEmbed(currentDate, ts, ts("shards-embed.FOOTER"), true)
        : await getTimesEmbed(client, ts, ts("times-embed.FOOTER"));
    const msg = await wb.send({
      username: `${type} Updates`,
      avatarURL: client.user.displayAvatarURL(),
      content: t("shards-embed.CONTENT", { TIME: `<t:${updatedAt}:R>` }),
      ...result,
    });
    config[liveType] = {
      active: true,
      messageId: msg.id,
      webhook: { id: wb.id, token: wb.token },
    };
    await config.save();
    return {
      embeds: [
        new EmbedBuilder()
          .setDescription(
            t("commands.SHARDS_LIVE.RESPONSES.CONFIGURED", {
              CHANNEL: channel.toString(),
              MESSAGE: msg.url,
              TYPE: `"Live ${type}"`,
            }),
          )
          .setColor("Green"),
      ],
    };
  } else {
    if (!liveData.webhook.id || !liveData.messageId) {
      return {
        embeds: [
          new EmbedBuilder()
            .setDescription(t("commands.SHARDS_LIVE.RESPONSES.ALREADY_DISABLED", { TYPE: `"Live ${type}"` }))
            .setColor("Red"),
        ],
      };
    }

    const wbh = await client.fetchWebhook(liveData.webhook.id, liveData.webhook.token ?? undefined).catch(() => {});
    if (!wbh) {
      return {
        embeds: [
          new EmbedBuilder()
            .setDescription(t("commands.SHARDS_LIVE.RESPONSES.ALREADY_DISABLED", { TYPE: `"Live ${type}"` }))
            .setColor("Red"),
        ],
      };
    }
    await wbh.deleteMessage(liveData.messageId).catch(() => {});
    await wbh.delete();
    config[liveType] = { active: false, webhook: { id: null, token: null }, messageId: "" };

    return {
      embeds: [
        new EmbedBuilder()
          .setDescription(t("commands.SHARDS_LIVE.RESPONSES.DISABLED", { TYPE: `"Live ${type}"` }))
          .setColor("Red"),
      ],
    };
  }
};
