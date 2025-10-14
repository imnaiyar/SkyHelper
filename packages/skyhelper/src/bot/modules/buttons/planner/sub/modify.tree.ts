import { handlePlannerNavigation } from "@/handlers/planner";
import { toggleNodeUnlock } from "@/handlers/planner-utils";
import type { NavigationState } from "@/types/planner";
import type { UserSchema } from "@/types/schemas";
import type { InteractionHelper } from "@/utils/classes/InteractionUtil";
import {
  currencyMap,
  enrichDataWithUserProgress,
  getTreeSpirit,
  type INode,
  type PlannerAssetData,
  PlannerDataHelper,
} from "@skyhelperbot/constants/skygame-planner";
import { ComponentType, type APIStringSelectComponent } from "discord-api-types/v10";
import { MessageFlags } from "discord-api-types/v10";

export async function modifyTreeNode(
  guid: string,
  data: PlannerAssetData,
  user: UserSchema,
  helper: InteractionHelper,
  state: NavigationState,
) {
  const enriched = enrichDataWithUserProgress(data, user.plannerData ?? PlannerDataHelper.createEmpty());
  const tree = enriched.spiritTrees.find((t) => t.guid === guid);
  if (!tree) throw new Error("Invalid Tree");
  const spirit = getTreeSpirit(tree);
  const labeled = getLabeledNodes(tree.node, 1);

  const description = `Please choose all the nodes you want to unlock.

Nodes are listed from the bottom to the top of the tree and labeled in order — for example, the first node is \`N1\`.
If a node has branches, they're labeled L (left) or R (right). Any nodes above those are labeled like \`N1.1-L\`, \`N1.2-L\`, etc.
-# 💡 Note: All nodes leading up to the selected top node will be unlocked automatically. This means even if you don't select a lower node, it will still be unlocked if you've chosen a node higher up on the same path.
`;

  const selectMenus: APIStringSelectComponent[] = [];
  const itemsPerMenu = 25;

  for (let i = 0; i < labeled.length; i += itemsPerMenu) {
    const chunk = labeled.slice(i, i + itemsPerMenu);
    const menuIndex = Math.floor(i / itemsPerMenu) + 1;
    const totalMenus = Math.ceil(labeled.length / itemsPerMenu);

    selectMenus.push({
      type: ComponentType.StringSelect,
      custom_id: `tree_${menuIndex}`,
      min_values: 0,
      placeholder: `Select nodes (Menu ${menuIndex} of ${totalMenus})`,
      options: chunk.map((l) => ({
        label: `${l.node.item?.name ?? "Unknown"}${l.node.item?.level ? ` Lvl${l.node.item.level}` : ""} (${l.label})`,
        description: l.node.currency
          ? `${l.node.currency.amount} ${(currencyMap as Record<string, string>)[l.node.currency.type]}`
          : undefined,
        value: l.node.guid,
        emoji: l.node.item?.emoji ? { id: l.node.item.emoji } : undefined,
        default: l.node.item?.unlocked,
      })),
      max_values: chunk.length,
      required: false,
    });
  }
  await helper.launchModal({
    custom_id: "modify_tree" + helper.int.id,
    title: "Modify " + (spirit ? `${spirit.name} Tree` : "Tree"),
    components: [
      { type: ComponentType.TextDisplay, content: description },
      ...selectMenus.map((select) => ({ type: ComponentType.Label as const, label: "Select Nodes", component: select })),
    ],
  });

  const submission = await helper.client
    .awaitModal({
      filter: (i) => i.data.custom_id === "modify_tree" + helper.int.id,
      timeout: 5 * 60_000,
    })
    .catch(() => null);

  if (!submission) return;
  await helper.client.api.interactions.deferMessageUpdate(submission.id, submission.token);

  // Get user and extract selected node GUIDs from all select menus
  user.plannerData ??= PlannerDataHelper.createEmpty();

  const selected: string[] = [];

  // Extract values from all select menus in the submission
  for (let i = 1; i <= selectMenus.length; i++) {
    const select = helper.client.utils.getModalComponent(submission, `tree_${i}`, ComponentType.StringSelect);
    if (select?.values.length) selected.push(...select.values);
  }

  // If no nodes selected, just navigate back
  if (!selected.length) {
    const navigate = await handlePlannerNavigation(state, helper.user, helper.client);
    await helper.client.api.interactions.editReply(submission.application_id, submission.token, navigate);
    return;
  }

  // Lock nodes above target
  labeled.forEach((l) => toggleNodeUnlock(user, l.node, selected.includes(l.node.guid)));

  user.plannerData.date = new Date().toISOString();
  await user.save();

  const navigate = await handlePlannerNavigation(state, helper.user, helper.client);
  await helper.client.api.interactions.editReply(submission.application_id, submission.token, navigate);

  // Build result message
  const resultMessage = `✅ Unlocked up to **selected nodes**`;

  await helper.client.api.interactions.followUp(submission.application_id, submission.token, {
    content: resultMessage,
    flags: MessageFlags.Ephemeral,
  });
}

function getLabeledNodes(node: INode, index: number, dir?: "R" | "L", subIndex?: number) {
  const nodes = [{ label: `N${index}` + (subIndex ? `.${subIndex}` : "") + (dir ? `-${dir}` : ""), node }];

  // If this node has branches, recursively label them with the same index
  if (node.ne) nodes.push(...getLabeledNodes(node.ne, index, "R", subIndex));
  if (node.nw) nodes.push(...getLabeledNodes(node.nw, index, "L", subIndex));

  // For the next node in the main path:
  // - If we're in a branch (dir is set), continue with subIndex incremented, starting from 1
  // - If not in a branch, increment the main index
  if (node.n) {
    if (dir) {
      nodes.push(...getLabeledNodes(node.n, index, dir, (subIndex ?? 0) + 1));
    } else {
      nodes.push(...getLabeledNodes(node.n, index + 1));
    }
  }

  return nodes;
}
