import { MessageFlags } from "@discordjs/core";
import { LINKED_ROLE_DATA } from "../../commands-data/utility-commands.js";
import type { Command } from "@/structures";
import { container, mediaGallery, mediaGalleryItem, textDisplay, separator } from "@skyhelperbot/utils";
export default {
  ...LINKED_ROLE_DATA,
  async interactionRun({ helper, options }) {
    let flags = MessageFlags.IsComponentsV2;
    if (options.getBoolean("hide")) {
      flags |= 64;
    }
    const components = [
      container(
        textDisplay(helper.t("features:linked-role.INTRO")),
        mediaGallery(mediaGalleryItem("https://docs.skyhelper.xyz/linked-role/linked-role-profile.jpg")),
        separator(true, 1),
        textDisplay(helper.t("features:linked-role.GUIDES")),
        separator(true, 1),
        textDisplay(helper.t("features:linked-role.NAVIGATE")),
      ),
    ];

    await helper.reply({
      components,
      flags,
    });
  },
} satisfies Command;
