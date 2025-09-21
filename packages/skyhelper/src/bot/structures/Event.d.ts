import type { MappedEvents } from "@discordjs/core";
import type { SkyHelper } from "./Client.ts";
import type { Awaitable } from "@/@types/utils.ts";

export type Event<TEvent extends keyof MappedEvents = keyof MappedEvents> = (
  client: SkyHelper,
  ...args: MappedEvents[TEvent]
) => Awaitable<void>;
