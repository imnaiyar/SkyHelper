import type { APIMessageComponentButtonInteraction } from "@discordjs/core";
import type { getTranslator } from "@/i18n";
import type { InteractionHelper } from "@/utils/classes/InteractionUtil";
import type { Awaitable } from "@/types/utils";
import type { CustomId, store } from "@/utils/customId-store";

/** Buttons structure */
export interface Button<T extends CustomId> {
  /** Button Data */
  data: {
    /** Button id (or ID starts with) */
    name: string;
  };

  /**
   * Id of the button
   */
  id: T;

  /** The callback for when the button is clicked */
  execute: (
    interaction: APIMessageComponentButtonInteraction,
    t: ReturnType<typeof getTranslator>,
    helper: InteractionHelper,
    props: (ReturnType<typeof store.deserialize> & { id: T })["data"],
  ) => Awaitable<void>;
}

/**
 * Helper function, so generic is properly inferred as it not possible with asserting to a plain object
 * @param button the button object
 * @returns the button object
 */
export const defineButton = <T extends CustomId>(button: Button<T>): Button<T> => button;
