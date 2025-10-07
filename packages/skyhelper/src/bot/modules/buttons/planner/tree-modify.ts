import { CustomId, store } from "@/utils/customId-store";
import { defineButton } from "@/structures";
import { MessageFlags, ComponentType, ButtonStyle } from "discord-api-types/v10";
import { SkyPlannerData } from "@skyhelperbot/constants";
import { getPlannerData, toggleNodeUnlock } from "@/schemas/PlannerData";
import { button, container, row, section, textDisplay } from "@skyhelperbot/utils";
import { setLoadingState } from "@/utils/loading";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";

/**
 * Button handler for modifying spirit tree progress
 * Allows users to mark/unmark items and nodes as acquired
 */
export default defineButton({
  id: CustomId.PlannerTreeModify,
  data: { name: "planner-tree-modify" },

  async execute(interaction, _t, helper, { tree: treeGuid }) {
    // Set loading state
    const getLoading = setLoadingState(interaction.message.components!, interaction.data.custom_id);
    await helper.update({ components: getLoading });

    // Get the tree data
    const data = await SkyPlannerData.getSkyGamePlannerData();
    const tree = data.spiritTrees.find((t) => t.guid === treeGuid);

    if (!tree) {
      await helper.editReply({
        content: "Error: Tree not found",
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    // Get user's current progress
    let userData = await getPlannerData(helper.user.id);

    // Collect all nodes from the tree
    const nodes: any[] = [];
    function collectNodes(node: any) {
      nodes.push(node);
      if (node.nw) collectNodes(node.nw);
      if (node.ne) collectNodes(node.ne);
      if (node.n) collectNodes(node.n);
    }
    // Collect nodes from tree root
    collectNodes(tree.node);

    // Function to render the UI
    const renderUI = (userProgressData: any) => {
      // Create node selection buttons (show first 25 nodes due to Discord limits)
      const nodeButtons = nodes.slice(0, 25).map((node) => {
        const isUnlocked = userProgressData.unlockedNodes.includes(node.guid);
        const itemName = node.item?.name ?? node.c?.toString() ?? "Unknown";

        return button({
          custom_id: store.serialize(CustomId.Default, {
            data: `toggle_node:${node.guid}`,
            user: helper.user.id,
          }),
          label: `${isUnlocked ? "✓" : "○"} ${itemName}`.slice(0, 80),
          style: isUnlocked ? ButtonStyle.Success : ButtonStyle.Secondary,
        });
      });

      // Split buttons into rows of 5
      const buttonRows: any[] = [];
      for (let i = 0; i < nodeButtons.length; i += 5) {
        const rowButtons = nodeButtons.slice(i, i + 5);
        buttonRows.push({ type: 1, components: rowButtons });
      }

      // Count unlocked items
      const unlockedCount = nodes.filter((n) => userProgressData.unlockedNodes.includes(n.guid)).length;

      // Add back button
      const backButton = button({
        custom_id: store.serialize(CustomId.Default, {
          data: "back",
          user: helper.user.id,
        }),
        label: "Done",
        style: ButtonStyle.Primary,
      });

      return {
        components: [
          container(
            textDisplay(
              `# Modify: ${tree.name}`,
              `-# ${unlockedCount}/${nodes.length} unlocked • Click items to toggle`,
            ),
            ...buttonRows,
            { type: 1, components: [backButton] },
          ),
        ],
        flags: MessageFlags.IsComponentsV2,
      };
    };

    // Initial render
    await helper.editReply(renderUI(userData));

    // Set up collector for interactions
    const collector = helper.client.componentCollector({
      filter: (i: any) => {
        const parsed = store.deserialize(i.data.custom_id);
        return parsed.id === CustomId.Default && (i.member?.user?.id ?? i.user?.id) === helper.user.id;
      },
      idle: 120_000, // 2 minutes
      message: interaction.message,
    });

    collector.on("collect", async (i: any) => {
      const compHelper = new InteractionHelper(i, helper.client);
      const parsed = store.deserialize(i.data.custom_id);
      const interactionData = (parsed.data as any).data;

      if (interactionData === "back") {
        collector.stop("done");
        return;
      }

      if (interactionData?.startsWith("toggle_node:")) {
        const nodeGuid = interactionData.split(":")[1];

        // Toggle the node
        await toggleNodeUnlock(helper.user.id, nodeGuid);

        // Refresh user data
        userData = await getPlannerData(helper.user.id);

        // Re-render UI
        await compHelper.update(renderUI(userData));
      }
    });

    collector.on("end", () => {
      // Interaction ended, no cleanup needed
    });
  },
});
