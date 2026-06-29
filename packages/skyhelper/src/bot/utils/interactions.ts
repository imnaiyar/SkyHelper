import { InteractionHelper } from "./classes/InteractionUtil.js";

export async function fallbackResponse(intOrHelper: InteractionHelper, response: string) {
  if (intOrHelper.replied) await intOrHelper.followUp({ content: response });
  else await intOrHelper.reply({ content: response });
}
