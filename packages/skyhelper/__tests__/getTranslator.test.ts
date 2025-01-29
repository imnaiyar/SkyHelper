import { getTranslator } from "../src/bot/i18n.js";

describe("getTranslator", () => {
  it("should return the translated string for a given key and language", () => {
    const translator = getTranslator("en-US");
    const translation = translator("common:bot.intro");

    expect(translation).toMatch("That's me...");
  });

  it("should throw an error if translation key is not found", () => {
    const translator = getTranslator("en-US");
    // @ts-expect-error
    expect(() => translator("common:nonexistentKey")).toThrow("Translation key invalid: nonexistentKey");
  });

  it("should return the translated string with interpolation values", () => {
    const translator = getTranslator("en-US");
    const translatedString = translator("errors:ERROR_ID", { ID: "123456" });

    expect(translatedString).toBe("Error ID: `123456`");
  });

  it("should return the translated string for a different language", () => {
    const translatorHi = getTranslator("hi");
    const translatorRu = getTranslator("ru");
    const translatedStringHi = translatorHi("common:bot.intro");
    const translatedStringRu = translatorRu("common:bot.intro");

    expect(translatedStringHi).toMatch("यह में हूं...");
    expect(translatedStringRu).toMatch("Это я...");
  });
});
