import type { Button } from "#structures";
import {
  ActionRowBuilder,
  type APIActionRowComponent,
  type APIButtonComponent,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";

export default {
  data: {
    name: "spirit_common",
  },
  async execute(interaction, t, client) {
    const [, type, value] = interaction.customId.split("-"),
      data = client.spiritsData[value];
    if (!data || !("ts" in data)) {
      return void (await interaction.reply({ content: "Something went wrong! No data found", ephemeral: true }));
    }
    await interaction.deferUpdate();

    const message = interaction.message,
      embed = EmbedBuilder.from(message.embeds[0]),
      // Index for when the spirit embed/row is built from guides command (where the first row is select menu of spirits and not a button, we only need to change the buttons, specifically the first button)
      index = message.components.length > 1 ? 1 : 0,
      newRow = ActionRowBuilder.from<ButtonBuilder>(message.components[index] as APIActionRowComponent<APIButtonComponent>);

    // Change the first button in the row according to the selected type
    newRow.components[0] = type === "tree" ? commonBtn("location", value) : commonBtn("tree", value);

    // Change the last field in the embed according to the selected type
    embed.spliceFields(
      -1,
      1,
      type === "tree"
        ? {
            name: data.ts?.returned
              ? t("SPIRITS.TREE_TITLE", { CREDIT: data.tree!.by })
              : t("SPIRITS.SEASONAL_CHART", { CREDIT: data.tree!.by }),
            value: data
              .tree!.total.replaceAll(":RegularCandle:", "<:RegularCandle:1207793250895794226>")
              .replaceAll(":RegularHeart:", "<:regularHeart:1207793247792013474>")
              .replaceAll(":AC:", "<:AscendedCandle:1207793254301433926>"),
          }
        : {
            name: t("SPIRITS.LOCATION_TITLE", { CREDIT: data.location!.by }),
            value: data.location?.description || " ",
          },
    );
    embed.setImage(client.config.CDN_URL + "/" + (type === "tree" ? data.tree!.image : data.location!.image));
    await interaction.editReply({
      embeds: [embed],
      components: [...(index === 1 ? [message.components[0]] : []), newRow],
    });
  },
} satisfies Button;

const commonBtn = (type: "location" | "tree", value: string) =>
  new ButtonBuilder()
    .setCustomId(`spirit_common-${type}-` + value)
    .setLabel(type === "location" ? "Location" : "Friendship Tree")
    .setStyle(ButtonStyle.Secondary);
