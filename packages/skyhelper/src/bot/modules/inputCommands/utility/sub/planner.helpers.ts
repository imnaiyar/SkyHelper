import { DisplayTabs, type NavigationState } from "@/handlers/planner-displays/base";
import type { PlannerAssetData } from "@skyhelperbot/constants/skygame-planner";
import { FilterType, serializeFilters } from "@/handlers/planner-displays/filter.manager";

export function searchHelper(
  data: { type: string; name: string; guid: string },
  pdata: PlannerAssetData,
): Omit<NavigationState, "user"> | null {
  // Handle type prefixes for special cases
  const typeRegex = /^(TS#|SV)/;
  const typeMatch = typeRegex.exec(data.type);
  const baseType = typeMatch ? typeMatch[1] : data.type;

  switch (baseType) {
    case "Realm":
      return { t: DisplayTabs.Realms, it: data.guid };

    case "Area":
      return { t: DisplayTabs.Areas, it: data.guid };

    case "Spirit":
      return { t: DisplayTabs.Spirits, it: data.guid };

    case "Season":
      return { t: DisplayTabs.Seasons, it: data.guid };

    case "Event":
      return { t: DisplayTabs.Events, it: data.guid };

    case "Item":
      return { t: DisplayTabs.Items, it: data.guid };

    case "TS#": {
      const t = pdata.travelingSpirits.find((ts) => ts.guid === data.guid);
      const index = t
        ? `tree${[t.tree, ...(t.spirit.treeRevisions ?? []), ...(t.spirit.returns ?? []), ...(t.spirit.ts ?? [])].findIndex((x) => x.guid === t.guid).toString()}`
        : "";
      // Traveling Spirit - navigate to Spirits tab with with ts tree selected
      return { t: DisplayTabs.Spirits, i: index, it: t?.spirit.guid };
    }

    case "SV":
      // Returning Spirit (Special Visit) - navigate to Spirits tab with RS display
      return { t: DisplayTabs.Spirits, d: "rs", it: data.guid };

    case "IAP": {
      const shops = pdata.shops.filter((s) => s.iaps?.some((i) => i.guid === data.guid));
      return { t: DisplayTabs.Shops, d: "shops", f: serializeFilters(new Map([[FilterType.Shops, shops.map((s) => s.guid)]])) };
    }
    case "Shop":
      // Shop - navigate to Shops tab with specific shop filter
      return {
        t: DisplayTabs.Shops,
        d: "shops",
        f: serializeFilters(new Map([[FilterType.Shops, [data.guid]]])),
      };

    case "WingedLight":
      return { t: DisplayTabs.WingedLights, it: data.guid };

    default:
      return null;
  }
}
