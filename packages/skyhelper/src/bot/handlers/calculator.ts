import type { InteractionHelper } from "@/utils/classes/InteractionUtil";
import { zone } from "@skyhelperbot/constants";
import { container, separator, ShardsUtil, textDisplay } from "@skyhelperbot/utils";
import { ComponentType, MessageFlags, type APIContainerComponent, type APIModalSubmitInteraction } from "discord-api-types/v10";
import { DateTime } from "luxon";

export async function handleCalculatorModal(helper: InteractionHelper) {
  const int = helper.int as APIModalSubmitInteraction,
    client = helper.client;
  await helper.defer({ flags: 64 });
  const [_, type = "c", guid = ""] = int.data.custom_id.split(";");
  const current = client.utils.getModalComponent(int, "input_have", ComponentType.TextInput, true).value;
  const checkboxes = client.utils.getModalComponent(int, "checkboxes", ComponentType.CheckboxGroupAction)?.values;

  let component: APIContainerComponent;
  switch (type) {
    case "c": {
      const target = client.utils.getModalComponent(int, "input_need", ComponentType.TextInput, true).value;

      const { daysWithBase, daysWithBaseQuests, daysWithMax, daysWithMaxQuests } =
        calculateCandles(Number(current), Number(target)) ?? {};

      component = container(
        textDisplay(`Your Current Candles: ${current}`, `Target Candle Needed: ${target}`),
        separator(),
        textDisplay(
          `### Days Needed to get the target candles?`,
          `**If you collect candles upto:**`,
          `- 3 Chevrons (15 Candles): It'll take you \`${daysWithBase ?? 0}\` days.`,
          `- Until gray (21 candles): It'll take you \`${daysWithMax ?? 0}\` days.`,
          "**Assuming you can also get candles from daily quests and there are no season in between**:",
          `- 3 Chevron: \`${daysWithBaseQuests ?? 0}\` days`,
          `- Until gray: \`${daysWithMaxQuests ?? 0}\` days`,
        ),
      );
      break;
    }
    case "ac": {
      const target = client.utils.getModalComponent(int, "input_need", ComponentType.TextInput, true).value;
      const { daysWithWeeklyOnly, daysCombined, daysWithShardOnly, shardCountCombined, shardCountCombinedAc, shardCountOnly } =
        calculateAscendedCandles(
          Number(current),
          Number(target),
          checkboxes?.includes("weekly") ?? false,
          checkboxes?.includes("today_shard") ?? false,
        );

      component = container(
        textDisplay(`Your Current ACs: ${current}`, `Target ACs Needed: ${target}`),
        separator(),
        textDisplay(
          `### Days Needed to get the target ascended candles?`,
          `**If you do:**`,
          `- Only eden weekly: It'll take \`${daysWithWeeklyOnly}\` days`,
          `- Eden + All red shards: It'll take \`${daysCombined}\` days`,
          `  -# - There will be total \`${shardCountCombined}\` shards giving you \`${shardCountCombinedAc}\` ACs`,
          `- Red Shards only: It'll take \`${daysWithShardOnly}\``,
          `  -# - Assuming you complete all shard events, you'll have to do a sum total of \`${shardCountOnly}\` red shards`,
        ),
      );
      break;
    }
    case "sc": {
      break;
    }
  }
  await helper.editReply({ components: [component], flags: MessageFlags.IsComponentsV2 });
}
const BASE_DAILY_CANDLES = 15;
const MAX_DAILY_CANDLES = 21;
const MAX_DAILY_SC = 5;
const MAX_WEEKLY_AC = 15.75;

// #region Candles
function calculateCandles(current: number, target: number, dailiesDone = false) {
  const required = target - current;
  if (required <= 0) return null;

  const [daysWithBase, daysWithBaseQuests] = [BASE_DAILY_CANDLES, BASE_DAILY_CANDLES + 4].map((num) => Math.ceil(required / num));
  const [daysWithMax, daysWithMaxQuests] = [MAX_DAILY_CANDLES, MAX_DAILY_CANDLES + 4].map((num) => Math.ceil(required / num));

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
  shardCountCombinedAc: number;
}

// TODO: implement if cleared shards today
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
    };
  }

  // Accumulators for the three scenarios
  let accWeekly = 0;
  let accShard = 0;
  let accCombined = 0;

  // Trackers for results (null means not yet reached)
  let resWeekly: number | null = null;
  let resShard: number | null = null;
  let resCombined: number | null = null;

  let shardCount = 0;
  let shardCountCombined = 0;
  let shardCountCombinedAc = 0;
  let shardCountOnly = 0;

  let daysPassed = 0;
  let simDate = currentDate;

  // To prevent infinite loops
  const MAX_DAYS = 3650;

  while ((resWeekly === null || resShard === null || resCombined === null) && daysPassed < MAX_DAYS) {
    let dailyWeekly = 0;
    if (daysPassed === 0) {
      if (!weeklyDone) dailyWeekly = MAX_WEEKLY_AC;
    } else if (simDate.weekday === 7) {
      dailyWeekly = MAX_WEEKLY_AC;
    }

    let dailyShard = ShardsUtil.getNextShard(simDate, ["red"])?.info.ac ?? 0;

    // reset to zero if already cleared for todays shard
    if (daysPassed === 0 && shardsCleared) dailyShard = 0;
    else shardCount++;

    // Update Accumulators
    accWeekly += dailyWeekly;
    accShard += dailyShard;
    accCombined += dailyWeekly + dailyShard;

    // We only set the result if it hasn't been set yet (to capture the earliest day)
    if (resWeekly === null && accWeekly >= needed) {
      resWeekly = daysPassed;
    }

    if (resShard === null && accShard >= needed) {
      resShard = daysPassed;
      shardCountOnly = shardCount;
    }

    if (resCombined === null && accCombined >= needed) {
      resCombined = daysPassed;
      shardCountCombined = shardCount;
      shardCountCombinedAc = accShard;
    }

    // If all three scenarios are satisfied, we can stop early.
    if (resWeekly !== null && resShard !== null && resCombined !== null) {
      break;
    }

    daysPassed++;
    simDate = simDate.plus({ days: 1 });
  }

  return {
    daysWithWeeklyOnly: resWeekly ?? Infinity,
    daysWithShardOnly: resShard ?? Infinity,
    daysCombined: resCombined ?? Infinity,
    shardCountCombined,
    shardCountCombinedAc,
    shardCountOnly,
  };
}
