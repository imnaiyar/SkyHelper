import type { Command } from "@/structures/Command";

export default {
  name: "help",
  description: "help command",
  category: "Info",
  interactionRun({ interaction, api }) {
    api.interactions.reply(interaction.id, interaction.token, {
      content: "Hi",
    });
  },
} satisfies Command;
