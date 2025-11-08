import { MessageFlags } from "@discordjs/core";
import { Spirits } from "@/utils/classes/Spirits";
import type { Command } from "@/structures";
import { SPIRTIS_DATA } from "@/modules/commands-data/guide-commands";
import type { InteractionHelper } from "@/utils/classes/InteractionUtil";
import { container, mediaGallery, mediaGalleryItem, section, separator, textDisplay } from "@skyhelperbot/utils";
import { realms_emojis, season_emojis } from "@skyhelperbot/constants";
import { paginate } from "@/utils/paginator";
import { CustomId, store } from "@/utils/customId-store";
import {
  CollectibleItems,
  getItemsInSpiritTree,
  getSkyGamePlannerData,
  getSpiritsInRealm,
  ItemType,
  SpiritType,
} from "@skyhelperbot/constants/skygame-planner";
import Utils from "@/utils/classes/Utils";

export default {
  async interactionRun({ t, helper, options }) {
    await helper.defer({ flags: options.getBoolean("hide") ? MessageFlags.Ephemeral : undefined });
    const value = options.getString("search");
    if (!value) {
      await handleSpiritList(helper);
      return;
    }
    const data = await getSkyGamePlannerData();
    const spirit = data.spirits.find((s) => s.guid === value);

    if (!spirit) {
      await helper.editReply({
        content: t("commands:SPIRITS.RESPONSES.NO_DATA", {
          VALUE: value,
          COMMAND: `</utils contact-us:${helper.client.applicationCommands.find((c) => c.name === "utils")!.id}>`,
        }),
      });
      return;
    }
    const manager = new Spirits(spirit, t, helper.client, data);
    await helper.editReply({ ...(await manager.getResponseEmbed(helper.user.id)), flags: MessageFlags.IsComponentsV2 });
  },

  async autocomplete({ helper, options }) {
    const focused = options.getFocusedOption() as { value: string };
    const spirits = await getSkyGamePlannerData();
    const data = spirits.spirits
      .filter(
        (s) =>
          s.type !== SpiritType.Special &&
          s.type !== SpiritType.Event &&
          s.name.toLowerCase().includes(focused.value.toLowerCase()),
      )
      .map((s) => ({
        name: `↪️ ${s.name}`,
        value: s.guid,
      }));
    await helper.respond({ choices: data.slice(0, 25) });
  },
  ...SPIRTIS_DATA,
} satisfies Command<true>;

async function handleSpiritList(helper: InteractionHelper) {
  const { user, client } = helper;

  const pData = await getSkyGamePlannerData();
  const spirits = pData.spirits.filter((s) => s.type !== SpiritType.Special && s.type !== SpiritType.Event);
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
        ...data.flatMap((spirit) => {
          const realm = pData.realms.find((r) => getSpiritsInRealm(r.guid, pData).some((sp) => sp.guid === spirit.guid));
          const seasonIcon = spirit.season ? Utils.formatEmoji(spirit.season.emoji, spirit.season.shortName) : "";
          const realmIcon = realm ? Utils.formatEmoji(realm.emoji, realm.name) : "";
          const legacySpirit = Object.values(client.spiritsData).find((s) => s.name === spirit.name);
          return [
            section(
              {
                type: 2,
                label: "Info",
                custom_id: store.serialize(CustomId.SpiritButton, { spirit_key: spirit.guid, user: null }),
                style: 2,
              },
              `**${spirit.name}${legacySpirit?.extra ? ` (${legacySpirit.extra})` : ""} [↗](https://sky-children-of-the-light.fandom.com/wiki/${spirit.name.split(" ").join("_")})**`,
              `${realmIcon}${seasonIcon}${getItemsInSpiritTree(spirit.guid, pData)
                .filter((i) => CollectibleItems.includes(i.type as ItemType))
                .map((c) => Utils.formatEmoji(c.emoji, c.name))
                .join(" ")}`,
            ),
          ];
        }),
      );
      return { components: [comp, navBtns], flags: MessageFlags.IsComponentsV2 };
    },
    { per_page: 8, user: user.id },
  );
}
