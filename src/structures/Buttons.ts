import type { ButtonInteraction } from "discord.js";
import type { SkyHelper } from "#structures";
import type { getTranslator } from "#src/i18n";
/* eslint-disable */

/** Buttons structure */
export type Button = {
  /** Button Data */
  data: {
    /** Button id (or ID starts with) */
    name: string;
  };

  /** The callback for when the button is clicked */
  execute: (interaction: ButtonInteraction, t: ReturnType<typeof getTranslator>, client: SkyHelper) => Promise<void>;
};
