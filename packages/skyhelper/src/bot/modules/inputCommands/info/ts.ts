import type { Command, SkyHelper } from "@/structures";
import type { getTranslator } from "@/i18n";
import { TRAVELING_SPIRITS_DATA } from "@/modules/commands-data/info-commands";
import { MessageFlags, type APIInteractionResponseCallbackData, type APIUser } from "@discordjs/core";
import { container, separator, textDisplay } from "@skyhelperbot/utils";
import { fetchSkyData, PlannerService } from "@/planner";
import { Spirits } from "@/utils/classes/Spirits";
import { getNextTs } from "@skyhelperbot/utils";
export default {
  async interactionRun({ t, helper }) {
    await helper.defer();
    const data = await getTSResponse(helper.client, t, helper.user);
    await helper.editReply({ ...data, flags: MessageFlags.IsComponentsV2 });
  },
  ...TRAVELING_SPIRITS_DATA,
} satisfies Command;

const getTSResponse = async (
  client: SkyHelper,
  t: ReturnType<typeof getTranslator>,
  user: APIUser,
): Promise<APIInteractionResponseCallbackData> => {
  const baseTs = getNextTs();
  const data = await fetchSkyData(client);
  const ts = PlannerService.getCurrentTravelingSpirit(data);
  if (!ts && !baseTs) return { content: t("commands:TRAVELING-SPIRIT.RESPONSES.NO_DATA") };

  // if ts data is present, then recreate spirits page
  if (ts) {
    const spirit = new Spirits(ts.spirit, t, client, data);

    return await spirit.getResponseEmbed(user.id);
  } else {
    const visitingDates = `${client.utils.time(baseTs!.nextVisit.toUnixInteger(), "D")} - ${client.utils.time(baseTs!.nextVisit.plus({ days: 3 }).endOf("day").toUnixInteger(), "D")}`;
    let description = baseTs!.visiting
      ? t("commands:TRAVELING-SPIRIT.RESPONSES.VISITING", {
          SPIRIT: t("features:SPIRITS.UNKNOWN"),
          TIME: client.utils.time(baseTs!.nextVisit.plus({ days: 3 }).endOf("day").toUnixInteger(), "F"),
          DURATION: baseTs!.duration,
        })
      : t("commands:TRAVELING-SPIRIT.RESPONSES.EXPECTED", {
          SPIRIT: t("features:SPIRITS.UNKNOWN"),
          DATE: client.utils.time(baseTs!.nextVisit.toUnixInteger(), "F"),
          DURATION: baseTs!.duration,
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
