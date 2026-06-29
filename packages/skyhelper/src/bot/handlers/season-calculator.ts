import { CostUtils, fetchSkyData, PlannerDataService, PlannerService } from "@/planner";
import { SpiritType } from "@/types/planner";
import type { InteractionHelper } from "@/utils/classes/InteractionUtil";
import Utils from "@/utils/classes/Utils";
import { CustomId } from "@/utils/customId-store";
import { currency, zone } from "@skyhelperbot/constants";
import { button, container, row, section, separator, textDisplay } from "@skyhelperbot/utils";
import {
  ButtonStyle,
  ComponentType,
  MessageFlags,
  type APIMessageComponentButtonInteraction,
  type APIStringSelectComponent,
} from "discord-api-types/v10";
import { DateTime } from "luxon";
import { SpiritTreeHelper, type INode, type ISeason, type ISkyData, type ISpiritTree } from "skygame-data";

const BASE_DAILY_SEASON_CANDLES = 5;
const PASS_DAILY_SEASON_CANDLES = 6;
const STATE_TTL = 15 * 60_000;
const states = new Map<string, SeasonCalculatorState>();

interface SeasonCalculatorState {
  seasonGuid: string;
  currentCandles: number;
  hasPass: boolean;
  dailiesDone: boolean;
  sync: boolean;
  user: string;
  createdAt: number;
  selectedNodeGuids: Record<string, string[]>;
}

interface SeasonCalculatorCustomIdData {
  action: "select" | "calculate" | "view";
  key: string;
  tree?: string | null;
  user?: string | null;
}

export async function startSeasonCalculator(
  helper: InteractionHelper,
  currentCandles: number,
  checkboxes: string[] = [],
  seasonGuid?: string,
) {
  const data = await fetchSkyData(helper.client);
  const season = PlannerService.getCurrentSeason(data);

  if (!season || (seasonGuid && season.guid !== seasonGuid)) {
    await helper.editReply({
      content: helper.t("features:calculator.SEASON_NO_ACTIVE"),
      components: [],
    });
    return;
  }

  const key = helper.int.id;
  states.set(key, {
    seasonGuid: season.guid,
    currentCandles,
    hasPass: checkboxes.includes("pass"),
    dailiesDone: checkboxes.includes("dailies"),
    sync: checkboxes.includes("sync"),
    user: helper.user.id,
    createdAt: Date.now(),
    selectedNodeGuids: {},
  });

  cleanupStates();

  if (checkboxes.includes("sync")) {
    await syncPlannerData(helper, season.guid, currentCandles, checkboxes.includes("pass"), checkboxes.includes("dailies"));
  }

  await helper.editReply({
    components: [renderSeasonCalculator(helper, data, season, states.get(key)!, key)],
    flags: MessageFlags.IsComponentsV2,
  });
}

export async function handleSeasonCalculatorButton(
  helper: InteractionHelper,
  data: SeasonCalculatorCustomIdData,
  interaction: APIMessageComponentButtonInteraction,
) {
  const state = states.get(data.key);
  if (!state || state.user !== helper.user.id || Date.now() - state.createdAt > STATE_TTL) {
    states.delete(data.key);
    await helper.update({ content: helper.t("features:calculator.SEASON_STATE_EXPIRED") });
    return;
  }

  const skyData = await fetchSkyData(helper.client);
  const season = PlannerService.getCurrentSeason(skyData);
  if (!season || season.guid !== state.seasonGuid) {
    await helper.update({ content: helper.t("features:calculator.SEASON_NO_ACTIVE") });
    return;
  }

  if (data.action === "view") {
    await helper.update({
      components: [renderSeasonCalculator(helper, skyData, season, state, data.key)],
      flags: MessageFlags.IsComponentsV2,
    });
    return;
  }

  if (data.action === "calculate") {
    await helper.update({
      components: [renderSeasonResult(helper, skyData, season, state, data.key)],
      flags: MessageFlags.IsComponentsV2,
    });
    return;
  }

  const tree = getSeasonTrees(season).find((item) => item.tree.guid === data.tree)?.tree;
  if (!tree) {
    await helper.reply({ content: helper.t("features:calculator.SEASON_TREE_MISSING"), flags: MessageFlags.Ephemeral });
    return;
  }

  await launchTreeSelectionModal(helper, skyData, season, tree, state, data.key, interaction);
}

function renderSeasonCalculator(
  helper: InteractionHelper,
  data: ISkyData,
  season: ISeason,
  state: SeasonCalculatorState,
  key: string,
) {
  const trees = getSeasonTrees(season);
  const selectedNodes = getSelectedNodes(data, state);
  const selectedTotal = selectedNodes.reduce((total, node) => total + (node.sc ?? 0), 0);

  return container(
    textDisplay(
      `## ${helper.t("features:calculator.SC")} ${Utils.formatEmoji(currency.sc)}`,
      `**${formatEmoji(season.emoji, season.shortName)} ${season.name}**`,
      helper.t("features:calculator.SEASON_SELECTOR_HEADER", {
        current: formatSeasonCandles(state.currentCandles),
        selected: formatSeasonCandles(selectedTotal),
        end: Utils.time(season.endDate, "R"),
      }),
    ),
    separator(),
    ...trees.flatMap(({ tree, name }) => {
      const nodes = getNodesByGuid(data, state.selectedNodeGuids[tree.guid] ?? []);
      const summary = nodes.length
        ? nodes
            .slice(0, 8)
            .map((node) => Utils.formatEmoji(node.item?.emoji))
            .join(" ") + (nodes.length > 8 ? ` +${nodes.length - 8}` : "")
        : helper.t("features:calculator.SEASON_NO_ITEMS_SELECTED");

      return [
        section(
          button({
            label: "Select",
            style: ButtonStyle.Secondary,
            custom_id: createCustomId(helper, "select", key, tree.guid),
          }),
          `### ${name}`,
          summary,
          treeCostSummary(tree),
          "\u200b",
        ),
      ];
    }),
    separator(),
    row(
      button({
        label: "Calculate",
        style: ButtonStyle.Success,
        custom_id: createCustomId(helper, "calculate", key),
      }),
    ),
  );
}

function renderSeasonResult(
  helper: InteractionHelper,
  data: ISkyData,
  season: ISeason,
  state: SeasonCalculatorState,
  key: string,
) {
  const selectedNodes = getSelectedNodes(data, state);
  const total = selectedNodes.reduce((sum, node) => sum + (node.sc ?? 0), 0);
  const remaining = Math.max(total - state.currentCandles, 0);
  const daysNeeded = calculateSeasonDays(remaining, state.hasPass, state.dailiesDone);
  const now = DateTime.now().setZone(zone).startOf("day");
  const daysLeft = Math.max(0, Math.ceil(season.endDate.startOf("day").diff(now, "days").days) + 1);
  const canFinish = daysNeeded <= daysLeft;

  return container(
    textDisplay(
      `## ${helper.t("features:calculator.SC")} ${Utils.formatEmoji(currency.sc)}`,
      `**${formatEmoji(season.emoji, season.shortName)} ${season.name}**`,
      helper.t("features:calculator.SEASON_RESULT", {
        current: formatSeasonCandles(state.currentCandles),
        selected: formatSeasonCandles(total),
        remaining: formatSeasonCandles(remaining),
        daily: state.hasPass ? PASS_DAILY_SEASON_CANDLES : BASE_DAILY_SEASON_CANDLES,
        days: daysNeeded,
        daysLeft,
        end: Utils.time(season.endDate, "R"),
        status: canFinish
          ? helper.t("features:calculator.SEASON_RESULT_CAN_FINISH")
          : helper.t("features:calculator.SEASON_RESULT_CANNOT_FINISH"),
      }),
    ),
    separator(),
    textDisplay(
      selectedNodes.length
        ? selectedNodes
            .map(
              (node) =>
                `- ${Utils.formatEmoji(node.item?.emoji)} ${node.item?.name ?? "Unknown"}: ${formatSeasonCandles(node.sc ?? 0)}`,
            )
            .join("\n")
        : helper.t("features:calculator.SEASON_NO_ITEMS_SELECTED"),
    ),
    separator(),
    row(
      button({
        label: "Back",
        style: ButtonStyle.Secondary,
        custom_id: createCustomId(helper, "view", key),
      }),
      button({
        label: "Recalculate",
        style: ButtonStyle.Success,
        custom_id: createCustomId(helper, "calculate", key),
      }),
    ),
  );
}

async function launchTreeSelectionModal(
  helper: InteractionHelper,
  data: ISkyData,
  season: ISeason,
  tree: ISpiritTree,
  state: SeasonCalculatorState,
  key: string,
  interaction: APIMessageComponentButtonInteraction,
) {
  const nodes = SpiritTreeHelper.getNodes(tree).filter((node) => node.sc ?? node.sh ?? node.item);
  const menus: APIStringSelectComponent[] = [];
  const selected = new Set(state.selectedNodeGuids[tree.guid] ?? []);

  for (let i = 0; i < nodes.length; i += 25) {
    const chunk = nodes.slice(i, i + 25);
    const index = Math.floor(i / 25) + 1;
    const total = Math.ceil(nodes.length / 25);

    menus.push({
      type: ComponentType.StringSelect,
      custom_id: `season_tree_${index}`,
      min_values: 0,
      max_values: chunk.length,
      required: false,
      placeholder: `Select items (${index}/${total})`,
      options: chunk.map((node) => ({
        label: trimLabel(`${node.item?.name ?? "Unknown"}${node.item?.level ? ` Lvl${node.item.level}` : ""}`),
        description: trimLabel(`${CostUtils.costToEmoji(node)}${isPassItem(node) ? " • Requires season pass" : ""}`, 100),
        value: node.guid,
        emoji: node.item?.emoji ? { id: node.item.emoji } : undefined,
        default: selected.has(node.guid),
      })),
    });
  }

  const modalId = `season_calculator_tree;${interaction.id};${tree.guid}`;
  await helper.launchModal({
    custom_id: modalId,
    title: trimLabel(`Select ${getTreeName(tree)} Items`, 45),
    components: [
      {
        type: ComponentType.TextDisplay,
        content: `Select the items you want to buy from **${getTreeName(tree)}**. Only selected item costs are counted.`,
      },
      ...menus.map((menu) => ({ type: ComponentType.Label as const, label: "Select Items", component: menu })),
    ],
  });

  const submission = await helper.client
    .awaitModal({
      filter: (modal) => modal.data.custom_id === modalId && (modal.member?.user ?? modal.user)?.id === helper.user.id,
      timeout: 5 * 60_000,
    })
    .catch(() => null);

  if (!submission) return;

  await helper.client.api.interactions.deferMessageUpdate(submission.id, submission.token);

  const selectedNodeGuids: string[] = [];
  for (let i = 1; i <= menus.length; i++) {
    const menu = helper.client.utils.getModalComponent(submission, `season_tree_${i}`, ComponentType.StringSelect);
    if (menu?.values.length) selectedNodeGuids.push(...menu.values);
  }

  state.selectedNodeGuids[tree.guid] = selectedNodeGuids;
  state.createdAt = Date.now();
  states.set(key, state);

  await helper.client.api.interactions.editReply(submission.application_id, submission.token, {
    components: [renderSeasonCalculator(helper, data, season, state, key)],
    flags: MessageFlags.IsComponentsV2,
  });
}

async function syncPlannerData(
  helper: InteractionHelper,
  seasonGuid: string,
  currentCandles: number,
  hasPass: boolean,
  dailiesDone: boolean,
) {
  const settings = await helper.client.schemas.getUser(helper.user);
  settings.plannerData ??= PlannerDataService.createEmpty();
  settings.plannerData.currencies.seasonCurrencies[seasonGuid] ??= { candles: 0, hearts: 0 };
  settings.plannerData.currencies.seasonCurrencies[seasonGuid].candles = currentCandles;

  settings.plannerData.seasonPasses = hasPass
    ? PlannerDataService.addToGuidString(settings.plannerData.seasonPasses, seasonGuid)
    : PlannerDataService.removeFromGuidString(settings.plannerData.seasonPasses, seasonGuid);

  if (dailiesDone) {
    settings.plannerData["season.checkin"] ??= {};
    settings.plannerData["season.checkin"][seasonGuid] = DateTime.now().setZone(zone).toISODate()!;
    settings.markModified("plannerData.season.checkin");
  }

  settings.plannerData.date = new Date().toISOString();
  settings.markModified("plannerData.currencies.seasonCurrencies");
  await settings.save();
}

function calculateSeasonDays(remaining: number, hasPass: boolean, dailiesDone: boolean) {
  if (remaining <= 0) return 0;
  const daily = hasPass ? PASS_DAILY_SEASON_CANDLES : BASE_DAILY_SEASON_CANDLES;
  if (!dailiesDone && remaining <= daily) return 0;

  return (dailiesDone ? 0 : 1) + Math.ceil(Math.max(remaining - (dailiesDone ? 0 : daily), 0) / daily);
}

function getSeasonTrees(season: ISeason): Array<{ tree: ISpiritTree; name: string }> {
  return [
    ...season.spirits.map((spirit) =>
      spirit.tree && spirit.type !== SpiritType.Guide ? { tree: spirit.tree, name: getTreeName(spirit.tree) } : null,
    ),
    ...(season.includedTrees ?? []).map((tree) => ({ tree, name: getTreeName(tree) })),
  ].filter((item): item is { tree: ISpiritTree; name: string } => Boolean(item));
}

function getSelectedNodes(data: ISkyData, state: SeasonCalculatorState) {
  return getNodesByGuid(data, Object.values(state.selectedNodeGuids).flat());
}

function getNodesByGuid(data: ISkyData, guids: string[]) {
  const selected = new Set(guids);
  return data.nodes.items.filter((node) => selected.has(node.guid));
}

function getTreeName(tree: ISpiritTree) {
  return (
    tree.spirit?.name ?? tree.travelingSpirit?.spirit.name ?? tree.specialVisitSpirit?.spirit.name ?? tree.name ?? "Season Guide"
  );
}

function treeCostSummary(tree: ISpiritTree) {
  return `Total tree seasonal cost: ${CostUtils.treeToCostEmoji(tree, ["sh"])}`;
}

function isPassItem(node: INode) {
  return node.item?.group === "SeasonPass" || node.item?.group === "Ultimate";
}

function formatSeasonCandles(amount: number) {
  return `${amount} ${Utils.formatEmoji(currency.sc)}`;
}

function formatEmoji(id?: string, name?: string) {
  return id ? Utils.formatEmoji(id, name) : "";
}

function createCustomId(helper: InteractionHelper, action: SeasonCalculatorCustomIdData["action"], key: string, tree?: string) {
  return helper.client.utils.store.serialize(CustomId.SeasonCalculator, { action, key, tree, user: helper.user.id });
}

function trimLabel(value: string, max = 100) {
  return value.length > max ? value.slice(0, max - 1) + "…" : value;
}

function cleanupStates() {
  const now = Date.now();
  for (const [key, state] of states.entries()) {
    if (now - state.createdAt > STATE_TTL) states.delete(key);
  }
}
