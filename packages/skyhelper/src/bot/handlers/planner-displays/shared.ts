import type { ISpiritTree } from "@skyhelperbot/constants/skygame-planner";
import { generateSpiritTree, type GenerateSpiritTreeOptions, mediaGallery, mediaGalleryItem, section } from "@skyhelperbot/utils";
import { DisplayTabs, type BasePlannerHandler } from "./base.js";
import type { RawFile } from "@discordjs/rest";
import { CustomId, store } from "@/utils/customId-store";

/** Displays spirit's rendered tree and a button to modify it wherever it is needed */
export async function spiritTreeDisplay(tree: ISpiritTree, planner: BasePlannerHandler, opts?: GenerateSpiritTreeOptions) {
  const buffer = await generateSpiritTree(tree, opts);
  const file: RawFile = { name: "tree.png", data: buffer };
  const spirit = tree.spirit ?? tree.eventInstanceSpirit ?? tree.ts?.spirit ?? tree.visit?.spirit;

  // Create custom ID for modify button
  const modifyCustomId = store.serialize(CustomId.PlannerTreeModify, {
    tree: tree.guid,
    user: planner.state.user ?? null,
  });

  return {
    file,
    components: [
      section(
        planner.viewbtn(planner.createCustomId({ t: DisplayTabs.Spirits, it: spirit?.guid }), {
          label: "View",
          disabled: !spirit,
        }),
        `# ${tree.name ?? spirit?.name ?? "Unknown"}`,
      ),
      section(
        planner.viewbtn(modifyCustomId, { label: "Modify", disabled: false }),
        planner.planner.getFormattedTreeCost(tree),
        "-# Click the `Modify` button to mark/unmark items in this spirit tree as acquired",
      ),
      mediaGallery(mediaGalleryItem("attachment://tree.png")),
    ],
  };
}
