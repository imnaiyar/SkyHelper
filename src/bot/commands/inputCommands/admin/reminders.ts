import { REMINDERS_DATA } from "#bot/commands/commands-data/admin-commands";
import type { Command } from "#structures";

export default {
  ...REMINDERS_DATA,
  interactionRun: async (int, t, client) => {
    const type = int.options.getString("type", true);
    const channel = int.options.getChannel("channel");
    const role = int.options.getRole("role", false);
  },
} satisfies Command;
