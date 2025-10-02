import type { NavigationState } from "../base.js";
import { NestingWorkshopDisplay } from "./nesting.js";
import { ShopsDisplay } from "./shops.js";

export function getShopDisplay(state?: NavigationState) {
  switch (state?.d ?? "nesting") {
    case "nesting":
    default:
      return NestingWorkshopDisplay;
    case "shops":
      return ShopsDisplay;
  }
}
