import { CALCULATOR_DATA } from "@/modules/commands-data/utility-commands";
import { currencyMap, fetchSkyData, PlannerDataService, PlannerService } from "@/planner";
import type { Command } from "@/structures";
import type { UserSchema } from "@/types/schemas";
import {
  ComponentType,
  TextInputStyle,
  type APICheckboxGroupOption,
  type APIModalInteractionResponseCallbackData,
} from "@discordjs/core";
import { zone } from "@skyhelperbot/constants";
import { ShardsUtil } from "@skyhelperbot/utils";
import { DateTime } from "luxon";

type CandleType = "c" | "ac" | "sc";

export default {
  ...CALCULATOR_DATA,
  async interactionRun({ helper, options }) {
    const type = options.getString("candle-type", true) as CandleType;
    const [settings, skyData] = await Promise.all([helper.client.schemas.getUser(helper.user), fetchSkyData(helper.client)]);
    await helper.launchModal(getCandlesModal(type, settings, skyData));
  },
} satisfies Command;

function getCandlesModal(
  type: CandleType,
  settings: UserSchema,
  skyData: Awaited<ReturnType<typeof fetchSkyData>>,
): APIModalInteractionResponseCallbackData {
  const activeSeason = PlannerService.getCurrentSeason(skyData);

  const currentValue = getCurrencyValue(type, settings.plannerData);
  const checkboxes = buildCheckboxes(type, settings, activeSeason);

  return {
    custom_id: `calculator_modal;${type}` + (type === "sc" ? `;${activeSeason?.guid ?? ""}` : ""),
    title: "Calculator",
    components: [
      {
        type: ComponentType.TextDisplay,
        content:
          "The following values may have been pre-filled based on your planner data. If they are inaccurate, provide the correct values.",
      },
      {
        type: ComponentType.Label,
        label: currencyMap[type],
        description: "Enter the amount of candle(s) you currently have!",
        component: {
          type: ComponentType.TextInput,
          custom_id: "input_have",
          value: String(currentValue),
          style: TextInputStyle.Short,
        },
      },
      ...(type !== "sc"
        ? [
            {
              type: ComponentType.Label as const,
              label: currencyMap[type],
              description: "Enter the amount of candle(s) you need",
              component: {
                type: ComponentType.TextInput as const,
                custom_id: "input_need",
                value: String(currentValue),
                style: TextInputStyle.Short,
              },
            },
          ]
        : []),
      {
        type: ComponentType.Label,
        label: "Select all that applies!",
        component: {
          type: ComponentType.CheckboxGroup,
          custom_id: "checkboxes",
          options: checkboxes,
          required: false,
        },
      },
    ],
  };
}

function getCurrencyValue(type: CandleType, data: UserSchema["plannerData"]): number {
  const currencies = data?.currencies;
  if (!currencies) return 0;

  switch (type) {
    case "c":
      return currencies.candles;
    case "ac":
      return currencies.ascendedCandles;
    case "sc": {
      const seasonCurrencies = currencies.seasonCurrencies;

      const firstSeason = Object.values(seasonCurrencies)[0];
      return firstSeason?.candles ?? 0;
    }
  }
}

function buildCheckboxes(
  type: CandleType,
  settings: UserSchema,
  activeSeason: ReturnType<typeof PlannerService.getCurrentSeason>,
): APICheckboxGroupOption[] {
  const checkboxes: APICheckboxGroupOption[] = [];

  // eslint-disable-next-line
  const showDailies = (activeSeason && type === "sc") || (type === "c" && !activeSeason);
  if (showDailies) {
    checkboxes.push({
      label: "Did you complete your dailies today?",
      value: "dailies",
      default: PlannerDataService.hasDoneDailies(
        settings.plannerData,
        activeSeason?.guid ?? "",
        type === "c" ? "season" : "dailies",
      ),
    });
  }

  if (activeSeason && type === "sc") {
    checkboxes.push({
      label: "Do you have the season pass?",
      value: "pass",
      default: PlannerDataService.hasGuid(settings.plannerData?.seasonPasses, activeSeason.guid),
    });
  }

  if (type === "ac") {
    checkboxes.push({ label: "Have you done Eden this week?", value: "weekly" });
    const shard = ShardsUtil.getShard(DateTime.now().setZone(zone));
    if (shard && shard.type === "red") {
      checkboxes.push({
        label: "Have you cleared today's shard?",
        value: "today_shard",
        default: PlannerDataService.shardsCleared(settings.plannerData),
      });
    }
  }

  checkboxes.push({
    label: "Sync with the planner?",
    value: "sync",
    description: "Data provided here will be used to sync/update currencies and pass with planner data.",
    default: true,
  });

  return checkboxes;
}
