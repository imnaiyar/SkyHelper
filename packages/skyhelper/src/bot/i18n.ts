import i18next from "i18next";
import Backend, { type FsBackendOptions } from "i18next-fs-backend";
import type { LangKeys } from "./@types/i18n.js";

await i18next.use(Backend).init<FsBackendOptions>({
  cleanCode: true,
  lng: "en-US",
  fallbackLng: "en-US",
  ns: ["common", "errors", "commands", "features", "buttons"],
  defaultNS: "common",
  backend: {
    loadPath: "node_modules/@skyhelperbot/constants/locales/{{lng}}/{{ns}}.json",
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
