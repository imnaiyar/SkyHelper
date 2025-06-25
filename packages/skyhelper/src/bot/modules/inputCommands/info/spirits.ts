import type { SpiritsData } from "@skyhelperbot/constants/spirits-datas";
import { MessageFlags } from "@discordjs/core";
import { Spirits } from "@/utils/classes/Spirits";
import type { Command } from "@/structures";
import { SPIRTIS_DATA } from "@/modules/commands-data/guide-commands";
import type { InteractionHelper } from "@/utils/classes/InteractionUtil";
import { container, row, section, separator, textDisplay } from "@skyhelperbot/utils";
import { realms_emojis, season_emojis } from "@skyhelperbot/constants";
export default {
  async interactionRun({ t, helper, options }) {
    await helper.defer({ flags: options.getBoolean("hide") ? MessageFlags.Ephemeral : undefined });
    const value = options.getString("search");
    if (!value) return void (await handleSpiritList(helper));
    const data = helper.client.spiritsData[value as keyof typeof helper.client.spiritsData] as SpiritsData;

    if (!data) {
      await helper.editReply({
        content: t("commands:SPIRITS.RESPONSES.NO_DATA", {
          VALUE: value,
          COMMAND: `</utils contact-us:${helper.client.applicationCommands.find((c) => c.name === "utils")!.id}>`,
        }),
      });
      return;
    }
    const manager = new Spirits(data, t, helper.client);
    await helper.editReply({
      components: [manager.getResponseEmbed(helper.user.id)],
      flags: MessageFlags.IsComponentsV2,
    });
  },

  async autocomplete({ helper, options }) {
    const focused = options.getFocusedOption() as { value: string };
    const data = Object.entries(helper.client.spiritsData)
      .filter(([, v]) => v.name.toLowerCase().includes(focused.value.toLowerCase()))
      .map(([k, v]) => ({
        name: `↪️ ${v.name}`,
        value: k,
      }));
    await helper.respond({ choices: data.slice(0, 25) });
  },
  ...SPIRTIS_DATA,
} satisfies Command<true>;

async function handleSpiritList(helper: InteractionHelper) {
  const { user, client } = helper;
  const spirits = Object.entries(client.spiritsData);
  const per_page = 10;
  const total = Math.floor(spirits.length / per_page);
  let index = 0;
  const getComps = () => {
    const start = index * per_page;
    const currentSpirits = spirits.slice(start, start + per_page);

    const components = container(
      textDisplay("### Spirits List"),
      separator(),
      ...currentSpirits.map(([k, v]) => {
        const icon = v.expression?.icon || v.icon || null;
        const seasonIcon = "ts" in v ? season_emojis[v.season] : null;
        const realmIcon = v.realm ? realms_emojis[v.realm] : null;
        return section(
          {
            type: 2,
            custom_id: client.utils.store.serialize(client.utils.customId.SpiritButton, { spirit_key: k, user: null }),
            label: "Info",
            style: 2,
          },
          icon + " " + v.name + `(${[seasonIcon, realmIcon].filter(Boolean).join(" ")})`,
          `-# ${v.type}`,
        );
      }),
      separator(true, 1),
      row(
        {
          type: 2,
          custom_id: client.utils.store.serialize(client.utils.customId.Default, {
            data: "spirits_list_prev",
            user: helper.user.id,
          }),
          label: "Prev",
          style: 2,
          disabled: index === 0,
        },
        { type: 2, custom_id: "sdff", label: `Page ${index + 1}/${total + 1}`, style: 1, disabled: true },
        {
          type: 2,
          custom_id: client.utils.store.serialize(client.utils.customId.Default, {
            data: "spirits_list_next",
            user: helper.user.id,
          }),
          label: "Next",
          style: 2,
          disabled: index === total,
        },
      ),
    );
    return components;
  };

  const message = await helper.editReply({
    components: [getComps()],
    flags: MessageFlags.IsComponentsV2,
  });

  const collector = client.componentCollector({
    componentType: 2,
    filter: (i) =>
      (i.member?.user || i.user!).id === user.id &&
      client.utils.store.deserialize(i.data.custom_id).id === client.utils.customId.Default,
    idle: 9e4,
    message,
  });

  collector.on("collect", async (i) => {
    const { id, data } = client.utils.store.deserialize(i.data.custom_id);
    if (id !== client.utils.customId.Default) return;
    if (data.data === "spirits_list_prev") {
      index = Math.max(0, index - 1);
    } else if (data.data === "spirits_list_next") {
      index = Math.min(total, index + 1);
    } else {
      return;
    }
    await client.api.interactions.updateMessage(i.id, i.token, {
      components: [getComps()],
    });
  });
}
