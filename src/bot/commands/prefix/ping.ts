import type { PrefixCommand, SkyHelper } from "#structures";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export default {
  data: {
    name: "ping",
    description: "Replies with pong!",
    aliases: ["pong"],
  },
  async execute({ message }) {
    const client = message.client as SkyHelper;
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId("ping").setLabel("Refresh").setStyle(ButtonStyle.Primary),
    );
    message.reply({ content: "Pong! " + client.ws.ping.toString() + "ms", components: [row] });
  },
} satisfies PrefixCommand;
