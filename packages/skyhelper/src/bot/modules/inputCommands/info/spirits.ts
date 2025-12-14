import { MessageFlags } from "@discordjs/core";
import { Spirits } from "@/utils/classes/Spirits";
import type { Command } from "@/structures";
import { SPIRTIS_DATA } from "@/modules/commands-data/guide-commands";
import type { InteractionHelper } from "@/utils/classes/InteractionUtil";
import { container, mediaGallery, mediaGalleryItem, section, separator, textDisplay } from "@skyhelperbot/utils";
import { paginate } from "@/utils/paginator";
import { CustomId, store } from "@/utils/customId-store";
import Utils from "@/utils/classes/Utils";
import { fetchSkyData, NonCollectibles, PlannerService } from "@/planner";
import { SpiritType } from "@/types/planner";
import { SpiritTreeHelper } from "skygame-data";

export default {
  async interactionRun({ t, helper, options }) {
    await helper.defer({ flags: options.getBoolean("hide") ? MessageFlags.Ephemeral : undefined });
    const value = options.getString("search");
    if (!value) {
      await handleSpiritList(helper);
      return;
    }
    const data = await fetchSkyData(helper.client);
    const spirit = data.spirits.items.find((s) => s.guid === value);

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
    const res = await manager.getResponseEmbed(helper.user.id);
    await helper.editReply({ ...res, flags: MessageFlags.IsComponentsV2 });
  },

  async autocomplete({ helper, options }) {
    const focused = options.getFocusedOption() as { value: string };
    const spirits = await fetchSkyData(helper.client);
    const data = spirits.spirits.items
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
  const { user } = helper;

  const pData = await fetchSkyData(helper.client);
  const spirits = pData.spirits.items.filter((s) => s.type !== SpiritType.Special && s.type !== SpiritType.Event);
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
          const realm = pData.realms.items.find((r) =>
            PlannerService.getSpiritsInRealm(r.guid, pData).some((sp) => sp.guid === spirit.guid),
          );
          const seasonIcon = spirit.season ? Utils.formatEmoji(spirit.season.emoji, spirit.season.shortName) : "";
          const realmIcon = realm ? Utils.formatEmoji(realm.emoji, realm.name) : "";
          return [
            section(
              {
                type: 2,
                label: "Info",
                custom_id: store.serialize(CustomId.SpiritButton, { spirit_key: spirit.guid, user: null }),
                style: 2,
              },
              `**${spirit.name} [↗](https://sky-children-of-the-light.fandom.com/wiki/${spirit.name.split(" ").join("_")})**`,
              `${realmIcon}${seasonIcon}${SpiritTreeHelper.getItems(spirit.tree, true)
                .filter((i) => !NonCollectibles.includes(i.type))
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
