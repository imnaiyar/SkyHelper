import { GatewayDispatchEvents } from "@discordjs/core";
import type { Event } from "../structures/Event.js";

const readyHandler: Event<GatewayDispatchEvents.Ready> = (client, { data }) => {
  for (const guild of data.guilds) {
    client.unavailableGuilds.add(guild.id);
  }
  console.log(`Ready`);
};

export default readyHandler;
