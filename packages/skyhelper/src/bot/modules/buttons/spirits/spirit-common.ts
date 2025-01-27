import type { Button } from "@/structures";
import Utils from "@/utils/classes/Utils";
import { ButtonStyle, type APIButtonComponent } from "@discordjs/core";

export default {
  data: {
    name: "spirit_common",
  },
  async execute(interaction, t, helper) {
    const { client } = helper;
    const { type, spirit } = client.utils.parseCustomId(interaction.data.custom_id)!,
      data = client.spiritsData[spirit];
    if (!data || !("ts" in data)) {
      return void (await helper.reply({ content: "Something went wrong! No data found", flags: 64 }));
    }
    await helper.deferUpdate();

    const { user } = helper;
    const message = interaction.message,
      embed = { ...message.embeds[0] },
      // Index for when the spirit embed/row is built from guides command (where the first row is select menu of spirits and not a button, we only need to change the buttons, specifically the first button)
      index = message.components!.length > 1 ? 1 : 0,
      newRow = { ...message.components![index] };

    // Change the first button in the row according to the selected type
    newRow.components[0] = type === "tree" ? commonBtn("location", spirit, user.id) : commonBtn("tree", spirit, user.id);

    // Change the last field in the embed according to the selected type
    embed.fields![embed.fields!.length - 1] =
      type === "tree"
        ? {
            name: data.ts?.returned
              ? t("features:SPIRITS.TREE_TITLE", { CREDIT: data.tree!.by })
              : t("features:SPIRITS.SEASONAL_CHART", { CREDIT: data.tree!.by }),
            value: data
              .tree!.total.replaceAll(":RegularCandle:", "<:RegularCandle:1207793250895794226>")
              .replaceAll(":RegularHeart:", "<:regularHeart:1207793247792013474>")
              .replaceAll(":AC:", "<:AscendedCandle:1207793254301433926>"),
            inline: false,
          }
        : {
            name: t("features:SPIRITS.LOCATION_TITLE", { CREDIT: data.location!.by }),
            value: data.location?.description || " ",
            inline: false,
          };

    let url = type === "tree" ? data.tree!.image : data.location!.image;
    if (!url!.startsWith("https://")) url = client.config.CDN_URL + "/" + url;
    embed.image = { url };
    await helper.editReply({
      embeds: [embed],
      components: [...(index === 1 ? [message.components![0]] : []), newRow],
    });
  },
} satisfies Button;

const commonBtn = (type: "location" | "tree", spirit: string, user: string): APIButtonComponent => ({
  type: 2,
  custom_id: Utils.encodeCustomId({ id: `spirit_common`, type, spirit, user }),
  label: type === "location" ? "Location" : "Friendship Tree",
  style: ButtonStyle.Secondary,
});
