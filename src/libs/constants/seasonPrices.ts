import type { SeasonPrice } from "#libs/types";

/**
 * Spirit prices of the current season (For calculator)
 */
export const SeasonPrices: { [key: string]: SeasonPrice } = {
  "Nesting Nook": {
    icon: "<:NestingNook:1238574218007019641>",
    cosmetics: [
      { item: "Shelf", icon: "<:NookShelf:1238570642773774386>", price: 16 },
      { item: "Blessings Node", icon: "<:BlessingNode:1238570665267691602>", price: 20 },
      { item: "Spice Rack", icon: "<:NookSpiceRack:1238570686126231603>", price: 26 },
      { item: "Blessings Node", canSkip: true, icon: "<:BlessingNode:1238570665267691602>", price: 30 },
      { item: "Heart", icon: "<:NestingHeart:1238570703079342101>", price: 3, pass: true },
    ],
  },
  "Nesting Atrium": {
    icon: "<:NestingAtrium:1238574235778285679>",
    cosmetics: [
      { item: "Floor Light", icon: "<:AtriumFloorLight:1238571195515801683>", price: 16 },
      { item: "Blessings Node", icon: "<:BlessingNode:1238570665267691602>", price: 20 },
      { item: "Nesting Atrium Hair", icon: "<:AtriumHair:1238571213559828480>", price: 24 },
      { item: "Blessings Node", canSkip: true, icon: "<:BlessingNode:1238570665267691602>", price: 28 },
      { item: "Heart", icon: "<:NestingHeart:1238570703079342101>", price: 3, pass: true },
    ],
  },
  "Nesting Loft": {
    icon: "<:NestingLoft:1238574252534399078>",
    cosmetics: [
      { item: "Blessings Node", icon: "<:BlessingNode:1238570665267691602>", price: 12 },
      { item: "Chair", icon: "<:LoftChair:1238571566514831440>", price: 20 },
      { item: "Blessing Nodes", icon: "<:BlessingNode:1238570665267691602>", price: 28 },
      { item: "Paintings", icon: "<:LoftPaintings:1238571584118063104>", price: 36 },
      { item: "Heart", icon: "<:NestingHeart:1238570703079342101>", price: 3, pass: true },
    ],
  },
  "Nesting Solarium": {
    icon: "<:NestingSolarium:1238574270163058781> ",
    cosmetics: [
      { item: "Blessings Node", icon: "<:BlessingNode:1238570665267691602>", price: 14 },
      { item: "Hanging Planter", icon: "<:SolariumHangingPlanter:1238571757280169994>", price: 22 },
      { item: "Blessings Node", icon: "<:BlessingNode:1238570665267691602>", price: 30 },
      { item: "Table", icon: "<:SolariumTable:1238571738980155453>", price: 34 },
      { item: "Heart", icon: "<:NestingHeart:1238570703079342101>", price: 3, pass: true },
    ],
  },
} as const;

export const SeasonData = {
  name: "Season of Duet",
  icon: "<:SODuet:1262310944332189768>",
  start: "15-07-2024",
  end: "29-09-2024",
  duration: 77,
  spiritsUpdated: false
} as const;
