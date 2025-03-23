import type { APIMessageComponentButtonInteraction } from "@discordjs/core";
import type { getTranslator } from "@/i18n";
import type { InteractionHelper } from "@/utils/classes/InteractionUtil";
import type { Awaitable } from "@/types/utils";

/** Buttons structure */
export interface Button<TProps extends Record<string, string> = {}> {
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
    props: TProps,
  ) => Awaitable<void>;
}
