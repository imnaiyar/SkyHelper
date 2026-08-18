import type { Command } from "@/structures";
import { handleTimestamp } from "./sub/timestamp.js";
import { getChangelog, getSuggestion } from "./sub/utils.js";
import { UTILS_DATA } from "@/modules/commands-data/utility-commands";
import { fallbackResponse } from "@/utils/interactions";

export default {
  async interactionRun({ helper, options }) {
    const sub = options.getSubcommand();
    switch (sub) {
      case "changelog": {
        await helper.defer();
        const response = await getChangelog();

        if (!response) {
          await fallbackResponse(helper, helper.t("features:utils.NO_CHANGELOG"));
          return;
        }

        await helper.editReply(response);
        break;
      }
      case "contact-us":
        await getSuggestion(helper, options);
        break;
      case "timestamp":
        await handleTimestamp(helper, options);
    }
  },
  async autocomplete({ helper, options }) {
    const sub = options.getSubcommand(true);
    if (sub !== "timestamp") return;
    const focused = options.getFocusedOption();
    if (focused.name !== "timezone") return;
    const timezones = Intl.supportedValuesOf("timeZone");
    timezones.push("Asia/Kolkata");
    await helper.respond({
      choices: timezones
        .filter((tz) => tz.toLowerCase().includes((focused.value as string).toLowerCase()))
        .map((tz) => ({ name: tz === "America/Los_Angeles" ? `${tz} (default)` : tz, value: tz }))
        .slice(0, 25),
    });
  },
  ...UTILS_DATA,
} satisfies Command<true>;
