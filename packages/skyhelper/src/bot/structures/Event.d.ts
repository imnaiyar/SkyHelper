import type { ClientEvents } from "discord.js";
import type { SkyHelper } from "./SkyHelper.ts";
export interface Event<T extends keyof ClientEvents> {
  (client: SkyHelper, ...args: ClientEvents[T]): Promise<void>;
}
