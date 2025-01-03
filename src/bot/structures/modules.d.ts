import { getTranslator } from "#bot/i18n";
import * as schemas from "#bot/database/index";
import type config from "#bot/config";
import type { Button, ClassTypes, Command, ContextMenuCommand } from "#structures";
import type { Collection } from "discord.js";
import type { logger } from "#handlers";
import type { spiritsData } from "#bot/libs/index";
import type { UserSession } from "#root/dashboard/utils/discord.js";
/* eslint-disable */
declare module "discord.js" {
  export interface BaseInteraction {
    t(): Promise<ReturnType<typeof getTranslator>>;
  }
  export interface Message {
    t(): Promise<ReturnType<typeof getTranslator>>;
  }
  export interface Client {
    /** Configurations for the bot */
    config: typeof config;

    /** Collection of Slash Commands */
    commands: Collection<string, Command>;

    /** Collection of Context Menu Commands */
    contexts: Collection<string, ContextMenuCommand<"MessageContext" | "UserContext">>;

    /** Collection of Buttons */
    buttons: Collection<string, Button>;

    /** Collection of command cooldowns */
    cooldowns: Collection<string, Collection<string, number>>;

    /** Default timezone used thorughout the client for time-based calculations */
    timezone: string;

    /** get current event Data
     * @example
     * const data = await <Client>.getEvent()
     */
    getEvent: typeof schemas.getEvent;

    /** Collection of utility classes */

    classes: Collection<keyof ClassTypes, ClassTypes[keyof ClassTypes]>;

    /** Database schemas/fuctions */
    database: typeof schemas;

    /**
     * Current Traveling Spirit Data
     * @example
     * const data = await <Client>.getTS()
     */
    getTS: typeof schemas.getTS;

    /** Custom logger */
    logger: typeof logger;

    /** Map of currently active Quiz game data */
    gameData: Collection<string, any>;

    /** Map of emojis */
    emojisMap: Collection<
      string,
      {
        [key: string]: string;
      }
    >;

    /** All the Sky: SCOTL spirits data */
    spiritsData: typeof spiritsData;

    loadModules(): Promise<void>;

    /**
     * Get bot's invite
     */
    getInvite(): string;

    /**
     * @param channel Channel where webhook is to be created
     * @param reason The reason for webhooks creation
     */
    createWebhook(channel: TextChannel, reason: string): Promise<Webhook>;

    /**
     * get commands from client application
     * @param value - command name or id
     */
    getCommand(value: string | number): Promise<ApplicationCommand>;

    /**
     * For Dashboard, validate user perms
     * @param user
     * @param guildID
     */
    checkPermissions(user: UserSession, guildID: string): Promise<void>;

    /**
     * For Dashboard, validate dashboard admin
     * @param user
     */
    checkAdmin(user: UserSession): Promise<void>;

    /**
     * Resolves an application command into a mention
     * @param command The command to mention
     * @param sub Subcoomand if it's subcommand mention
     * @returns The command mentions
     */
    mentionCommand(command: ApplicationCommand, sub?: string): string;
  }
}

declare global {
  interface Array {
    /** Returns a random element from this array */
    random(): this[number];

    /** Returns that last element from this array */
    last(): this[number];
  }
}
