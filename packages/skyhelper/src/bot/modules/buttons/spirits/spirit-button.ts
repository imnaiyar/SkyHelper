import { defineButton } from "@/structures";
import { Spirits } from "@/utils/classes/Spirits";
import { CustomId } from "@/utils/customId-store";
import type { SpiritsData } from "@skyhelperbot/constants/spirits-datas";
import { row } from "@skyhelperbot/utils";
import { MessageFlags } from "discord-api-types/v10";

export default defineButton({
  data: { name: "spirit_info_button" },
  id: CustomId.SpiritButton,
  async execute(interaction, t, helper, { spirit_key }) {
    const data = helper.client.spiritsData[spirit_key];

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

    const message = await helper
      .update({
        components: [
          manager.getResponseEmbed(helper.user.id),
          row({
            type: 2,
            custom_id: helper.client.utils.store.serialize(CustomId.Default, {
              user: helper.user.id,
              data: "spirit-button-back",
            }),
            label: "Back",
            style: 4,
          }),
        ],
        flags: MessageFlags.IsComponentsV2,
      })
      .then((m) => m.resource!.message!);

    const collector = helper.client.componentCollector({ idle: 60_000, message, userId: helper.user.id });

    collector.on("collect", async (int) => {
      const { id, data: d } = helper.client.utils.store.deserialize(int.data.custom_id);
      if (id !== CustomId.Default || d.data !== "spirit-button-back") return;

      await helper.client.api.interactions.updateMessage(int.id, int.token, {
        components: interaction.message.components!,
      });
      collector.stop();
    });
  },
});
