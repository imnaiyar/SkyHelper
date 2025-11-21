import { zone } from "@skyhelperbot/constants";
import { SpiritsDisplay } from "./spirits/spirits.js";
import { RealmsDisplay } from "./realms.js";
import { ItemsDisplay } from "./items.js";
import { SeasonsDisplay } from "./seasons.js";
import { EventsDisplay } from "./events.js";
import { WingedLightsDisplay } from "./wingedlights.js";
import { ShopsDisplay } from "./shops/shops.js";
import { AreasDisplay } from "./areas.js";
import { HomeDisplay } from "./home.js";
import { TSDisplay } from "./spirits/ts.js";
import { SpecialVisitDisplay } from "./spirits/sv.js";
import { NestingWorkshopDisplay } from "./shops/nesting.js";
import { ShopHomeDisplay } from "./shops/home.js";
import * as Sentry from "@sentry/node";
import type { SkyHelper } from "@/structures";
import type { APIUser } from "discord-api-types/v10";
import { DisplayTabs, type NavigationState } from "@/types/planner";
import { ProfileDisplay } from "./profile.js";
import type { UserSchema } from "@/types/schemas";
import { DateTime } from "luxon";
import { FavouriteDisplay } from "./favourites.js";
import { PlannerService } from "./helpers/planner.service.js";
import { PlannerDataService } from "./helpers/data.service.js";
import { fetchSkyData } from "./fetcher.js";
import type { ISkyData } from "skygame-data";
import { performance } from "node:perf_hooks";

// Navigation state interface to track user's position

export const getSpiritHandler = (d = "normal") => {
  switch (d) {
    case "normal":
    default:
      return SpiritsDisplay;
    case "ts":
      return TSDisplay;
    case "sv":
      return SpecialVisitDisplay;
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

    settings.plannerData ??= PlannerDataService.createEmpty();
    const data = PlannerDataService.resolveProgress(await fetchSkyData(client), settings.plannerData);
    await plannerPreChecks(settings, data);

    const handler = displayClasses(state.d)[t];
    // eslint-disable-next-line
    if (!handler) throw new Error("Invalid display tab");

    const instance = new handler(data, { ...state, user: user.id }, settings, client);
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

async function plannerPreChecks(settings: UserSchema, data: ISkyData) {
  const currentSeason = PlannerService.getCurrentSeason(data);
  const now = DateTime.now().setZone(zone);
  for (const [id, value] of Object.entries(settings.plannerData!.currencies.seasonCurrencies)) {
    const season = data.seasons.items.find((s) => s.guid === id);

    // delete the entry if season has ended
    if (season && now > season.endDate) {
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

  const events = PlannerService.getEvents(data).current;
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

// #region exports
export * from "./areas.js";
export * from "./base.js";
export * from "./breakdown.js";
export * from "./events.js";
export * from "./favourites.js";
export * from "./fetcher.js";
export * from "./filter.manager.js";
export * from "./home.js";
export * from "./items.js";
export * from "./profile.js";
export * from "./realms.js";
export * from "./seasons.js";
export * from "./shared.js";
export * from "./wingedlights.js";
export * from "./spirits/base.js";
export * from "./spirits/sv.js";
export * from "./spirits/spirits.js";
export * from "./spirits/ts.js";
export * from "./shops/config.js";
export * from "./shops/home.js";
export * from "./shops/nesting.js";
export * from "./shops/shared.js";
export * from "./shops/shops.js";

// helpers
export * from "./helpers/action.utils.js";
export * from "./helpers/cost.utils.js";
export * from "./helpers/data.service.js";
export * from "./helpers/planner.service.js";
