import type { SpiritsData } from "@skyhelperbot/constants/spirits-datas";
import { MessageFlags } from "@discordjs/core";
import { Spirits } from "@/utils/classes/Spirits";
import type { Command } from "@/structures";
import { SPIRTIS_DATA } from "@/modules/commands-data/guide-commands";
export default {
  async interactionRun({ t, helper, options }) {
    await helper.defer({ flags: options.getBoolean("hide") ? MessageFlags.Ephemeral : undefined });
    const value = options.getString("search");
    const data = helper.client.spiritsData[value as keyof typeof helper.client.spiritsData] as SpiritsData;

    if (!data) {
      await helper.editReply({
        content: t("commands:SPIRITS.RESPONSES.NO_DATA", {
          VALUE: value,
          COMMAND: `</utils contact-us:${helper.client.applicationCommands.find((c) => c.name === "utils")!.id}>`,
        }),
      });
      return;
    }
    const manager = new Spirits(data, t, helper.client);
    const btns = manager.getButtons(helper.user.id);
    await helper.editReply({
      embeds: [manager.getEmbed()],
      ...(btns.components?.length && { components: [btns] }),
    });
  },

  async autocomplete({ helper, options }) {
    const focused = options.getFocusedOption() as { value: string };
    const data = Object.entries(helper.client.spiritsData)
      .filter(([, v]) => v.name.toLowerCase().includes(focused.value.toLowerCase()))
      .map(([k, v]) => ({
        name: `↪️ ${v.name}`,
        value: k,
      }));
    await helper.respond({ choices: data.slice(0, 25) });
  },
  ...SPIRTIS_DATA,
} satisfies Command<true>;
