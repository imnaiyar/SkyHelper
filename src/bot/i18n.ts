import i18next from "i18next";
import Backend from "i18next-fs-backend";
import type en from "#root/locales/en-US.json";

type NestedKeys<T> = {
  [K in keyof T & (string | number)]: T[K] extends Record<string, any> ? `${K}` | `${K}.${NestedKeys<T[K]>}` : `${K}`;
}[keyof T & (string | number)];
export type langKeys = NestedKeys<typeof en>;

// @ts-ignore
await i18next.use(Backend).init({
  cleanCode: true,
  lng: "en-US",
  fallbackLng: "en-US",
  backend: {
    loadPath: "locales/{{lng}}.json",
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
  (key: langKeys, options = {}) =>
    i18next.t(key, { ...options, lng: lang });
