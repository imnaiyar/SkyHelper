import { Spirits } from "@/utils/classes/Spirits";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import {
  ComponentType,
  MessageFlags,
  type APIActionRowComponent,
  type APIContainerComponent,
  type APIStringSelectComponent,
} from "@discordjs/core";
import { CustomId } from "@/utils/customId-store";
import type { IRealm, ISeason, ISkyData, ISpirit } from "skygame-data";

export async function handleSpirits(helper: InteractionHelper, seasonOrRealm: IRealm | ISeason, data: ISkyData) {
  const client = helper.client;
  const t = helper.t;
  const spirits =
    ("areas" in seasonOrRealm
      ? seasonOrRealm.areas?.flatMap((area) => area.spirits ?? [])
      : (seasonOrRealm as ISeason).spirits) ?? [];

  if (!spirits.length) {
    return await helper.editReply({
      content:
        "Something went wrong! No spirits found for this season. If you think it's wrong, do let us know via" +
        " " +
        client.utils.mentionCommand(client, "utils", "contact-us"),
    });
  }
  let value = spirits[0]!.guid;
  const placehoder =
    "areas" in seasonOrRealm
      ? t("commands:GUIDES.RESPONSES.REALM_SELECT_PLACEHOLDER", { REALM: seasonOrRealm.name })
      : t("commands:GUIDES.RESPONSES.SPIRIT_SELECT_PLACEHOLDER", { SEASON: seasonOrRealm.name });

  const getUpdate = async (commandHelper: InteractionHelper) => {
    const spirit = data.guids.get(value) as ISpirit;
    const row: APIActionRowComponent<APIStringSelectComponent> = {
      type: ComponentType.ActionRow,
      components: [
        {
          type: ComponentType.StringSelect,
          custom_id: client.utils.store.serialize(CustomId.SeasonalSpiritRow, { user: helper.user.id }),
          placeholder: placehoder,
          options: spirits.map((sp) => ({
            label: sp.name,
            value: sp.guid,
            emoji: sp.emoji ? helper.client.utils.parseEmoji(sp.emoji)! : undefined,
            default: value === sp.guid,
          })),
        },
      ],
    };
    const res = await new Spirits(spirit, t, client, data).getResponseEmbed(commandHelper.user.id);

    const msg = await commandHelper.editReply({
      ...res,
      components: [...(res.components ?? []), row],
      flags: MessageFlags.IsComponentsV2,
    });
    return msg;
  };
  const message = await getUpdate(helper);
  const collector = client.componentCollector({
    filter: (i) =>
      client.utils.store.deserialize(i.data.custom_id).id === CustomId.SeasonalSpiritRow &&
      helper.user.id === (i.member?.user ?? i.user)!.id,
    idle: 90_000,
    message,
  });
  collector.on("collect", async (stringInt) => {
    const strHelper = new InteractionHelper(stringInt, client);
    if (!strHelper.isStringSelect(stringInt)) return;
    await strHelper.deferUpdate();
    value = stringInt.data.values[0]!;

    await getUpdate(strHelper);
  });
  collector.on("end", async () => {
    const m = await helper.fetchReply().catch(() => {});
    if (!m) return;
    const components = [...m.components!] as APIContainerComponent[];
    components[0]?.components.splice(9, 1);
    await helper.editReply({ components });
  });
}
