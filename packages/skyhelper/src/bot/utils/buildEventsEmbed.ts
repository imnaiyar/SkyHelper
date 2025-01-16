import type { SpiritsData } from "../libs/constants/spirits-datas/type.d.ts";
import type { SkyHelper } from "#structures";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder, time } from "discord.js";
import getEvent from "#handlers/getSpecialEvent";
import "moment-duration-format";
import { getTS } from "#handlers";
import type { getTranslator } from "#bot/i18n";
import { eventData, SkytimesUtils as skyutils } from "skyhelper-utils";

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
  const specialEvent = await getEvent();
  // Special Events
  const eventDesc =
    typeof specialEvent === "string"
      ? t("features:times-embed.EVENT_INACTIVE")
      : t("features:times-embed.EVENT_ACTIVE", {
          EVENT_NAME: specialEvent.name,
          DATE1: time(specialEvent.start.unix(), "F"),
          DATE2: time(specialEvent.end.unix(), "F"),
          DAYS: specialEvent.days,
          DURATION: specialEvent.duration,
          STARTS_ENDS: specialEvent.active ? t("features:times-embed.ENDS") : t("features:times-embed.STARTS"),
        });

  // Traveling spirit
  let tsDesc: string;
  if (!tsData) {
    tsDesc = "Unknown!";
  } else {
    const spirit: SpiritsData = client.spiritsData[tsData.value as keyof typeof client.spiritsData];
    const emote = spirit?.expression?.icon || "❓";
    const strVisiting = t("features:times-embed.TS_VISITING", {
      TS_NAME: `${emote} ${spirit?.name || t("features:times-embed.TS_UPDATED")}`,
      DATE: time(tsData.nextVisit.clone().add(3, "days").endOf("day").toDate(), "F"),
      DURATION: tsData.duration,
    });
    const strExpected = t("features:times-embed.TS_EXPECTED", {
      TS_NAME: `${emote} ${spirit?.name || t("features:times-embed.TS_UNKNOWN")}`,
      DATE: time(tsData.nextVisit.toDate(), "F"),
      DURATION: tsData.duration,
    });
    tsDesc = tsData.visiting ? strVisiting : strExpected;
  }

  // Build the Embed
  const embed = new EmbedBuilder()
    .setAuthor({ name: t("features:times-embed.EMBED_AUTHOR"), iconURL: client.user.displayAvatarURL() })
    .setTitle(t("features:times-embed.EMBED_TITLE"))
    .setColor("Random")
    .addFields(
      // Add Basic Embeds
      ...skyutils.allEventDetails().map(([k, { event, status }]) => {
        let desc = "";
        if (status.active) {
          desc += `${t("features:times-embed.ACTIVE", {
            EVENT: event.name,
            DURATION: status.duration,
            ACTIVE_TIME: time(status.startTime.unix(), "t"),
            END_TIME: time(status.endTime.unix(), "t"),
          })}\n- -# ${t("features:times-embed.NEXT-OCC-IDLE", {
            TIME: time(status.nextTime.unix(), event.occursOn ? "F" : "t"),
          })}`;
        } else {
          desc += t("features:times-embed.NEXT-OCC", {
            TIME: time(status.nextTime.unix(), event.occursOn ? "F" : "t"),
            DURATION: status.duration,
          });
        }
        return {
          name:
            // @ts-ignore
            t(`features:times-embed.${k.toString().toUpperCase()}`) + (status.active ? " <a:uptime:1228956558113771580>" : ""),
          value: desc,
          inline: true,
        };
      }),
      {
        name: t("features:times-embed.TS_TITLE"),
        value: tsDesc,
        inline: true,
      },
      {
        name: t("features:times-embed.EVENT_TITLE"),
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
