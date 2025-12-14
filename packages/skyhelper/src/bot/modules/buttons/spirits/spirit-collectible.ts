import { defineButton } from "@/structures";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import { container, mediaGallery, mediaGalleryItem, section, separator, textDisplay, thumbnail } from "@skyhelperbot/utils";
import {
  ButtonStyle,
  ComponentType,
  MessageFlags,
  type APIActionRowComponent,
  type APIStringSelectComponent,
} from "@discordjs/core";
import { CustomId } from "@/utils/customId-store";
import { fetchSkyData, NonCollectibles } from "@/planner";
import { SpiritTreeHelper, type ISpirit, type IItem } from "skygame-data";

export default defineButton({
  data: {
    name: "spirit_collectible",
  },
  id: CustomId.SpiritCollectible,
  async execute(interaction, _t, helper, { spirit: value }) {
    const data = await fetchSkyData(helper.client);
    const spirit = data.guids.get(value) as ISpirit | undefined;

    const collectibles = SpiritTreeHelper.getItems(spirit?.tree).filter((item) => !NonCollectibles.includes(item.type));

    if (!spirit || !collectibles?.length) {
      return void (await helper.reply({
        content: "No collectibles found for this spirit, or something went wrong!",
        flags: 64,
      }));
    }

    const { user } = helper;
    await helper.deferUpdate();
    const orgData = {
      content: interaction.message.content,
      embeds: interaction.message.embeds,
      files: interaction.message.attachments.map((m) => ({
        name: m.filename,
        data: m.url,
      })),
      components: interaction.message.components,
    };

    let index = 1;
    const total = collectibles.length;

    // TODO: perhaps add more nfo, like shhet no, levels, etc..
    const getResponse = () => {
      const d = collectibles[index - 1]!;

      const itemName = d.name;
      const itemIcon = d.emoji;

      const stringSelect: APIActionRowComponent<APIStringSelectComponent> = {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.StringSelect,
            custom_id: helper.client.utils.store.serialize(CustomId.Default, {
              data: "spirit-collectibles-select",
              user: user.id,
            }),
            placeholder: "Collectibles",
            options: collectibles.map((c, i) => ({
              label: c.name,
              value: i.toString(),
              emoji: c.emoji ? helper.client.utils.parseEmoji(c.emoji)! : undefined,
              default: index - 1 === i,
            })),
          },
        ],
      };

      // Build content based on data source
      const contentLines: string[] = [`- **Type**: ${d.type}`];

      const item = d as IItem;
      if (item.group === "SeasonPass") contentLines.push(`- This item was season pass exclusive`);

      // Get images based on planner data
      const imgs = [{ image: (d as IItem).previewUrl, description: d.name }];

      // add dye previews too if present
      if ("dye" in d && d.dye?.previewUrl) imgs.push({ image: d.dye.previewUrl, description: d.name + " Dye" });
      const images = (imgs ?? []).filter((img: any) => img.image);

      const comp = container(
        section(
          thumbnail(
            helper.client.rest.cdn.emoji(helper.client.utils.parseEmoji(itemIcon ?? "1424103034371313924")!.id!),
            itemName,
          ),
          `-# ${spirit.name} Collectibles (${index}/${total})\n### [${helper.client.utils.formatEmoji(itemIcon)} ${itemName || d.type}](https://sky-children-of-the-light.fandom.com/wiki/${spirit.name
            .split(" ")
            .join("_")}#${(d.type ?? itemName).split(" ").join("_")})`,
        ),
        separator(),
        textDisplay(contentLines.filter(Boolean).join("\n")),
        ...(images.length
          ? [
              separator(),
              textDisplay("**Preview**"),
              mediaGallery(images.map((img: any) => mediaGalleryItem(img.image, { description: img.description }))),
            ]
          : []),
        separator(),
        stringSelect,
        {
          type: 1,
          components: [
            {
              type: ComponentType.Button,
              custom_id: helper.client.utils.store.serialize(CustomId.Default, { data: "collectibles-back", user: user.id }),
              label: "Back",
              emoji: helper.client.utils.parseEmoji(spirit.emoji ?? "<:spiritIcon:1206501060303130664>")!,
              style: ButtonStyle.Danger,
            },
          ],
        },
      );

      return { components: [comp], flags: MessageFlags.IsComponentsV2 };
    };

    const message = await helper.editReply(getResponse());

    const collector = helper.client.componentCollector({
      filter: (i) =>
        ["spirit-collectibles-select", "collectibles-back"].includes(
          // @ts-expect-error data is present but i dont wanna do check ll
          helper.client.utils.store.deserialize(i.data.custom_id).data.data,
        ) && (i.member?.user ?? i.user)!.id === user.id,
      message,
      idle: 60_000,
    });

    collector.on("collect", async (int) => {
      const { id, data: v } = helper.client.utils.store.deserialize(int.data.custom_id);
      const compHelper = new InteractionHelper(int, helper.client);
      if (id !== CustomId.Default) {
        await compHelper.editReply({ content: compHelper.t("commands:GUIDES.RESPONSES.INVALID-CHOICE") });
        return;
      }
      await compHelper.deferUpdate();
      switch (v.data) {
        case "spirit-collectibles-select": {
          if (!compHelper.isStringSelect(int)) return;
          index = parseInt(int.data.values[0]!) + 1;
          await compHelper.editReply(getResponse());
          break;
        }
        case "collectibles-back": {
          collector.stop("Collectible Back");
          await compHelper.editReply(orgData);
        }
      }
    });

    collector.on("end", async (_col, reason) => {
      if (reason === "Collectible Back") return;
      await helper.editReply(orgData).catch(() => {});
    });
  },
});
