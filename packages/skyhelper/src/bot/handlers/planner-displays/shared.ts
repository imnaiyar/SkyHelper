import type { ISpiritTree } from "@skyhelperbot/constants/skygame-planner";
import { generateSpiritTree, type GenerateSpiritTreeOptions, mediaGallery, mediaGalleryItem, section } from "@skyhelperbot/utils";
import type { BasePlannerHandler } from "./base.js";
import type { RawFile } from "@discordjs/rest";

/** Displays spirit's rendered tree and a button to modify it wherever it is needed */
export async function spiritTreeDisplay(tree: ISpiritTree, planner: BasePlannerHandler, opts?: GenerateSpiritTreeOptions) {
  const buffer = await generateSpiritTree(tree, opts);
  const file: RawFile = { name: "tree.png", data: buffer };
  return {
    file,
    components: [
      section(
        planner.viewbtn(planner.createCustomId({}), { label: "Modify", disabled: true }),
        planner.planner.getFormattedTreeCost(tree),
        "-# Click the `Modify` button to mark/unmark items in this spirit tree as acquired",
      ),
      mediaGallery(mediaGalleryItem("attachment://tree.png")),
    ],
  };
}
