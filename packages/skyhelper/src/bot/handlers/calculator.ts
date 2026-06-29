import type { InteractionHelper } from "@/utils/classes/InteractionUtil";
import { startSeasonCalculator } from "@/handlers/season-calculator";
import Utils from "@/utils/classes/Utils";
import { fallbackResponse } from "@/utils/interactions";
import { currency, zone } from "@skyhelperbot/constants";
import { container, separator, ShardsUtil, textDisplay } from "@skyhelperbot/utils";
import { ComponentType, MessageFlags, type APIContainerComponent, type APIModalSubmitInteraction } from "discord-api-types/v10";
import { DateTime } from "luxon";

import { PlannerDataService } from "@/planner";
const BASE_DAILY_CANDLES = 15;
const MAX_DAILY_CANDLES = 21;
const DAILY_QUESTS_CANDLES = 4;
const MAX_WEEKLY_AC = 15.75;

const withEmojiCount = (count: number, emoji: string) => `${count} ${Utils.formatEmoji(emoji)}`;

// #region handler
export async function handleCalculatorModal(helper: InteractionHelper) {
  const int = helper.int as APIModalSubmitInteraction,
    client = helper.client;

  // if it was on a message, then assume it came from season display page, we'd want to update the original page then instead of creating another reply
  await (helper.int.message ? helper.deferUpdate() : helper.defer());

  const [_, type = "c", guid = ""] = int.data.custom_id.split(";");
  const rawCurrent = client.utils.getModalComponent(int, "input_have", ComponentType.TextInput, true).value;
  const current = Number(rawCurrent);
  const checkboxes = client.utils.getModalComponent(int, "checkboxes", ComponentType.CheckboxGroup)?.values;

  if (Number.isNaN(current)) {
    await fallbackResponse(helper, helper.t("errors:NOT_A_NUMBER", { VALUE: rawCurrent }));
    return;
  }

  if (type === "sc") {
    await startSeasonCalculator(helper, current, checkboxes ?? [], guid, !!helper.int.message);
    return;
  }

  let component: APIContainerComponent = container(textDisplay("Sorry this feature is not implemented yet!"));

  switch (type) {
    case "c": {
      const target = Number(client.utils.getModalComponent(int, "input_need", ComponentType.TextInput, true).value);

      if (Number.isNaN(target)) {
        await fallbackResponse(helper, helper.t("errors:NOT_A_NUMBER", { VALUE: target }));
        return;
      }

      const { daysWithBase, daysWithBaseQuests, daysWithMax, daysWithMaxQuests } = calculateCandles(current, target);

      component = container(
        textDisplay(
          `## ${helper.t("features:calculator.CANDLE")} ${Utils.formatEmoji(currency.c)}`,
          helper.t("features:calculator.CANDLES_HEADER", {
            current: withEmojiCount(current, currency.c),
            target: withEmojiCount(target, currency.c),
            total: withEmojiCount(target - current, currency.c),
          }),
        ),
        separator(),
        textDisplay(
          helper.t("features:calculator.NORMAL_CANDLES_RESULT", {
            daysWithBase,
            daysWithMax,
            daysWithBaseQuests,
            daysWithMaxQuests,
          }),
        ),
      );
      break;
    }
    case "ac": {
      const rawTarget = client.utils.getModalComponent(int, "input_need", ComponentType.TextInput, true).value;

      const target = Number(rawTarget);

      if (Number.isNaN(target)) {
        await fallbackResponse(helper, helper.t("errors:NOT_A_NUMBER", { VALUE: rawTarget }));
        return;
      }

      const {
        daysWithWeeklyOnly,
        daysCombined,
        daysWithShardOnly,
        shardCountCombined,
        shardCountCombinedAc,
        shardCountOnly,
        edenCount,
        edenCountCombined,
      } = calculateAscendedCandles(
        current,
        target,
        checkboxes?.includes("weekly") ?? false,
        checkboxes?.includes("today_shard") ?? false,
      );

      const acEmoji = Utils.formatEmoji(currency.ac);
      component = container(
        textDisplay(
          `## ${helper.t("features:calculator.AC")} ${acEmoji}`,
          helper.t("features:calculator.CANDLES_HEADER", {
            current: withEmojiCount(current, currency.ac),
            target: withEmojiCount(target, currency.ac),
            total: withEmojiCount(target - current, currency.ac),
          }),
        ),
        separator(),
        textDisplay(
          helper.t("features:calculator.AC_RESULT", {
            daysWithWeeklyOnly,
            daysWithShardOnly,
            edenCount,
            edenTotal: `\`${MAX_WEEKLY_AC} × ${edenCount} = ${MAX_WEEKLY_AC * edenCount}\` ${acEmoji}`,
            daysCombined,
            edenCountCombined,
            edenCombinedTotal: `\`${MAX_WEEKLY_AC} × ${edenCountCombined} = ${MAX_WEEKLY_AC * edenCountCombined}\` ${acEmoji}`,
            shardCountCombined,
            shardCountCombinedAc,
            combinedTotal: `\`${shardCountCombinedAc} + ${MAX_WEEKLY_AC * edenCountCombined} = ${shardCountCombinedAc + MAX_WEEKLY_AC * edenCountCombined}\` ${acEmoji}`,
            shardCountOnly,
          }),
        ),
        separator(),
        textDisplay(`-# ${helper.t("features:calculator.SHARD_DISCLAIMER")}`),
      );
      break;
    }
  }
  await helper.editReply({ components: [component], flags: MessageFlags.IsComponentsV2 });

  if (checkboxes?.includes("sync")) {
    syncPlanner(helper, current, type, checkboxes.includes("today_shard")).catch((er) => helper.client.logger.error(er));
  }
}

async function syncPlanner(helper: InteractionHelper, current: number, type: string, shardDone = false) {
  const schema = await helper.client.schemas.getUser(helper.user);
  schema.plannerData ??= PlannerDataService.createEmpty();

  if (type === "c") schema.plannerData.currencies.candles = current;
  if (type === "ac") {
    schema.plannerData.currencies.ascendedCandles = current;

    schema.plannerData.shards_checkin = shardDone ? new Date().toISOString() : "";
  }

  await schema.save();
}
// #region Candles
function calculateCandles(current: number, target: number) {
  const required = target - current;
  if (required <= 0) return { daysWithBase: 0, daysWithBaseQuests: 0, daysWithMax: 0, daysWithMaxQuests: 0 };

  const [daysWithBase, daysWithBaseQuests] = [BASE_DAILY_CANDLES, BASE_DAILY_CANDLES + DAILY_QUESTS_CANDLES].map((num) =>
    Math.ceil(required / num),
  ) as [number, number];
  const [daysWithMax, daysWithMaxQuests] = [MAX_DAILY_CANDLES, MAX_DAILY_CANDLES + DAILY_QUESTS_CANDLES].map((num) =>
    Math.ceil(required / num),
  ) as [number, number];

  return {
    daysWithBase,
    daysWithBaseQuests,
    daysWithMax,
    daysWithMaxQuests,
  };
}

// #region shards
interface RewardDaysResult {
  daysWithWeeklyOnly: number;
  daysWithShardOnly: number;
  daysCombined: number;
  shardCountCombined: number;
  shardCountOnly: number;
  edenCount: number;
  edenCountCombined: number;
  shardCountCombinedAc: number;
}

export function calculateAscendedCandles(
  currentValue: number,
  targetValue: number,
  weeklyDone = false,
  shardsCleared = false,
): RewardDaysResult {
  const needed = targetValue - currentValue;
  const currentDate = DateTime.now().setZone(zone);

  if (needed <= 0) {
    return {
      daysWithWeeklyOnly: 0,
      daysWithShardOnly: 0,
      daysCombined: 0,
      shardCountCombined: 0,
      shardCountCombinedAc: 0,
      shardCountOnly: 0,
      edenCount: 0,
      edenCountCombined: 0,
    };
  }

  // Accumulators for the three scenarios
  let accWeekly = 0;
  let accShard = 0;
  let accCombined = 0;
  let edenCounts = 0;

  // Trackers for results (null means not yet reached)
  let resWeekly: number | null = null;
  let resShard: number | null = null;
  let resCombined: number | null = null;

  let shardCount = 0;
  let shardCountCombined = 0;
  let shardCountCombinedAc = 0;
  let shardCountOnly = 0;
  let edenCount = 0;
  let edenCountCombined = 0;

  let daysPassed = 0;
  let simDate = currentDate;

  // To prevent infinite loops
  const MAX_DAYS = 3650;

  while ((resWeekly === null || resShard === null || resCombined === null) && daysPassed < MAX_DAYS) {
    let dailyWeekly = 0;
    if (daysPassed === 0) {
      if (!weeklyDone) {
        dailyWeekly = MAX_WEEKLY_AC;
        edenCounts++;
      }
    } else if (simDate.weekday === 7) {
      dailyWeekly = MAX_WEEKLY_AC;
      edenCounts++;
    }

    let dailyShard = ShardsUtil.getNextShard(simDate, ["red"])?.info.ac ?? 0;

    // reset to zero if already cleared for todays shard
    if (daysPassed === 0 && shardsCleared) dailyShard = 0;
    else if (dailyShard) shardCount++;

    // Update Accumulators
    accWeekly += dailyWeekly;
    accShard += dailyShard;
    accCombined += dailyWeekly + dailyShard;

    // We only set the result if it hasn't been set yet (to capture the earliest day)
    if (resWeekly === null && accWeekly >= needed) {
      resWeekly = daysPassed;
      edenCount = edenCounts;
    }

    if (resShard === null && accShard >= needed) {
      resShard = daysPassed;
      shardCountOnly = shardCount;
    }

    if (resCombined === null && accCombined >= needed) {
      resCombined = daysPassed;
      shardCountCombined = shardCount;
      shardCountCombinedAc = accShard;
      edenCountCombined = edenCounts;
    }

    // If all three scenarios are satisfied, we can stop early.
    if (resWeekly !== null && resShard !== null && resCombined !== null) {
      break;
    }

    daysPassed++;

    // reset to start of the after current date so time sensitive calculation like shards would be accurate
    simDate = simDate.plus({ days: 1 }).startOf("day");
  }

  return {
    daysWithWeeklyOnly: resWeekly ?? Infinity,
    daysWithShardOnly: resShard ?? Infinity,
    daysCombined: resCombined ?? Infinity,
    shardCountCombined,
    shardCountCombinedAc,
    shardCountOnly,
    edenCount,
    edenCountCombined,
  };
}
