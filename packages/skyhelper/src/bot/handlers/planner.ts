import { SkyPlannerData, zone } from "@skyhelperbot/constants";
import { SpiritsDisplay } from "./planner-displays/spirits/spirits.js";
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
import type { SkyHelper } from "@/structures";
import type { APIUser } from "discord-api-types/v10";
import { enrichDataWithUserProgress, PlannerDataHelper, type PlannerAssetData } from "@skyhelperbot/constants/skygame-planner";
import { DisplayTabs, type NavigationState } from "../@types/planner.js";
import { ProfileDisplay } from "./planner-displays/profile.js";
import type { UserSchema } from "@/types/schemas";
import { DateTime } from "luxon";
import { FavouriteDisplay } from "./planner-displays/favourites.js";

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
  [DisplayTabs.Profile]: ProfileDisplay,
  [DisplayTabs.Favourite]: FavouriteDisplay,
});

/**
 * Main handler for planner navigation
 */
export async function handlePlannerNavigation(state: Omit<NavigationState, "user">, user: APIUser, client: SkyHelper) {
  const { t } = state;
  // for debugging purposes
  const scope = new Sentry.Scope();
  scope.setContext("Planner Navigation State", { ...state, user: user.id });
  try {
    const settings = await client.schemas.getUser(user);

    settings.plannerData ??= PlannerDataHelper.createEmpty();

    const data = await SkyPlannerData.getSkyGamePlannerDataWithForUser(settings.plannerData);

    await plannerPreChecks(settings, data);

    const handler = displayClasses(state.d)[t];
    // eslint-disable-next-line
    if (!handler) throw new Error("Invalid display tab");

    const instance = new handler(data, SkyPlannerData, { ...state, user: user.id }, settings, client);
    const result = await instance.handle();
    return {
      ...result,
      components: [
        t !== DisplayTabs.Home && t !== DisplayTabs.Profile ? instance.createTopCategorySelect(t) : null,
        ...(result.components ?? []),
      ].filter((s) => !!s),
    };
  } catch (err) {
    Sentry.captureException(err, scope);
    throw err;
  }
}

async function plannerPreChecks(settings: UserSchema, data: PlannerAssetData) {
  const currentSeason = SkyPlannerData.getCurrentSeason(data);
  const now = DateTime.now().setZone(zone);
  for (const [id, value] of Object.entries(settings.plannerData!.currencies.seasonCurrencies)) {
    const season = data.seasons.find((s) => s.guid === id);

    // delete the entry if season has ended
    if (season && now > SkyPlannerData.resolveToLuxon(season.endDate).endOf("day")) {
      // convert the currencies to regular candles
      settings.plannerData!.currencies.candles += value.candles;
      settings.plannerData!.currencies.hearts += value.hearts ?? 0;

      // delete the entry
      // eslint-disable-next-line
      delete settings.plannerData!.currencies.seasonCurrencies[id];
    }
  }

  if (currentSeason && !settings.plannerData!.currencies.seasonCurrencies[currentSeason.guid]) {
    settings.plannerData!.currencies.seasonCurrencies[currentSeason.guid] = { candles: 0, hearts: 0 };
    settings.markModified("plannerData.currencies.seasonCurrencies");
  }

  const events = SkyPlannerData.getEvents(data).current;
  for (const id of Object.keys(settings.plannerData!.currencies.eventCurrencies)) {
    // delete the entry if event has ended
    // eslint-disable-next-line
    if (!events.find((e) => e.instance.guid === id)) delete settings.plannerData!.currencies.eventCurrencies[id];
  }

  if (events.length) {
    for (const { instance } of events) {
      if (!settings.plannerData!.currencies.eventCurrencies[instance.guid]) {
        settings.plannerData!.currencies.eventCurrencies[instance.guid] = { tickets: 0 };
        settings.markModified("plannerData.currencies.eventCurrencies");
      }
    }
  }
  // TODO: potentially add other relevent pre-checks
  await settings.save();
}
