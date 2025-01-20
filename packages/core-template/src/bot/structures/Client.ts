import type { If } from "../@types/utils.js";
import { Collection } from "@discordjs/collection";
import {
  Client,
  type APIChannel,
  type APIGuild,
  type APIGuildMember,
  type APIUser,
  type GatewayGuildCreateDispatch,
  type GatewayGuildCreateDispatchData,
} from "@discordjs/core";
import type { Command } from "./Command.js";

export class SkyHelper<IsReady extends boolean = true> extends Client {
  /** Set of unavailable guilds recieved when client first became ready */
  public unavailableGuilds: Set<string> = new Set();

  /** Collection of guilds the bot is in */
  public guilds: Collection<string, GatewayGuildCreateDispatchData & { clientMember: APIGuildMember }> = new Collection();

  public user: If<IsReady, APIUser> = null as unknown as If<IsReady, APIUser>;

  /** Collection of channels available to the client */
  public channels: Collection<string, APIChannel> = new Collection();

  public commands: Collection<string, Command> = new Collection();
}
