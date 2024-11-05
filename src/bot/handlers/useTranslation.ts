import type { LangKeys } from "#bot/i18n";
import { supportedLang } from "../libs/constants/supportedLang.js";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const allowed_langs = [
  "id",
  "da",
  "de",
  "en-US",
  "es-419",
  "fr",
  "hr",
  "it",
  "lt",
  "hu",
  "nl",
  "no",
  "pl",
  "pt-BR",
  "ro",
  "fi",
  "sv-SE",
  "vi",
  "ts",
  "cs",
  "el",
  "bg",
  "ru",
  "uk",
  "hi",
  "th",
  "zh-CN",
  "ja",
  "zh-TW",
  "ko",
];

const files = fs.readdirSync("locales");
// Only include allowed and supported langs
const languages = files.filter((f) => allowed_langs.includes(f)).filter((f) => supportedLang.some((l) => l.value === f));
const datas: Record<string, Record<string, any>> = Object.fromEntries(languages.map((l) => [l, {}]));
for (const lg of languages) {
  const namespaces = fs.readdirSync(path.resolve("locales", lg));
  for (const ns of namespaces) {
    const { default: translations } = await import(pathToFileURL(path.resolve("locales", lg, ns)).href, {
      with: { type: "json" },
    });
    datas[lg][ns.replaceAll(".json", "")] = translations;
  }
}
/**
 * Get API compatible localization data for all the available (and allowed) languages
 * @param key translation keys
 * @returns
 */
export function useTranslations(key: LangKeys): Partial<Record<string, string>> {
  const [ns, _k] = key.split(":");
  const keys = _k.split(".");
  const last_key = keys.at(-1) === "name";
  const t: Partial<Record<string, string>> = {};
  const langs = Object.keys(datas);
  for (const l of langs) {
    const filename = l;
    let data = datas[l][ns];
    for (const k of keys) {
      if (data[k] !== undefined) {
        data = data[k];
      } else {
        data = undefined;
        break;
      }
    }

    if (data !== undefined) {
      if (typeof data !== "string") throw new TypeError(`Expected a string, recieved ${typeof data}.\n\nRecieved: ${data}`);
      t[filename] = last_key ? data.trim().replaceAll(" ", "-").toLocaleLowerCase(filename) : data;
    }
  }
  return t;
}
