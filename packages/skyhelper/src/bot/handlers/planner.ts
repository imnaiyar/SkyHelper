import { SkyPlannerData } from "@skyhelperbot/constants";
import { SpiritsDisplay } from "./planner-displays/spirits/spirits.js";
import { DisplayTabs, type NavigationState } from "./planner-displays/base.js";
import { RealmsDisplay } from "./planner-displays/realms.js";
import { ItemsDisplay } from "./planner-displays/items.js";
import { SeasonsDisplay } from "./planner-displays/seasons.js";
import { EventsDisplay } from "./planner-displays/events.js";
import { WingedLightsDisplay } from "./planner-displays/wingedlights.js";
import { ShopsDisplay } from "./planner-displays/shops.js";
import { AreasDisplay } from "./planner-displays/areas.js";
import { HomeDisplay } from "./planner-displays/home.js";
import { TSDisplay } from "./planner-displays/spirits/ts.js";
import { ReturningSpiritDisplay } from "./planner-displays/spirits/rs.js";

// Navigation state interface to track user's position

export const getSpiritHandler = (d = "normal") => {
  switch (d) {
    case "normal":
    default:
      return SpiritsDisplay;
    case "ts":
      return TSDisplay;
    case "rs":
      return ReturningSpiritDisplay;
  }
};
const displayClasses = (d?: string) => ({
  [DisplayTabs.Events]: EventsDisplay,
  [DisplayTabs.Realms]: RealmsDisplay,
  [DisplayTabs.Items]: ItemsDisplay,
  [DisplayTabs.Seasons]: SeasonsDisplay,
  [DisplayTabs.Spirits]: getSpiritHandler(d),
  [DisplayTabs.Shops]: ShopsDisplay,
  [DisplayTabs.WingedLights]: WingedLightsDisplay,
  [DisplayTabs.Areas]: AreasDisplay,
  [DisplayTabs.Home]: HomeDisplay,
});

/**
 * Main handler for planner navigation
 */
export async function handlePlannerNavigation(state: NavigationState) {
  const { t, user } = state;

  const data = await SkyPlannerData.getSkyGamePlannerData();
  const handler = displayClasses(state.d)[t];
  // eslint-disable-next-line
  if (!handler) throw new Error("Invalid display tab");

  const instance = new handler(data, SkyPlannerData, { ...state, user });
  const result = await instance.handle();
  return {
    ...result,
    components: [t !== DisplayTabs.Home ? instance.createTopCategorySelect(t, user) : null, ...(result.components ?? [])].filter(
      (s) => !!s,
    ),
  };
}
