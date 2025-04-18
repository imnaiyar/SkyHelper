import { realms_emojis, seasonsData } from "@skyhelperbot/constants";
import type { SpiritsData } from "@skyhelperbot/constants/spirits-datas";
import type { Command, SkyHelper } from "@/structures";
import type { getTranslator } from "@/i18n";
import { TRAVELING_SPIRITS_DATA } from "@/modules/commands-data/info-commands";
import { getTSData } from "@/utils/getEventDatas";
import { Spirits } from "@/utils/classes/Spirits";
import { MessageFlags, type APIInteractionResponseCallbackData } from "@discordjs/core";
import { container, mediaGallery, section, separator, textDisplay, thumbnail } from "@skyhelperbot/utils";
import { emojis } from "@skyhelperbot/constants";
const isSeasonal = (data: SpiritsData) => "ts" in data;
export default {
  async interactionRun({ t, helper }) {
    await helper.defer();

    await helper.editReply(await getTSResponse(helper.client, t, helper.user.id));
  },
  ...TRAVELING_SPIRITS_DATA,
} satisfies Command;

const getTSResponse = async (
  client: SkyHelper,
  t: ReturnType<typeof getTranslator>,
  userid: string,
): Promise<APIInteractionResponseCallbackData> => {
  const ts = await getTSData();

  if (!ts) return { content: t("commands:TRAVELING-SPIRIT.RESPONSES.NO_DATA") };

  const visitingDates = `${client.utils.time(ts.nextVisit.toUnixInteger(), "D")} - ${client.utils.time(ts.nextVisit.plus({ days: 3 }).endOf("day").toUnixInteger(), "D")}`;
  if (ts.value) {
    const spirit: SpiritsData = client.spiritsData[ts.value as keyof typeof client.spiritsData];
    if (!isSeasonal(spirit)) return { content: t("commands:TRAVELING-SPIRIT.RESPONSES.NO_DATA") };
    const emote = spirit.expression?.icon || "<:spiritIcon:1206501060303130664>";
    const description = ts.visiting
      ? t("commands:TRAVELING-SPIRIT.RESPONSES.VISITING", {
          SPIRIT: "↪",
          TIME: client.utils.time(ts.nextVisit.plus({ days: 3 }).endOf("day").toUnixInteger(), "F"),
          DURATION: ts.duration,
        })
      : t("commands:TRAVELING-SPIRIT.RESPONSES.EXPECTED", {
          SPIRIT: "↪",
          DATE: client.utils.time(ts.nextVisit.toUnixInteger(), "F"),
          DURATION: ts.duration,
        });
    const headerContent = `-# ${t("commands:TRAVELING-SPIRIT.RESPONSES.EMBED_AUTHOR", { INDEX: ts.index })}\n### [${emote} ${
      spirit.name
    }${spirit.extra || ""}](https://sky-children-of-the-light.fandom.com/wiki/${spirit.name.split(" ").join("_")})`;
    const manager = new Spirits(spirit, t, client);

    // !NOTE: Keep this 9 components as location/tree button splice assuming this many components
    // !Ideally there would be better way but i'm lazy to look at this
    const component = container(
      spirit.image ? section(thumbnail(spirit.image, spirit.name), headerContent) : textDisplay(headerContent),
      separator(),
      textDisplay(description),
      textDisplay(
        `\n\n**${t("commands:TRAVELING-SPIRIT.RESPONSES.VISITING_TITLE")}** ${visitingDates}\n**${t("features:SPIRITS.REALM_TITLE")}:** ${
          realms_emojis[spirit.realm!]
        } ${spirit.realm}\n**${t("features:SPIRITS.SEASON_TITLE")}:** ${Object.values(seasonsData).find((v) => v.name === spirit.season)?.icon} Season of ${spirit.season!}`,
      ),
      separator(false, 1),
      textDisplay(
        `**${
          spirit.ts?.returned
            ? t("features:SPIRITS.TREE_TITLE", { CREDIT: spirit.tree!.by })
            : t("features:SPIRITS.SEASONAL_CHART", { CREDIT: spirit.tree!.by })
        }**\n${emojis.tree_end}${spirit
          .tree!.total.replaceAll(":RegularCandle:", "<:RegularCandle:1207793250895794226>")
          .replaceAll(":RegularHeart:", "<:regularHeart:1207793247792013474>")
          .replaceAll(":AC:", "<:AscendedCandle:1207793254301433926>")}`,
      ),
      mediaGallery({ media: { url: "https://cdn.imnaiyar.site/" + spirit.tree!.image } }),
      separator(),
      manager.getButtons(userid),
    );

    return { components: [component], flags: MessageFlags.IsComponentsV2 };
  } else {
    let description = ts.visiting
      ? t("commands:TRAVELING-SPIRIT.RESPONSES.VISITING", {
          SPIRIT: t("features:SPIRITS.UNKNOWN"),
          TIME: client.utils.time(ts.nextVisit.plus({ days: 3 }).endOf("day").toUnixInteger(), "F"),
          DURATION: ts.duration,
        })
      : t("commands:TRAVELING-SPIRIT.RESPONSES.EXPECTED", {
          SPIRIT: t("features:SPIRITS.UNKNOWN"),
          DATE: client.utils.time(ts.nextVisit.toUnixInteger(), "F"),
          DURATION: ts.duration,
        });
    description += `\n\n**${t("commands:TRAVELING-SPIRIT.RESPONSES.VISITING_TITLE")}** ${visitingDates}`;
    const component = container(
      textDisplay(`**${t("commands:TRAVELING-SPIRIT.RESPONSES.EMBED_AUTHOR", { INDEX: "X" })}**`),
      separator(),
      textDisplay(description),
    );
    return { components: [component], flags: MessageFlags.IsComponentsV2 };
  }
};
