import { CALCULATOR_DATA } from "@/modules/commands-data/utility-commands";
import { type Command } from "@/structures";
import { ComponentType } from "@discordjs/core";
export default {
  ...CALCULATOR_DATA,
  async interactionRun({ helper, options }) {
    const type = options.getString("candle-type", true);
    const settings = helper.client.schemas.getUser(helper.user);
    helper.launchModal(getCandlesModal(type, settings));
  },
} satisfies Command;

function getCandlesModal(type: string, settings) {
  const modal = {
    custom_id: "sjsj",
    title: "Calculator",
    components: [
      {
        type: ComponentType.TextDisplay,
        content: `The following values may have been pre-filled based on your planner data. If they are in-accurate, provide the correct values.`,
      },
      {
        type: ComponentType.Label,
        label: (type === "regular" ? "Regular" : type === "seasonal" ? "Seasonal" : "Ascended") + " Candles",
        description: "Enter the amount of candle(s) you currently have!",
        component: {
          type: ComponentType.TextInput,
          custom_id: "input",
          placeholder: "2",
          style: 1,
        },
      },
      {
        type: ComponentType.Label,
        label: "Do you season pass?",
        component: {
          type: 23,
          custom_id: "pass",
        },
      },
      {
        type: ComponentType.Label,
        label: "Did you complete your dailies today?",
        component: {
          type: 23,
          custom_id: "dailies",
        },
      },
      {
        type: ComponentType.Label,
        label: "Sync with the planner?",
        description: "Data provided here will be used to sync/update currecies and pass with planner data.",
        component: {
          type: 23,
          custom_id: "sync",
          default: true,
        },
      },
    ],
  };
  return modal;
}
