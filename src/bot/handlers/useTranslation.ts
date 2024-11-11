// import i18next initialization file to insure it's initialized before calling the below function
import "../i18n.js";
import type { LangKeys } from "../i18n.js";
import { t } from "i18next";
import { supportedLang } from "../libs/constants/supportedLang.js";
import type { LocalizationMap } from "discord.js";

/**
 * Get API compatible localization data for all the available (and allowed) languages
 * @param key translation keys
 * @returns localization data
 */
export function useTranslations(key: LangKeys): LocalizationMap {
  const data: LocalizationMap = {};
  for (const { value } of supportedLang) {
    data[value] = t(key, { lng: value });
  }
  return data;
}
