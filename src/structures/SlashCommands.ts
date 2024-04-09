import { ChatInputCommandInteraction, AutocompleteInteraction, ApplicationCommandOption, PermissionResolvable, PermissionFlagsBits } from 'discord.js';
import { type SkyHelper } from './SkyHelper';


/* eslint-disable */
export enum IntegrationTypes {
  Guilds = 0,
  Users = 1
}

export enum ContextTypes {
    Guild = 0,
    BotDM = 1,
    PrivateChannels = 2
}
type Perm = keyof typeof PermissionFlagsBits;
export interface SlashCommand {
    data: {
        name: string,
        description: string,
        options?: ApplicationCommandOption[],
        type?: number,
        integration_types?: IntegrationTypes[],
        contexts?: ContextTypes[],
        userPermissions?: Perm[],
        botPermissions?: PermissionResolvable[],
        dm_permission?: boolean
    },
    
    execute: (interaction: ChatInputCommandInteraction, client: SkyHelper) => void,
    autocomplete?: (interaction: AutocompleteInteraction, client: SkyHelper) => void
}