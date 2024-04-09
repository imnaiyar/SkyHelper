import { Message } from 'discord.js';
import { type SkyHelper } from './SkyHelper';
import { type Permission } from 'skyhelper-utils/dist/utils/parsePerms';
/* eslint-disable */

export interface Validation {
    message: string;
    callback(msg: Message): boolean
}

export type PrefixCommand = {
    data: {
        name: string,
        description: string,
        flags?: string[],
        aliases?: string[],
        category?: string,
        userPermissions?: Permission[],
        botPermissions?: Permission[],
        validations?: Validation[]
    },
    execute: (interaction: Message, client: SkyHelper) => void
}