import type common from "@skyhelperbot/constants/locales/en-US/common.json";
import type errors from "@skyhelperbot/constants/locales/en-US/errors.json";
import type commands from "@skyhelperbot/constants/locales/en-US/commands.json";
import type features from "@skyhelperbot/constants/locales/en-US/features.json";
import type buttons from "@skyhelperbot/constants/locales/en-US/buttons.json";
import type { APIGuildMember } from "@discordjs/core";
export type AllNamespaces = {
  common: typeof common;
  errors: typeof errors;
  features: typeof features;
  commands: typeof commands;
  buttons: typeof buttons;
};
export type NestedKeys<T> = {
  [K in keyof T & (string | number)]: T[K] extends Record<string, any> ? `${K}` | `${K}.${NestedKeys<T[K]>}` : `${K}`;
}[keyof T & (string | number)];

export type LangKeys = {
  [N in keyof AllNamespaces]: `${N}:${NestedKeys<AllNamespaces[N]>}`;
}[keyof AllNamespaces];

export interface APIChatInputApplicationCommandInteraction {
  clientMember: APIGuildMember;
}
