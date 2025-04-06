import type { Button } from "@/structures";
import Utils from "@/utils/classes/Utils";
import { emojis } from "@/utils/constants";
import { mediaGallery, textDisplay } from "@/utils/v2";
import { ButtonStyle, type APIActionRowComponent, type APIButtonComponent, type APIContainerComponent } from "@discordjs/core";

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
    const message = interaction.message;
    const components = [...message.components!] as APIContainerComponent[];
    // Update the button row, 9th in the array
    const buttonRow = { ...components[0].components[8] } as APIActionRowComponent<APIButtonComponent>;

    buttonRow.components.splice(0, 1, commonBtn(type === "location" ? "tree" : "location", spirit, user.id));
    components[0].components.splice(8, 1, buttonRow);

    // Update the the media gallery and text (6, 5th in array respec.)
    const text =
      type === "tree"
        ? `**${
            data.ts?.returned
              ? t("features:SPIRITS.TREE_TITLE", { CREDIT: data.tree!.by })
              : t("features:SPIRITS.SEASONAL_CHART", { CREDIT: data.tree!.by })
          }**\n${emojis.tree_end}${data
            .tree!.total.replaceAll(":RegularCandle:", "<:RegularCandle:1207793250895794226>")
            .replaceAll(":RegularHeart:", "<:regularHeart:1207793247792013474>")
            .replaceAll(":AC:", "<:AscendedCandle:1207793254301433926>")}`
        : `**${t("features:SPIRITS.LOCATION_TITLE", { CREDIT: data.location!.by })}**\n${
            data.location?.description ? `${emojis.tree_end}${data.location.description}` : ""
          }`;
    let url = type === "tree" ? data.tree!.image : data.location!.image;
    if (!url!.startsWith("https://")) url = client.config.CDN_URL + "/" + url;
    components[0].components.splice(
      5,
      2,
      // Random id, as it is getting duplicated when going back and forth since the one from api gets modified ig, idk really
      // But this fixes it so...
      { ...textDisplay(text), id: 64 },
      { ...mediaGallery({ media: { url }, description: "${type}" }), id: 75 },
    );

    await helper.editReply({
      components,
    });
  },
} satisfies Button;

const commonBtn = (type: "location" | "tree", spirit: string, user: string): APIButtonComponent => ({
  type: 2,
  custom_id: Utils.encodeCustomId({ id: `spirit_common`, type, spirit, user }),
  label: type === "location" ? "Location" : "Friendship Tree",
  id: 27,
  style: ButtonStyle.Secondary,
});
