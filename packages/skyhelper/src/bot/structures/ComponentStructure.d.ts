import type { APIMessageComponentButtonInteraction, APIMessageComponentSelectMenuInteraction } from "@discordjs/core";
import type { getTranslator } from "@/i18n";
import type { InteractionHelper } from "@/utils/classes/InteractionUtil";

/** Buttons structure */
export interface ComponentStructure<T extends "Select" | "Button"> {
  /** Button Data */
  data: {
    /** Button id (or ID starts with) */
    name: string;
  };

  /** The callback for when the button is clicked */
  execute: (
    interaction: T extends "Button" ? APIMessageComponentButtonInteraction : APIMessageComponentSelectMenuInteraction,
    t: ReturnType<typeof getTranslator>,
    helper: InteractionHelper,
  ) => Promise<void>;
}
