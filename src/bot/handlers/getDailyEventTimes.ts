import type { SpiritsData } from "#libs/types";
import type { SkyHelper } from "#structures";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder, time } from "discord.js";
import getEvent from "#handlers/getSpecialEvent";
import "moment-duration-format";
import { getTS } from "#handlers";
import type { getTranslator } from "#bot/i18n";
import { eventOccurrences } from "#bot/utils/getEventOccurences";
import { eventData } from "#bot/libs/index";

/**
 * Get Times Embed
 * @param client Bot client

 * @param t translator
 * @param text text to include in the footer
 * @returns
 */
export const getTimesEmbed = async (
  client: SkyHelper,
  t: ReturnType<typeof getTranslator>,
  text?: string,
): Promise<{ embeds: EmbedBuilder[]; components: ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>[] }> => {
  const tsData = await getTS();
  const event = await getEvent();
  const eventDesc =
    typeof event === "string"
      ? t("times-embed.EVENT_INACTIVE")
      : t("times-embed.EVENT_ACTIVE", {
          EVENT_NAME: event.name,
          DATE1: time(event.start.unix(), "F"),
          DATE2: time(event.end.unix(), "F"),
          DAYS: event.days,
          DURATION: event.duration,
          STARTS_ENDS: event.active ? t("times-embed.ENDS") : t("times-embed.STARTS"),
        });
  let tsDesc: string;
  if (!tsData) {
    tsDesc = "Unknown!";
  } else {
    const spirit: SpiritsData = client.spiritsData[tsData.value as keyof typeof client.spiritsData];
    const emote = spirit?.expression?.icon || "❓";
    const strVisiting = t("times-embed.TS_VISITING", {
      TS_NAME: `${emote} ${spirit?.name || t("times-embed.TS_UPDATED")}`,
      DATE: time(tsData.nextVisit.clone().add(3, "days").endOf("day").toDate(), "F"),
      DURATION: tsData.duration,
    });
    const strExpected = t("times-embed.TS_EXPECTED", {
      TS_NAME: `${emote} ${spirit?.name || t("times-embed.TS_UNKNOWN")}`,
      DATE: time(tsData.nextVisit.toDate(), "F"),
      DURATION: tsData.duration,
    });
    tsDesc = tsData.visiting ? strVisiting : strExpected;
  }
  const embed = new EmbedBuilder()
    .setAuthor({ name: t("times-embed.EMBED_AUTHOR"), iconURL: client.user.displayAvatarURL() })
    .setTitle(t("times-embed.EMBED_TITLE"))
    .setColor("Random")
    .addFields(
      ...eventOccurrences().map(([_k, e]) => {
        let desc = "";

        if (e.status.active) {
          desc += `${e.event.name} is currently active (at ${time(e.status.startTime.unix(), "T")}) and will end in ${e.status.duration} (at ${time(e.status.endTime.unix(), "T")})`;
        } else {
          desc += `Next Occurence: ${time(e.status.nextTime.unix(), "T")} (in ${e.status.duration})`;
        }
        return {
          name: e.event.name,
          value: desc,
          inline: true,
        };
      }),
      {
        name: t("times-embed.TS_TITLE"),
        value: tsDesc,
        inline: true,
      },
      {
        name: t("times-embed.EVENT_TITLE"),
        value: eventDesc,
        inline: true,
      },
    )
    .setTimestamp();
  if (text) embed.setFooter({ text: text, iconURL: client.user.displayAvatarURL() });
  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("skytimes-details")
      .setPlaceholder("Detailed Timelines")
      .setOptions(
        Object.entries(eventData)
          .filter(([, e]) => e.displayAllTimes)
          .map(([k, e]) => ({
            label: e.name.charAt(0).toUpperCase() + e.name.slice(1),
            value: k,
          })),
      ),
  );
  const btn = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("times-refresh").setEmoji("🔃").setStyle(ButtonStyle.Primary),
  );
  return { embeds: [embed], components: [row, btn] };
};
