import type { ComponentStructure } from "@/structures";
import Utils from "@/utils/classes/Utils";
import type { APIEmbed } from "@discordjs/core";
import { SkytimesUtils } from "@skyhelperbot/utils";

export default {
  data: {
    name: "skytimes-details",
  },
  async execute(interaction, t, helper) {
    const value = interaction.data.values[0];
    const { event, allOccurences, status } = SkytimesUtils.getEventDetails(value);
    const embed: APIEmbed = {
      title: event.name + " Times",
      footer: {
        text: "SkyTimes",
      },
    };
    let desc = "";
    if (status.active) {
      desc += `${t("features:times-embed.ACTIVE", {
        EVENT: event.name,
        DURATION: status.duration,
        ACTIVE_TIME: Utils.time(status.startTime.toUnixInteger(), "t"),
        END_TIME: Utils.time(status.endTime.toUnixInteger(), "t"),
      })}\n- -# ${t("features:times-embed.NEXT-OCC-IDLE", {
        TIME: Utils.time(status.nextTime.toUnixInteger(), event.occursOn ? "F" : "t"),
      })}`;
    } else {
      desc += t("features:times-embed.NEXT-OCC", {
        TIME: Utils.time(status.nextTime.toUnixInteger(), event.occursOn ? "F" : "t"),
        DURATION: status.duration,
      });
    }
    desc += `\n\n**${t("features:times-embed.TIMELINE")}**\n${allOccurences.slice(0, 2000)}`;

    if (event.infographic) {
      desc += `\n\n© ${event.infographic.by}`;
      embed.image = { url: event.infographic.image };
    }
    embed.description = desc;
    return void helper.reply({ embeds: [embed], flags: 64 });
  },
} satisfies ComponentStructure<"Select">;
