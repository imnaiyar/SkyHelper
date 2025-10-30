import { getAllNodes, type INode, type ISpiritTree, type ISpiritTreeTier } from "@skyhelperbot/constants/skygame-planner";
import {
  button,
  generateSpiritTree,
  generateSpiritTreeTier,
  type GenerateSpiritTreeOptions,
  mediaGallery,
  mediaGalleryItem,
  row,
  section,
  textDisplay,
} from "@skyhelperbot/utils";
import { type BasePlannerHandler } from "./base.js";
import type { RawFile } from "@discordjs/rest";
import { DisplayTabs, PlannerAction } from "@/types/planner";
import { createActionId } from "../planner-utils.js";

/** Displays spirit's rendered tree and a button to modify it wherever it is needed */
export async function spiritTreeDisplay(
  { tree, planner, spiritView = true }: { tree: ISpiritTree; planner: BasePlannerHandler; spiritView?: boolean },
  opts?: GenerateSpiritTreeOptions,
) {
  // Check if tree uses tier system or classic node system
  let buffer: Buffer;
  if (tree.tier) {
    // New tier-based system
    buffer = await generateSpiritTreeTier(tree as ISpiritTree & { tier: ISpiritTreeTier }, opts);
  } else if (tree.node) {
    // Classic node-based system
    buffer = await generateSpiritTree(tree as ISpiritTree & { node: INode }, opts);
  } else {
    throw new Error("Tree must have either tier or node structure");
  }
  const file: RawFile = { name: "tree.png", data: buffer };
  const spirit = tree.spirit ?? tree.ts?.spirit ?? tree.visit?.spirit ?? tree.eventInstanceSpirit;
  /* @ts-expect-error this is a fallback, so i'm not worried */
  const name = tree.name ?? spirit?.name ?? spirit?.spirit?.name ?? "Unknown";
  const nodes = getAllNodes(tree);

  const unlockAll = nodes.some((n) => !n.item?.unlocked && !n.item?.autoUnlocked);

  return {
    file,
    components: [
      spiritView
        ? section(
            planner.viewbtn(planner.createCustomId({ t: DisplayTabs.Spirits, it: spirit?.guid }), {
              label: "View",
              disabled: !spirit,
            }),
            name,
            planner.planner.getFormattedTreeCostWithProgress(tree) ?? "",
          )
        : textDisplay(name, planner.planner.getFormattedTreeCostWithProgress(tree) ?? ""),
      row(
        button({
          label: `${unlockAll ? "✓ Unlock" : "x Lock"} All`,
          style: unlockAll ? 3 : 4,
          custom_id: createActionId({
            action: unlockAll ? PlannerAction.UnlockTree : PlannerAction.LockTree,
            guid: tree.guid,
            navState: planner.state,
          }),
        }),
        planner.viewbtn(createActionId({ action: PlannerAction.ModifyTree, navState: planner.state, guid: tree.guid }), {
          label: "Unlock Nodes",
        }),
      ),
      mediaGallery(mediaGalleryItem("attachment://tree.png")),
    ],
  };
}
