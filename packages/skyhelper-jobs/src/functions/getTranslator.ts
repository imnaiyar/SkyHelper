import i18next from "i18next";
import Backend, { type FsBackendOptions } from "i18next-fs-backend";
import type common from "../../locales/en-US/common.json";
import type errors from "../../locales/en-US/errors.json";
import type commands from "../../locales/en-US/commands.json";
import type features from "../../locales/en-US/features.json";
import type buttons from "../../locales/en-US/buttons.json";
type AllNamespaces = {
  common: typeof common;
  errors: typeof errors;
  features: typeof features;
  commands: typeof commands;
  buttons: typeof buttons;
};
type NestedKeys<T> = {
  [K in keyof T & (string | number)]: T[K] extends Record<string, any> ? `${K}` | `${K}.${NestedKeys<T[K]>}` : `${K}`;
}[keyof T & (string | number)];

export type LangKeys = {
  [N in keyof AllNamespaces]: `${N}:${NestedKeys<AllNamespaces[N]>}`;
}[keyof AllNamespaces];

await i18next.use(Backend).init<FsBackendOptions>({
  cleanCode: true,
  lng: "en-US",
  fallbackLng: "en-US",
  ns: ["common", "errors", "commands", "features", "buttons"],
  defaultNS: "common",
  backend: {
    loadPath: "locales/{{lng}}/{{ns}}.json",
  },
  interpolation: {
    escapeValue: false,
  },
  returnEmptyString: false,
  preload: ["en-US", "hi", "ru", "ja"],
  supportedLngs: ["en-US", "hi", "ru", "ja"],
  saveMissing: true,
  missingKeyHandler: (_lngs, _ns, _key, _fallbackValue) => {
    throw new Error(`Translation key invalid: ${_key}`);
  },
});
export const getTranslator =
  (lang: string) =>
  (key: LangKeys, options = {}) =>
    i18next.t(key, { ...options, lng: lang });
