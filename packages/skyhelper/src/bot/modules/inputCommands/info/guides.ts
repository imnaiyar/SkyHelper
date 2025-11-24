import type { Command } from "@/structures";
import { handleSeasional } from "./sub/handleSeasional.js";
import { handleRealms } from "./sub/handleRealms.js";
import { GUIDES_DATA } from "@/modules/commands-data/guide-commands";
import { fetchSkyData } from "@/planner";
export default {
  async interactionRun({ helper, options }) {
    const sub = options.getSubcommand();
    await helper.defer({ flags: options.getBoolean("hide") ? 64 : undefined });
    switch (sub) {
      case "seasonal": {
        await handleSeasional(helper, options);
        break;
      }
      case "realms": {
        await handleRealms(helper, options);
        break;
      }
    }
  },
  async autocomplete({ helper, options }) {
    const focusedValue = options.getFocusedOption();
    const sub = options.getSubcommand();
    const data = await fetchSkyData(helper.client);
    if (sub === "seasonal" && focusedValue.name === "season") {
      await helper.respond({
        choices: data.seasons.items
          .filter((s) => s.name.includes(focusedValue.value as string))
          .map((season) => ({
            name: `↪️ ${season.name}`,
            value: season.guid,
          }))
          .slice(0, 25),
      });
      return;
    }

    if (sub === "realms" && focusedValue.name === "realm") {
      await helper.respond({
        choices: data.realms.items
          .filter((s) => s.name.includes(focusedValue.value as string))
          .map((realm) => ({
            name: `↪️ ${realm.name}`,
            value: realm.guid,
          })),
      });
      return;
    }
  },
  ...GUIDES_DATA,
} satisfies Command<true>;
