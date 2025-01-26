import type { Button } from "@/structures";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import {
  ButtonStyle,
  ComponentType,
  type APIActionRowComponent,
  type APIButtonComponent,
  type APIEmbed,
  type APIStringSelectComponent,
} from "@discordjs/core";

export default {
  data: {
    name: "spirit_collectible",
  },
  async execute(interaction, _t, helper) {
    const { spirit: value } = helper.client.utils.parseCustomId(interaction.data.custom_id);
    const data = helper.client.spiritsData[value];
    if (!data || !data.collectibles?.length) {
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
    let imageIndex = 1;
    const total = collectibles.length;
    const getResponse = () => {
      const d = collectibles[index - 1];
      const imageTotal = d.images.length;
      const stringSelect: APIActionRowComponent<APIStringSelectComponent> = {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.StringSelect,
            custom_id: helper.client.utils.encodeCustomId({ id: "spirit_collectibles_select", user: user.id }),
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
      const btns: APIActionRowComponent<APIButtonComponent> = {
        type: ComponentType.ActionRow,
        components: [
          ...(imageTotal && imageTotal > 1
            ? [
                {
                  type: ComponentType.Button as const,
                  custom_id: helper.client.utils.encodeCustomId({ id: "collectible_image_prev", user: user.id }),
                  label: "◀️ " + d.images[imageIndex === 1 ? 0 : imageIndex - 2].description,
                  disabled: imageIndex === 1,
                  style: ButtonStyle.Success as const,
                },
              ]
            : []),
          {
            type: ComponentType.Button as const,
            custom_id: helper.client.utils.encodeCustomId({ id: "collectibles_back", user: user.id }),
            label: "Back",
            emoji: helper.client.utils.parseEmoji(data.expression?.icon || "<:spiritIcon:1206501060303130664>")!,
            style: ButtonStyle.Danger as const,
          },
          ...(imageTotal && imageTotal > 1
            ? [
                {
                  type: ComponentType.Button as const,
                  custom_id: helper.client.utils.encodeCustomId({ id: "collectible_image_next", user: user.id }),
                  label: d.images[imageIndex >= imageTotal ? imageTotal - 1 : imageIndex].description + " ▶️",
                  disabled: imageIndex === imageTotal,
                  style: ButtonStyle.Success as const,
                },
              ]
            : []),
        ],
      };

      const embed: APIEmbed = {
        title: `${d.icon} ${d.name || d.type}`,
        url: `https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}#${(d.type ? d.type : d.name).split(" ").join("_")}`,
        author: { name: `${data.name} Collectibles (${index}/${total})`, icon_url: data.image },
        thumbnail: {
          url: helper.client.rest.cdn.emoji(helper.client.utils.parseEmoji(d.icon)!.id),
        },
        description: [
          d.type ? `- **Type**: ${d.type}` : "",
          d.price ? `- **Cost**: ${d.price}` : "",
          d.spPrice ? `- **Season Cost**: ${d.spPrice}` : "",
          d.isSP ? `- This item was season pass exclusive` : "",
          d.notes?.length ? "\n**Notes**:\n" + d.notes.map((n) => `-# - ${n}`).join("\n") + "\n" : "",
          imageTotal
            ? `\n**${d.images[imageIndex - 1].description}**${imageTotal > 1 ? ` (${imageIndex}/${imageTotal})` : ""}`
            : "",
        ]
          .filter(Boolean)
          .join("\n"),
        ...(imageTotal && { image: { url: d.images[imageIndex - 1].image } }),
      };

      return { embeds: [embed], components: [stringSelect, btns] };
    };
    const message = await helper.editReply(getResponse());
    const collector = helper.client.componentCollector({
      filter: (i) =>
        ["spirit_collectibles_select", "collectible_image_next", "collectibles_back", "collectible_image_prev"].includes(
          helper.client.utils.parseCustomId(i.data.custom_id)!.id,
        ) && (i.member?.user || i.user)!.id === user.id,
      message,
      idle: 60_000,
    });
    collector.on("collect", async (int) => {
      const ID = helper.client.utils.parseCustomId(int.data.custom_id)!.id;
      const compHelper = new InteractionHelper(int, helper.client);
      await compHelper.deferUpdate();
      switch (ID) {
        case "spirit_collectibles_select": {
          if (!compHelper.isStringSelect(int)) return;
          index = parseInt(int.data.values[0]) + 1;
          imageIndex = 1;
          await compHelper.editReply(getResponse());
          break;
        }
        case "collectible_image_next": {
          imageIndex++;
          await compHelper.editReply(getResponse());
          break;
        }
        case "collectible_image_prev": {
          imageIndex--;
          await compHelper.editReply(getResponse());
          break;
        }
        case "collectibles_back": {
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
} satisfies Button;
