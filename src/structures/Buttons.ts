import { ButtonInteraction } from 'discord.js';
import { type SkyHelper } from './SkyHelper';
/* eslint-disable */
export type Button = {
    data: {
        name: string
    },
    execute: (interaction: ButtonInteraction, client: SkyHelper) => void,
}