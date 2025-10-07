import { DisplayTabs, type NavigationState } from "@/handlers/planner-displays/base";
import { FilterType, serializeFilters } from "@/handlers/planner-displays/filter.manager";
import { PLANNER_DATA } from "@/modules/commands-data/utility-commands";
import type { Command } from "@/structures";
import { CustomId, store } from "@/utils/customId-store";
import { SkyPlannerData } from "@skyhelperbot/constants";
import type { PlannerAssetData } from "@skyhelperbot/constants/skygame-planner";
import { searchHelper } from "./sub/planner.helpers.js";
import { handlePlannerNavigation } from "@/handlers/planner";
import { MessageFlags } from "discord-api-types/v10";
import { exportPlannerData } from "./sub/planner-data.js";
//  this is mappings of available display tabs that will show on search, which users can quick jump to
const tab_mappings = (data: PlannerAssetData) => [
  ...Object.entries(DisplayTabs).map(([n, v]) => ({ name: n, path: { t: v } })),
  { name: "Traveling Spirits", path: { t: DisplayTabs.Spirits, d: "ts" } },
  { name: "Special Visits", path: { t: DisplayTabs.Spirits, d: "rs" } },
  {
    name: "Shop - Aviary Event Store",
    path: {
      t: DisplayTabs.Shops,
      d: "shops",
      f: serializeFilters(
        new Map([
          [FilterType.Shops, data.shops.filter((s) => s.permanent === "event").map((s) => s.guid)],
          [FilterType.SpiritTrees, ["TbheKd0E45"]],
        ]),
      ),
    },
  },
  {
    name: "Shop - Concert Halls",
    path: { t: DisplayTabs.Shops, d: "shops", f: serializeFilters(new Map([[FilterType.SpiritTrees, ["4uhy67a14a"]]])) },
  },
  {
    name: "Shop - Harmony Hall",
    path: {
      t: DisplayTabs.Shops,
      d: "shops",
      f: serializeFilters(
        new Map([
          [FilterType.Shops, data.shops.filter((s) => s.permanent === "harmony").map((s) => s.guid)],
          [FilterType.SpiritTrees, ["bkdgyeUcbZ"]],
        ]),
      ),
    },
  },
  {
    name: "Shop - Secret Area (Office)",
    path: {
      t: DisplayTabs.Shops,
      d: "shops",
      f: serializeFilters(new Map([[FilterType.Shops, data.shops.filter((s) => s.permanent === "office").map((s) => s.guid)]])),
    },
  },
  {
    name: "Shop - Nesting Workshop",
    path: { t: DisplayTabs.Shops, d: "nesting" },
  },
];
export default {
  autocomplete: async ({ helper, options }) => {
    const sub = options.getSubcommand();
    if (sub !== "search") throw new Error("Invalid subcommand");
    const query = options.getString("query", true).toLowerCase();
    const data = await SkyPlannerData.getSkyGamePlannerData();
    const createidentifier = (d: NavigationState) =>
      store.serialize(CustomId.PlannerTopLevelNav, {
        back: null,
        r: null,
        user: null,
        f: null,
        it: null,
        d: null,
        i: null,
        p: null,
        ...d,
      });
    const tabs = tab_mappings(data)
      .filter((t) => t.name.toLowerCase().includes(query))
      .map((t) => {
        return {
          name: `Tab: ${t.name}`,
          value: createidentifier(t.path),
        };
      });
    const results = SkyPlannerData.searchEntitiesByName(query, data).map((op) => {
      const route = searchHelper(op, data);
      return {
        name: `${op.type}: ${op.name}`,
        value: route ? createidentifier(route) : "unknown",
      };
    });
    await helper.respond({ choices: [...tabs, ...results].slice(0, 25) });
  },
  interactionRun: async ({ helper, options }) => {
    const sub = options.getSubcommand();
    await helper.defer();
    switch (sub) {
      case "search": {
        const routehash = options.getString("query", true);
        if (routehash === "unknown") {
          await helper.editReply({
            content: "Ooops! We failed to find where this came from.\n-# Looks like the result got lost in the wind tunnels.",
          });
          return;
        }
        const dsl = store.deserialize(routehash);
        if (dsl.id !== CustomId.PlannerTopLevelNav) throw new Error("Got Wrong Id");
        // @ts-expect-error maan, wtvsd
        const response = await handlePlannerNavigation({ ...dsl.data, user: helper.user.id });
        await helper.editReply({ ...response, flags: MessageFlags.IsComponentsV2 });
        return;
      }
      case "home": {
        const response = await handlePlannerNavigation({ t: DisplayTabs.Home, user: helper.user.id });
        await helper.editReply({ ...response, flags: MessageFlags.IsComponentsV2 });
        return;
      }
      case "import": {
        // TODO: Implement file upload handling
        await helper.editReply({
          content:
            "**Import Planner Data**\n\nTo import your data:\n1. Export your data from sky-planner.com or use a previously exported .json file\n2. Send the JSON data as a message in this channel\n\n-# Note: Full import functionality with file attachments will be available soon.",
        });
        return;
      }
      case "export": {
        try {
          const exportData = await exportPlannerData(helper.user.id);
          const jsonString = JSON.stringify(exportData, null, 2);

          // Create a file buffer
          const buffer = Buffer.from(jsonString, "utf-8");

          await helper.editReply({
            content: "**Export Planner Data**\n\nHere's your planner data exported as a JSON file. You can:\n- Import it back to this bot later\n- Use it on sky-planner.com website\n\n-# Keep this file safe to backup your progress!",
            files: [{ name: "planner-data.json", data: buffer }],
          });
        } catch (error) {
          await helper.editReply({
            content: `Failed to export data: ${error instanceof Error ? error.message : "Unknown error"}`,
          });
        }
        return;
      }
      default:
        await helper.editReply({ content: "Not Implemented Yet" });
        return;
    }
  },
  ...PLANNER_DATA,
} satisfies Command<true>;
