import { seasonsData } from "@skyhelperbot/constants";
import type { Command } from "@/structures";
import { handleSeasional } from "./sub/handleSeasional.js";
import { handleRealms } from "./sub/handleRealms.js";
import { GUIDES_DATA } from "@/modules/commands-data/guide-commands";
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

    if (sub === "seasonal" && focusedValue.name === "season") {
      // EmojisMap contain all the season name, so get it from there
      const choices = Object.entries(seasonsData).filter(([, v]) =>
        v.name.toLowerCase().includes((focusedValue.value as string).toLowerCase()),
      );
      await helper.respond({
        choices: choices.map(([k, v]) => ({
          name: `↪️ Season of ${v.name}`,
          value: k,
        })),
      });
    }
  },
  ...GUIDES_DATA,
} satisfies Command<true>;
