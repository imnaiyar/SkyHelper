import { supportedLang } from "../src/bot/libs/constants/supportedLang.js";
import { useTranslations } from "../src/bot/handlers/useTranslation.js";
const l = supportedLang.map((lang) => lang.value);
type Localizations = Partial<Record<(typeof l)[number], string>>;

describe("useTranslations", () => {
  it("should return the correct translation for a given key", () => {
    const translations = useTranslations("common.bot.intro");

    const translationsTyped: Localizations = translations;
    expect(translationsTyped).toBeDefined();
    expect(typeof translationsTyped).toBe("object");

    for (const key of Object.keys(translationsTyped)) {
      expect(l).toContain(key);
      expect(typeof translationsTyped[key as (typeof l)[number]]).toBe("string");
    }
  });

  it("should return an empty object if the translation key is not found", () => {
    // @ts-expect-error
    const translations = useTranslations("common.nonexistentKey");

    expect(translations).toEqual({});
    expect(Object.keys(translations).length).toBe(0);
  });

  it("should throw an error if the translation value is not a string", () => {
    expect(() => {
      useTranslations("common.bot");
    }).toThrow(TypeError);
  });
});
