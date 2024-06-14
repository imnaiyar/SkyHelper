import i18next from "i18next";
import Backend from "i18next-fs-backend";

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
  preload: ["en-US", "hi", "ru"],
  supportedLngs: ["en-US", "hi", "ru"],
});
export const getTranslator =
  (lang: string) =>
  (key: string, options = {}) =>
    i18next.t(key, { ...options, lng: lang });
