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

export default defineButton({
  data: {
    name: "spirit_collectible",
  },
  id: CustomId.SpiritCollectible,
  async execute(interaction, _t, helper, { spirit: value }) {
    const data = helper.client.spiritsData[value];
    if (!data?.collectibles?.length) {
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
    const collectibles = data.collectibles;
    let index = 1;
    const total = collectibles.length;
    const getResponse = () => {
      const d = collectibles[index - 1];
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
              emoji: helper.client.utils.parseEmoji(c.icon)!,
              default: index - 1 === i,
            })),
          },
        ],
      };
      const comp = container(
        section(
          thumbnail(helper.client.rest.cdn.emoji(helper.client.utils.parseEmoji(d.icon)!.id), d.name),
          `-# ${data.name} Collectibles (${index}/${total})\n### [${d.icon} ${d.name || d.type}](https://sky-children-of-the-light.fandom.com/wiki/${data.name
            .split(" ")
            .join("_")}#${(d.type ?? d.name).split(" ").join("_")})`,
        ),
        separator(),
        textDisplay(
          [
            d.type ? `- **Type**: ${d.type}` : "",
            d.price ? `- **Cost**: ${d.price}` : "",
            d.spPrice ? `- **Season Cost**: ${d.spPrice}` : "",
            d.isSP ? `- This item was season pass exclusive` : "",
            d.notes?.length ? "\n**Notes**:\n" + d.notes.map((n) => `-# - ${n}`).join("\n") + "\n" : "",
          ]
            .filter(Boolean)
            .join("\n"),
        ),
        ...(d.images.length
          ? [
              separator(),
              textDisplay("**Preview**"),
              mediaGallery(d.images.map((img) => mediaGalleryItem(img.image, { description: img.description }))),
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
              emoji: helper.client.utils.parseEmoji(data.expression?.icon ?? "<:spiritIcon:1206501060303130664>")!,
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
          helper.client.utils.store.deserialize(i.data.custom_id)!.data.data,
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
          index = parseInt(int.data.values[0]) + 1;
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
