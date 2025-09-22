import type { InteractionHelper } from "@/utils/classes/InteractionUtil";
import type { APIEmbed, APIMessageComponentSelectMenuInteraction } from "@discordjs/core";
import { SkytimesUtils, type EventKey } from "@skyhelperbot/utils";

export async function handleSkyTimesSelect(interaction: APIMessageComponentSelectMenuInteraction, helper: InteractionHelper) {
  const value = interaction.data.values[0];
  const { t, client } = helper;
  const { event, allOccurences, status } = SkytimesUtils.getEventDetails(value as EventKey);
  const embed: APIEmbed = {
    // @ts-expect-error joinig char makes the type as string
    title: helper.t(`features:times-embed.EVENTS.${value.toUpperCase()}`) + " Times",
    footer: {
      text: "SkyTimes",
    },
  };
  let desc = "";
  if (status.active) {
    desc += `${t("features:times-embed.ACTIVE", {
      EVENT: event.name,
      DURATION: status.duration,
      ACTIVE_TIME: client.utils.time(status.startTime.toUnixInteger(), "t"),
      END_TIME: client.utils.time(status.endTime.toUnixInteger(), "t"),
    })}\n- -# ${t("features:times-embed.NEXT-OCC-IDLE", {
      TIME: client.utils.time(status.nextTime.toUnixInteger(), event.occursOn ? "F" : "t"),
    })}`;
  } else {
    desc += t("features:times-embed.NEXT-OCC", {
      TIME: client.utils.time(status.nextTime.toUnixInteger(), event.occursOn ? "F" : "t"),
      DURATION: status.duration,
    });
  }
  desc += `\n\n**${t("features:shards-embed.TIMELINE")}**\n${allOccurences.slice(0, 2000)}`;

  if (event.infographic) {
    desc += `\n\n© ${event.infographic.by}`;
    embed.image = { url: event.infographic.image };
  }
  embed.description = desc;
  return void (await helper.reply({ embeds: [embed], flags: 64 }));
}
