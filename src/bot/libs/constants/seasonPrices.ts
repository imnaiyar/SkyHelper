import type { SeasonPrice } from "#libs/types";

/**
 * Spirit prices of the current season (For calculator)
 */
export const SeasonPrices: { [key: string]: SeasonPrice } = {
  "The Cellist's Beginnings": {
    icon: "<:CellistB:1262326135216406559>",
    collectibles: [
      { item: "Hair", icon: "<:CellitBHair:1262322324963852308>", price: 20 },
      { item: "Blessings Node", icon: "<:BlessingNode:1238570665267691602>", price: 26 },
      { item: "Outfit", icon: "<:CellitBOutfit:1262322298145341581>", price: 32 },
      { item: "Heart", icon: "<:DuetHeart:1262318647376871424>", price: 3, pass: true },
    ],
  },
  "The Pianist's Beginnings": {
    icon: "<:PianistB:1262326115024769107>",
    collectibles: [
      { item: "Blessing Node", icon: "<:BlessingNode:1238570665267691602>", price: 14 },
      { item: "Hair", icon: "<:PianistBHair:1262322985134461029>", price: 20 },
      { item: "Blessings Node", icon: "<:BlessingNode:1238570665267691602>", price: 24 },
      { item: "Small Blue Rug", icon: "<:SmallBlueRug:1262322964062277666>", price: 30 },
      { item: "Heart", icon: "<:DuetHeart:1262318647376871424>", price: 3, pass: true },
    ],
  },
  "The Musicians' Legacy": {
    icon: "<:MusicianL:1262326097341714514>",
    collectibles: [
      { item: "Music Sheet #40", icon: "<:MusicIcon:1262323496852131882>", price: 14 },
      { item: "Blessing Node", icon: "<:BlessingNode:1238570665267691602>", price: 24 },
      { item: "Instrument", icon: "<:MusiciansLInstrument:1262323472760049724>", price: 34 },
      { item: "Heart", icon: "<:DuetHeart:1262318647376871424>", price: 3, pass: true },
    ],
  },
  "The Cellist's Flourishing": {
    icon: "<:CellistF:1262326155508318380>",
    collectibles: [
      { item: "Small Pink Rug", icon: "<:SmallPinkRug:1262323794715082824>", price: 16 },
      { item: "Blessing Node", icon: "<:BlessingNode:1238570665267691602>", price: 18 },
      { item: "Cape", icon: "<:CellistFCape:1262323774997659673>", price: 22 },
      { item: "Blessings Node", icon: "<:BlessingNode:1238570665267691602>", price: 24 },
      { item: "Heart", icon: "<:DuetHeart:1262318647376871424>", price: 3, pass: true },
    ],
  },
  "The Pianist's Flourishing": {
    icon: "<:PianistF:1262326075380334623>",
    collectibles: [
      { item: "Blessing Nodes", icon: "<:BlessingNode:1238570665267691602>", price: 12 },
      { item: "Shoes", icon: "<:PianistFShoes:1262324120532549692>", price: 22 },
      { item: "Blessing Node", icon: "<:BlessingNode:1238570665267691602>", price: 26 },
      { item: "Heart", icon: "<:DuetHeart:1262318647376871424>", price: 3, pass: true },
    ],
  },
} as const;

export const SeasonData = {
  name: "Season of Duet",
  icon: "<:SODuet:1262310944332189768>",
  start: "15-07-2024",
  end: "29-09-2024",
  duration: 77,
  spiritsUpdated: true,
} as const;
