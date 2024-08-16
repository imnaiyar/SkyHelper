import { ClientEvents } from "discord.js";
import { SkyHelper } from "./SkyHelper.js";
export interface Event<T extends keyof ClientEvents> {
  (client: SkyHelper, ...args: ClientEvents[T]): Promise<void>;
}
