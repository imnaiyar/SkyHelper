import type { SeasonData } from "@skyhelperbot/constants";
import { Spirits } from "@/utils/classes/Spirits";
import type { SpiritsData, SeasonalSpiritData } from "@skyhelperbot/constants/spirits-datas";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import { ComponentType, type APIActionRowComponent, type APIStringSelectComponent } from "@discordjs/core";

function isSeasonal(data: SpiritsData): data is SeasonalSpiritData {
  return "ts" in data;
}
export async function handleSpirits(helper: InteractionHelper, seasonOrRealm: SeasonData | string) {
  const client = helper.client;
  const t = helper.t;
  const spirits = Object.entries(client.spiritsData).filter(([, v]) => {
    if (typeof seasonOrRealm !== "string") {
      return isSeasonal(v) && v.season && v.season.toLowerCase() === seasonOrRealm.name.toLowerCase();
    }
    return v.realm && v.realm.toLowerCase() === seasonOrRealm.toLowerCase();
  });
  if (!spirits.length) {
    return await helper.editReply({
      content:
        "Something went wrong! No spirits found for this season. If you think it's wrong, do let us know via" +
        " " +
        client.utils.mentionCommand(client, "utils", "contact-us"),
    });
  }
  let value = spirits[0][0];
  const placehoder = typeof seasonOrRealm === "string" ? `${seasonOrRealm} Spirits` : `Season of ${seasonOrRealm.name}`;

  const getUpdate = async (commandHelper: InteractionHelper) => {
    const data = client.spiritsData[value];
    const row: APIActionRowComponent<APIStringSelectComponent> = {
      type: ComponentType.ActionRow,
      components: [
        {
          type: ComponentType.StringSelect,
          custom_id: client.utils.encodeCustomId({ id: "spirit-select-menu", user: helper.user.id }),
          placeholder: placehoder,
          options: spirits.map(([k, v]) => ({
            label: v.name + (v.extra ? ` (${v.extra})` : ""),
            value: k.toString(),
            emoji: client.utils.parseEmoji(v.expression?.icon || v.icon || (seasonOrRealm as SeasonData).icon)!,
            default: value === k,
          })),
        },
      ],
    };
    const manager = new Spirits(data, t, client);
    const btns = manager.getButtons(helper.user.id);
    const msg = await commandHelper.editReply({
      embeds: [manager.getEmbed()],
      ...(btns.components?.length ? { components: [row, manager.getButtons(helper.user.id)] } : { components: [row] }),
    });
    return msg;
  };
  const message = await getUpdate(helper);
  const collector = client.componentCollector({
    filter: (i) =>
      client.utils.parseCustomId(i.data.custom_id)!.id === "spirit-select-menu" &&
      helper.user.id === (i.member?.user || i.user)!.id,
    componentType: ComponentType.StringSelect,
    message,
  });
  collector.on("collect", async (stringInt) => {
    const strHelper = new InteractionHelper(stringInt, client);
    await strHelper.deferUpdate();
    value = stringInt.data.values[0];

    await getUpdate(strHelper);
  });
}
