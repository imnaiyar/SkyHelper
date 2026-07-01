import type { getTranslator } from "@/i18n";
import { CALCULATOR_DATA } from "@/modules/commands-data/utility-commands";
import { fetchSkyData, PlannerDataService, PlannerService } from "@/planner";
import type { Command } from "@/structures";
import type { UserSchema } from "@/types/schemas";
import {
  ComponentType,
  TextInputStyle,
  type APICheckboxGroupOption,
  type APIModalInteractionResponseCallbackData,
} from "@discordjs/core";
import { zone } from "@skyhelperbot/constants";
import { ShardsUtil, textDisplay } from "@skyhelperbot/utils";
import { DateTime } from "luxon";

type CandleType = "c" | "ac" | "sc";

export default {
  ...CALCULATOR_DATA,
  async interactionRun({ helper, options }) {
    const type = options.getString("candle-type", true) as CandleType;
    const [settings, skyData] = await Promise.all([helper.client.schemas.getUser(helper.user), fetchSkyData(helper.client)]);
    await helper.launchModal(getCandlesModal(type, settings, skyData, helper.t));
  },
} satisfies Command;

export function getCandlesModal(
  type: CandleType,
  settings: UserSchema,
  skyData: Awaited<ReturnType<typeof fetchSkyData>>,
  t: ReturnType<typeof getTranslator>,
): APIModalInteractionResponseCallbackData {
  const activeSeason = PlannerService.getCurrentSeason(skyData);

  const currentValue = getCurrencyValue(type, settings.plannerData, activeSeason?.guid);
  const checkboxes = buildCheckboxes(type, settings, activeSeason, t);
  const currency = {
    ac: t("AC"),
    c: t("CANDLE"),
    sc: t("SC"),
  }[type];
  return {
    custom_id: `calculator_modal;${type}` + (type === "sc" ? `;${activeSeason?.guid ?? ""}` : ""),
    title: "Calculator",
    components: [
      textDisplay(`# ${currency}`, t("features:calculator.PREFILLED")),
      {
        type: ComponentType.Label,
        label: t("features:calculator.CURRENT_C"),
        description: t("features:calculator.CANDLE_AMOUNT"),
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
              label: t("features:calculator.TARGET_C"),
              description: t("features:calculator.CANDLE_NEEDED"),
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
        label: t("SELECT_ALL"),
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

function getCurrencyValue(type: CandleType, data: UserSchema["plannerData"], seasonGuid?: string): number {
  const currencies = data?.currencies;
  if (!currencies) return 0;

  switch (type) {
    case "c":
      return currencies.candles;
    case "ac":
      return currencies.ascendedCandles;
    case "sc": {
      const seasonCurrencies = currencies.seasonCurrencies;
      return seasonCurrencies[seasonGuid ?? ""]?.candles ?? 0;
    }
  }
}

function buildCheckboxes(
  type: CandleType,
  settings: UserSchema,
  activeSeason: ReturnType<typeof PlannerService.getCurrentSeason>,
  t: ReturnType<typeof getTranslator>,
): APICheckboxGroupOption[] {
  const checkboxes: APICheckboxGroupOption[] = [];

  // eslint-disable-next-line
  const showDailies = (activeSeason && type === "sc") || (type === "c" && !activeSeason);
  if (showDailies) {
    checkboxes.push({
      label: t("DAILIES_COMPLETE_Q"),
      value: "dailies",
      default: PlannerDataService.hasDoneDailies(
        settings.plannerData,
        activeSeason?.guid ?? "",
        type === "sc" ? "season" : "dailies",
      ),
    });
  }

  if (activeSeason && type === "sc") {
    checkboxes.push({
      label: t("SEASON_PASS_Q"),
      value: "pass",
      default: PlannerDataService.hasGuid(settings.plannerData?.seasonPasses, activeSeason.guid),
    });
  }

  if (type === "ac") {
    checkboxes.push({ label: t("EDEN_COMPLETED_Q"), value: "weekly" });
    const shard = ShardsUtil.getShard(DateTime.now().setZone(zone));
    if (shard && shard.info.type === "red") {
      checkboxes.push({
        label: t("SHARD_COMPLETED_Q"),
        value: "today_shard",
        default: PlannerDataService.shardsCleared(settings.plannerData),
      });
    }
  }

  checkboxes.push({
    label: t("SYNC_PLANNER"),
    value: "sync",
    description: t("SYNC_INFO"),
    default: true,
  });

  return checkboxes;
}
