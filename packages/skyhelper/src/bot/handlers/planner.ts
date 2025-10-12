import { SkyPlannerData } from "@skyhelperbot/constants";
import { SpiritsDisplay } from "./planner-displays/spirits/spirits.js";
import { DisplayTabs, type NavigationState } from "./planner-displays/base.js";
import { RealmsDisplay } from "./planner-displays/realms.js";
import { ItemsDisplay } from "./planner-displays/items.js";
import { SeasonsDisplay } from "./planner-displays/seasons.js";
import { EventsDisplay } from "./planner-displays/events.js";
import { WingedLightsDisplay } from "./planner-displays/wingedlights.js";
import { ShopsDisplay } from "./planner-displays/shops/shops.js";
import { AreasDisplay } from "./planner-displays/areas.js";
import { HomeDisplay } from "./planner-displays/home.js";
import { TSDisplay } from "./planner-displays/spirits/ts.js";
import { ReturningSpiritDisplay } from "./planner-displays/spirits/rs.js";
import { NestingWorkshopDisplay } from "./planner-displays/shops/nesting.js";
import { ShopHomeDisplay } from "./planner-displays/shops/home.js";
import * as Sentry from "@sentry/node";
import type { UserSchema } from "@/types/schemas";
import type { SkyHelper } from "@/structures";
import type { APIUser } from "discord-api-types/v10";
import { enrichDataWithUserProgress, PlannerDataHelper } from "@skyhelperbot/constants/skygame-planner";

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

function getShopDisplay(d?: string) {
  switch (d) {
    case "nesting":
      return NestingWorkshopDisplay;
    case "shops":
      return ShopsDisplay;
    default:
      return ShopHomeDisplay;
  }
}

const displayClasses = (d?: string) => ({
  [DisplayTabs.Events]: EventsDisplay,
  [DisplayTabs.Realms]: RealmsDisplay,
  [DisplayTabs.Items]: ItemsDisplay,
  [DisplayTabs.Seasons]: SeasonsDisplay,
  [DisplayTabs.Spirits]: getSpiritHandler(d),
  [DisplayTabs.Shops]: getShopDisplay(d),
  [DisplayTabs.WingedLights]: WingedLightsDisplay,
  [DisplayTabs.Areas]: AreasDisplay,
  [DisplayTabs.Home]: HomeDisplay,
});

/**
 * Main handler for planner navigation
 */
export async function handlePlannerNavigation(state: Omit<NavigationState, "user">, user: APIUser, client: SkyHelper) {
  const { t } = state;
  // for debugging purposes
  Sentry.setContext("Planner Navigation State", { ...state });

  const baseData = await SkyPlannerData.getSkyGamePlannerData();
  const settings = await client.schemas.getUser(user);

  // Initialize user planner data if it doesn't exist
  if (!settings.plannerData) {
    settings.plannerData = PlannerDataHelper.createEmpty();
    await settings.save();
  }

  // Enrich data with user-specific progress
  const data = enrichDataWithUserProgress(baseData, settings.plannerData);

  const handler = displayClasses(state.d)[t];
  // eslint-disable-next-line
  if (!handler) throw new Error("Invalid display tab");

  const instance = new handler(data, SkyPlannerData, { ...state, user: user.id }, settings, client);
  const result = await instance.handle();
  return {
    ...result,
    components: [t !== DisplayTabs.Home ? instance.createTopCategorySelect(t) : null, ...(result.components ?? [])].filter(
      (s) => !!s,
    ),
  };
}
