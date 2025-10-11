import type { ISpiritTree } from "@skyhelperbot/constants/skygame-planner";
import {
  generateSpiritTree,
  type GenerateSpiritTreeOptions,
  mediaGallery,
  mediaGalleryItem,
  section,
  textDisplay,
} from "@skyhelperbot/utils";
import { DisplayTabs, type BasePlannerHandler } from "./base.js";
import type { RawFile } from "@discordjs/rest";

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
          )
        : textDisplay(name),
      section(
        planner.viewbtn(planner.createCustomId({}), { label: "Modify", disabled: true }),
        planner.planner.getFormattedTreeCost(tree),
        "-# Click the `Modify` button to mark/unmark items in this spirit tree as acquired",
      ),
      mediaGallery(mediaGalleryItem("attachment://tree.png")),
    ],
  };
}
