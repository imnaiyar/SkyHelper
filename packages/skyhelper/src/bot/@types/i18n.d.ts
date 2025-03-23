import type common from "@skyhelperbot/constants/locales/en-US/common.json";
import type errors from "@skyhelperbot/constants/locales/en-US/errors.json";
import type commands from "@skyhelperbot/constants/locales/en-US/commands.json";
import type features from "@skyhelperbot/constants/locales/en-US/features.json";
import type buttons from "@skyhelperbot/constants/locales/en-US/buttons.json";

// recursive type for nested keys with namespace
type RecursiveKeyOf<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: TObj[TKey] extends object ? `${TKey}.${RecursiveKeyOf<TObj[TKey]>}` : `${TKey}`;
}[keyof TObj & (string | number)];

// type for each namespace
type CommonKeys = `common:${RecursiveKeyOf<typeof common>}`;
type ErrorKeys = `errors:${RecursiveKeyOf<typeof errors>}`;
type CommandKeys = `commands:${RecursiveKeyOf<typeof commands>}`;
type FeatureKeys = `features:${RecursiveKeyOf<typeof features>}`;
type ButtonKeys = `buttons:${RecursiveKeyOf<typeof buttons>}`;

// for default ns (common)
type DefaultNamespaceKeys = RecursiveKeyOf<typeof common>;

export type LangKeys = CommonKeys | ErrorKeys | CommandKeys | FeatureKeys | ButtonKeys | DefaultNamespaceKeys;
