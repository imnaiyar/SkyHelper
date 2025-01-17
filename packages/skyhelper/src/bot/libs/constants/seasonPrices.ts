import type { SeasonPrice } from "#libs/types";

/**
 * Spirit prices of the current season (For calculator)
 */
export const SeasonPrices: { [key: string]: SeasonPrice } = {
  "Comfort of Kindness": {
    icon: "<:ComfortofKindnessCape:1295293399406084147>",
    collectibles: [
      { item: "Blessings Node", icon: "<:BlessingNode:1238570665267691602>", price: 6 },
      { item: "Hair", icon: "<:ComfortofKindnessHair:1295319528678490132>", price: 16 },
      { item: "Blessings Node", icon: "<:BlessingNode:1238570665267691602>", price: 20 },
      { item: "Bow tie", icon: "<:ComfortofKindnessNeckAccessory:1295319558441140244>", price: 24 },
      { item: "Blessings Node", icon: "<:BlessingNode:1238570665267691602>", price: 32 },
      { item: "Heart", icon: "<:MoominHeart:1295299241756852234>", price: 3, pass: true },
    ],
  },
  "Sense of Self": {
    icon: "<:SenseofSelfNeckAccessory:1295294042258673718>",
    collectibles: [
      { item: "Music Sheet #41", icon: "<:MusicIcon:1262323496852131882>", price: 12 },
      { item: "Blessings Node", icon: "<:BlessingNode:1238570665267691602>", price: 18 },
      { item: "Neck Accessory", icon: "<:SenseofSelfNeckAccessory:1295294042258673718>", price: 24 },
      { item: "Blessings Node", icon: "<:BlessingNode:1238570665267691602>", price: 28 },
      { item: "Heart", icon: "<:MoominHeart:1295299241756852234>", price: 3, pass: true },
    ],
  },
  "Spirit of Adventure": {
    icon: "<:SpiritofAdventureCape:1295294188375511082>",
    collectibles: [
      { item: "Blessing Node", icon: "<:BlessingNode:1238570665267691602>", price: 8 },
      { item: "Harmonica", icon: "<:SpiritofAdventureHarmonica:1295314878956830741>", price: 20 },
      { item: "Blessing Node", icon: "<:BlessingNode:1238570665267691602>", price: 26 },
      { item: "Cape", icon: "<:SpiritofAdventureCape:1295294188375511082>", price: 38 },
      { item: "Heart", icon: "<:MoominHeart:1295299241756852234>", price: 3, pass: true },
    ],
  },
  "Inspiration of Inclusion": {
    icon: "<:InspirationofInclusionNeckAccess:1295294371876573325>",
    collectibles: [
      { item: "Grandfather Clock", icon: "<:InspirationofInclusionClockPropi:1295301238304538695>", price: 12 },
      { item: "Blessing Node", icon: "<:BlessingNode:1238570665267691602>", price: 16 },
      { item: "Painting", icon: "<:InspirationofInclusionPainting:1295301282659045447>", price: 20 },
      { item: "Blessings Node", icon: "<:BlessingNode:1238570665267691602>", price: 26 },
      { item: "Outfit", icon: "<:InspirationofInclusionOutfit:1295300513868419148>", price: 36 },
      { item: "Heart", icon: "<:MoominHeart:1295299241756852234>", price: 3, pass: true },
    ],
  },
} as const;

export const SeasonData = {
  name: "Season of Moomin",
  icon: "<:SeasonofMoominIcon:1295323276612206602>",
  start: "14-10-2024",
  end: "29-12-2024",
  duration: 77,
  spiritsUpdated: true,
} as const;
