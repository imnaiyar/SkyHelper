import { defineButton } from "@/structures";
import { Spirits } from "@/utils/classes/Spirits";
import { CustomId } from "@/utils/customId-store";
import type { SpiritsData } from "@skyhelperbot/constants/spirits-datas";
import { MessageFlags } from "discord-api-types/v10";

export default defineButton({
  data: { name: "spirit_info_button" },
  id: CustomId.SpiritButton,
  async execute(interaction, t, helper, { spirit_key }) {
    const data = helper.client.spiritsData[spirit_key as keyof typeof helper.client.spiritsData] as SpiritsData;

    if (!data) {
      await helper.reply({
        content: t("commands:SPIRITS.RESPONSES.NO_DATA", {
          VALUE: spirit_key,
          COMMAND: `</utils contact-us:${helper.client.applicationCommands.find((c) => c.name === "utils")!.id}>`,
        }),
      });
      return;
    }
    const manager = new Spirits(data, t, helper.client);

    await helper.update({
      components: [manager.getResponseEmbed(helper.user.id)],
      flags: MessageFlags.IsComponentsV2,
    });
  },
});
