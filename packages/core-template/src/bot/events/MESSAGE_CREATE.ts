import type { Event } from "@/structures";
import type { GatewayDispatchEvents } from "@discordjs/core";

const messageHandler: Event<GatewayDispatchEvents.MessageCreate> = (client, { data: message }) => {};
export default messageHandler;
