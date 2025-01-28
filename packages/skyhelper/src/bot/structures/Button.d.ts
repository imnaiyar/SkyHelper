import type { APIMessageComponentButtonInteraction } from "@discordjs/core";
import type { SkyHelper } from "./Client.ts";
import type { getTranslator } from "@/i18n";
import type { InteractionHelper } from "@/utils/classes/InteractionUtil";

/** Buttons structure */
export type Button = {
  /** Button Data */
  data: {
    /** Button id (or ID starts with) */
    name: string;
  };

  /** The callback for when the button is clicked */
  execute: (
    interaction: APIMessageComponentButtonInteraction,
    t: ReturnType<typeof getTranslator>,
    helper: InteractionHelper,
  ) => Promise<void>;
};
