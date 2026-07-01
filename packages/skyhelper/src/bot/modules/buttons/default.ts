import { startSeasonCalculator } from "@/handlers/season-calculator";
import { fetchSkyData, PlannerDataService, PlannerService } from "@/planner";
import { defineButton } from "@/structures";
import type { InteractionHelper } from "@/utils/classes/InteractionUtil";
import { CustomId } from "@/utils/customId-store";
import {
  ComponentType,
  TextInputStyle,
  type APILabelComponent,
  type APIModalInteractionResponseCallbackData,
} from "discord-api-types/v10";
import { getCandlesModal } from "../inputCommands/utility/calculator.js";

export default defineButton({
  data: {
    name: "default",
  },
  id: CustomId.Default,
  async execute(interaction, t, helper, { data }) {
    // currency modify btn
    if (data === "currency_modify") {
      await handleCurrencyModify(helper);
      return;
    }

    // button redirect to season calculator from a season display page in planner
    if (data === "calculator-season") {
      const [settings, skyData] = await Promise.all([helper.client.schemas.getUser(helper.user), fetchSkyData(helper.client)]);
      await helper.launchModal(getCandlesModal("sc", settings, skyData, t));
    }
  },
});

async function handleCurrencyModify(helper: InteractionHelper) {
  const settings = await helper.client.schemas.getUser(helper.user);
  const { currencies } = settings.plannerData ?? PlannerDataService.createEmpty();
  const components: APILabelComponent[] = [];
  const d = await fetchSkyData(helper.client);
  const season = PlannerService.getCurrentSeason(d);
  // More than one events can exist at a time, but including all may reach modal component limits
  // So for now only implementing modifying the first
  // TODO: do something about this, or hopefully discord increases components limit in modals
  // TODO: also add gift passes
  const event = PlannerService.getEvents(d).current[0];
  const sCurrency = currencies.seasonCurrencies[season?.guid ?? ""];
  const eCurrency = currencies.eventCurrencies[event?.instance.guid ?? ""];
  if (season) {
    components.push({
      type: ComponentType.Label,
      label: "Season Candle/Hearts",
      description: "Season candles and hearts you have (seprated by `/`)",
      component: {
        type: ComponentType.TextInput,
        custom_id: "season" + `/${season.guid}`,
        style: TextInputStyle.Short,
        value: `${sCurrency?.candles ?? 0}/${sCurrency?.hearts ?? 0}`,
        required: false,
      },
    });
  }
  if (event) {
    components.push({
      type: ComponentType.Label,
      label: "Event Tickets",
      description: "Amount of event tickets you have",
      component: {
        type: ComponentType.TextInput,
        custom_id: "event" + `/${event.instance.guid}`,
        style: TextInputStyle.Short,
        value: `${eCurrency?.tickets ?? 0}`,
        required: false,
      },
    });
  }

  const modal: APIModalInteractionResponseCallbackData = {
    title: "Modify your currencies",
    custom_id: "currency_modify",
    components: [
      {
        type: ComponentType.Label,
        label: "Candles",
        description: "The amount of candles you have",
        component: {
          type: ComponentType.TextInput,
          value: `${currencies.candles || 0}`,
          custom_id: "candles",
          style: TextInputStyle.Short,
        },
      },
      {
        type: ComponentType.Label,
        label: "Hearts",
        description: "The amount of hearts you have",
        component: {
          type: ComponentType.TextInput,
          value: `${currencies.hearts || 0}`,
          custom_id: "hearts",
          style: TextInputStyle.Short,
        },
      },
      {
        type: ComponentType.Label,
        label: "Ascended Candles",
        description: "The amount of ACs you have",
        component: {
          type: ComponentType.TextInput,
          value: `${currencies.ascendedCandles || 0}`,
          custom_id: "ac",
          style: TextInputStyle.Short,
        },
      },
      ...components,
    ],
  };
  await helper.launchModal(modal);
}
