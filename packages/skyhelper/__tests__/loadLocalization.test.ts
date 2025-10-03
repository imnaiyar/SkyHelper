import type { LocalizationMap } from "@discordjs/core";
import { describe, expect, it } from "vitest";
import { supportedLang } from "@skyhelperbot/constants";
import { loadLocalization } from "../src/bot/utils/loaders.js";
const l = supportedLang.map((lang) => lang.value);

describe("useTranslations", () => {
  it("should return the correct translation for a given key", () => {
    const translations = loadLocalization("common:bot.intro");
    const translationsTyped: LocalizationMap = translations;
    expect(translationsTyped).toBeDefined();
    expect(typeof translationsTyped).toBe("object");

    for (const key of Object.keys(translationsTyped)) {
      expect(l).toContain(key);
      expect(typeof translationsTyped[key as (typeof l)[number]]).toBe("string");
    }
  });

  it("should throw an error if the translation key is not valid", () => {
    expect(() => {
      // @ts-expect-error - useTranslations is intentionally undefined to assert failure
      useTranslations("common:nonexistent.key");
    }).toThrow();
  });
});
