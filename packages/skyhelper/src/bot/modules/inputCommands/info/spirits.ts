import type { SpiritsData } from "@skyhelperbot/constants/spirits-datas";
import { MessageFlags } from "@discordjs/core";
import { Spirits } from "@/utils/classes/Spirits";
import type { Command } from "@/structures";
import { SPIRTIS_DATA } from "@/modules/commands-data/guide-commands";
import type { InteractionHelper } from "@/utils/classes/InteractionUtil";
import { container, mediaGallery, mediaGalleryItem, row, section, separator, textDisplay } from "@skyhelperbot/utils";
import { realms_emojis, season_emojis } from "@skyhelperbot/constants";
import { paginate } from "@/utils/paginator";
import { CustomId, store } from "@/utils/customId-store";

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
  const appMojis = [...helper.client.applicationEmojis.values()];
  const title = [
    mediaGallery(
      mediaGalleryItem(
        "https://cdn.discordapp.com/attachments/867638574571323424/1388104684841074769/70908119_385533342122318_574799647931891712_n_copy_2000x300.jpg?ex=685fc4ba&is=685e733a&hm=a8540d5c131920d0d35b23d5a71cee0a45149eca7a3827b96a258275277ec8d5&",
      ),
    ),
    textDisplay("### List Of Spirits"),
    separator(),
  ] as const;

  await paginate(
    helper,
    spirits,
    (data, navBtns) => {
      const comp = container(
        ...title,
        ...data.flatMap(([key, spirit], i) => {
          const seasonIcon = "ts" in spirit ? season_emojis[spirit.season] || "" : "";
          const realmIcon = spirit.realm ? realms_emojis[spirit.realm] || "" : "";
          let icon = appMojis.filter((e) => e.name.split("_").slice(0, -1).join("_") === key.replaceAll("-", ""));
          if (icon.length === 0) {
            icon = appMojis.filter((e) => e.name.startsWith("ts"));
          }
          const mapped = icon
            .sort((a, b) => Number(a.name.split("_").at(-1)) - Number(b.name.split("_").at(-1)))
            .map((e) => `<${e.animated ? "a" : ""}:${e.name}:${e.id}>`);
          return [
            section(
              {
                type: 2,
                label: "Info",
                custom_id: store.serialize(CustomId.SpiritButton, { spirit_key: key, user: null }),
                style: 2,
              },
              `${mapped[0]}${mapped[1]} **${spirit.name}${spirit.extra ? ` (${spirit.extra})` : ""} [↗](https://sky-children-of-the-light.fandom.com/wiki/${spirit.name.split(" ").join("_")})**`,
              `${mapped[2]}${mapped[3]}${realmIcon}${seasonIcon}${spirit.collectibles?.map((c) => c.icon).join(" ") || ""}`,
            ),
            ...(i === data.length - 1 ? [] : [separator(false)]),
          ];
        }),
      );
      return { components: [comp, navBtns], flags: MessageFlags.IsComponentsV2 };
    },
    { per_page: 8, user: user.id },
  );
}
