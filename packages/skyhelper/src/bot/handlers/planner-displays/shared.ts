import { getAllTreeNodes, type ISpiritTree } from "@skyhelperbot/constants/skygame-planner";
import {
  button,
  generateSpiritTree,
  type GenerateSpiritTreeOptions,
  mediaGallery,
  mediaGalleryItem,
  row,
  section,
  textDisplay,
} from "@skyhelperbot/utils";
import { type BasePlannerHandler } from "./base.js";
import type { RawFile } from "@discordjs/rest";
import { CustomId, store } from "@/utils/customId-store";
import { DisplayTabs, PlannerAction } from "@/types/planner";

/** Displays spirit's rendered tree and a button to modify it wherever it is needed */
export async function spiritTreeDisplay(
  { tree, planner, spiritView = true }: { tree: ISpiritTree; planner: BasePlannerHandler; spiritView?: boolean },
  opts?: GenerateSpiritTreeOptions,
) {
  const buffer = await generateSpiritTree(tree, opts);
  const file: RawFile = { name: "tree.png", data: buffer };
  const spirit = tree.spirit ?? tree.ts?.spirit ?? tree.visit?.spirit ?? tree.eventInstanceSpirit;
  /* @ts-expect-error this is a fallback, so i'm not worried */
  const name = tree.name ?? spirit?.name ?? spirit?.spirit?.name ?? "Unknown";
  const nodes = getAllTreeNodes(tree.node);

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
            planner.planner.getFormattedTreeCost(tree),
          )
        : textDisplay(name, planner.planner.getFormattedTreeCost(tree)),
      row(
        button({
          label: `${unlockAll ? "Unlock" : "Lock"} All`,
          style: unlockAll ? 3 : 4,
          emoji: { name: "✅" },
          custom_id: store.serialize(CustomId.PlannerActions, {
            action: unlockAll ? PlannerAction.UnlockTree : PlannerAction.LockTree,
            guid: tree.guid,
            gifted: null,
            actionType: null,
            navState: JSON.stringify({
              t: planner.state.t,
              it: planner.state.it,
              p: planner.state.p,
              f: planner.state.f,
              d: planner.state.d,
              b: planner.state.b,
              v: planner.state.v,
            }),
            user: planner.state.user,
          }),
        }),
        planner.viewbtn(planner.createCustomId({})),
      ),
      mediaGallery(mediaGalleryItem("attachment://tree.png")),
    ],
  };
}
