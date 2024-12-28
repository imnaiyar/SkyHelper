import type { SeasonPrice } from "#libs/types";
import { writeFileSync } from "fs";
import { TreeDiagram } from "../classes/SpiritTree.js";

/**
 * Spirit prices of the current season (For calculator)
 */
export const SeasonPrices: { [key: string]: SeasonPrice } = {
  "Comfort of Kindness": {
    icon: "<:ComfortofKindnessCape:1295293399406084147>",
    collectibles: [
      {
        name: "Blessings Node",
        icon: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/28/Special-event-spell-icon.png",
        price: 6,
        position: "center",
        acquired: true,
        node: 1,
      },
      {
        name: "Bridge Painting",
        position: "left",
        icon: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/5/56/Comfort-of-Kindness-Painting-Prop-icon.png",
        exclusive: true,
        acquired: true,
        node: 1,
      },
      {
        position: "center",
        name: "Hair",
        icon: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/6/62/Comfort-of-Kindness-Hair-icon.png",
        price: 16,
        acquired: true,
        node: 2,
      },
      {
        name: "Blessings Node",
        icon: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/28/Special-event-spell-icon.png",
        position: "left",
        exclusive: true,
        price: 10,
        acquired: true,
        node: 2,
      },
      {
        position: "center",
        name: "Blessings Node",
        icon: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/28/Special-event-spell-icon.png",
        price: 20,
        acquired: true,
        node: 3,
      },
      {
        name: "Somethin",
        icon: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/5/5f/Comfort-of-Kindness-Chandelier-Prop-icon.png",
        position: "right",
        price: 12,
        exclusive: true,
        acquired: true,
        node: 3,
      },
      {
        position: "center",
        name: "Bow tie",
        icon: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/a/a7/Comfort-of-Kindness-Neck-Accessory-icon.png",
        price: 24,
        acquired: true,
        node: 4,
      },
      {
        name: "Blessings Node",
        icon: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/28/Special-event-spell-icon.png",
        position: "left",
        exclusive: true,
        acquired: true,
        node: 4,
      },
      {
        position: "center",
        name: "Blessings Node",
        icon: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/28/Special-event-spell-icon.png",
        price: 32,
        acquired: true,
        node: 5,
      },
      {
        name: "Cape",
        position: "left",
        exclusive: true,
        acquired: true,
        node: 5,
        icon: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/c/c8/Comfort-of-Kindness-Cape-icon.png",
      },
      {
        position: "center",
        name: "Heart",
        icon: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/5/52/Season-of-Moomin-Seasonal-Heart-icon.png",
        price: 3,
        exclusive: true,
        node: 6,
        acquired: false,
      },
    ],
  },
  "Sense of Self": {
    icon: "<:SenseofSelfNeckAccessory:1295294042258673718>",
    collectibles: [
      [{ name: "Music Sheet #41", icon: "<:MusicIcon:1262323496852131882>", price: 12, position: "center" }],
      [{ name: "Blessings Node", icon: "<:BlessingNode:1238570665267691602>", price: 18, position: "center" }],
      [{ name: "Neck Accessory", icon: "<:SenseofSelfNeckAccessory:1295294042258673718>", price: 24, position: "center" }],
      [{ name: "Blessings Node", icon: "<:BlessingNode:1238570665267691602>", price: 28, position: "center" }],
      [{ name: "Heart", icon: "<:MoominHeart:1295299241756852234>", price: 3, exclusive: true, position: "center" }],
    ],
  },
  "Spirit of Adventure": {
    icon: "<:SpiritofAdventureCape:1295294188375511082>",
    collectibles: [
      [{ name: "Blessing Node", icon: "<:BlessingNode:1238570665267691602>", price: 8, position: "center" }],
      [{ name: "Harmonica", icon: "<:SpiritofAdventureHarmonica:1295314878956830741>", price: 20, position: "center" }],
      [{ name: "Blessing Node", icon: "<:BlessingNode:1238570665267691602>", price: 26, position: "center" }],
      [{ name: "Cape", icon: "<:SpiritofAdventureCape:1295294188375511082>", price: 38, position: "center" }],
      [{ name: "Heart", icon: "<:MoominHeart:1295299241756852234>", price: 3, exclusive: true, position: "center" }],
    ],
  },
  "Inspiration of Inclusion": {
    icon: "<:InspirationofInclusionNeckAccess:1295294371876573325>",
    collectibles: [
      [
        {
          name: "Grandfather Clock",
          icon: "<:InspirationofInclusionClockPropi:1295301238304538695>",
          price: 12,
          position: "center",
        },
      ],
      [{ name: "Blessing Node", icon: "<:BlessingNode:1238570665267691602>", price: 16, position: "center" }],
      [{ name: "Painting", icon: "<:InspirationofInclusionPainting:1295301282659045447>", price: 20, position: "center" }],
      [{ name: "Blessing Node", icon: "<:BlessingNode:1238570665267691602>", price: 26, position: "center" }],
      [{ name: "Outfit", icon: "<:InspirationofInclusionOutfit:1295300513868419148>", price: 36, position: "center" }],
      [{ name: "Heart", icon: "<:MoominHeart:1295299241756852234>", price: 3, exclusive: true, position: "center" }],
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

const draw = new TreeDiagram(SeasonPrices["Comfort of Kindness"].collectibles, "Comfort of Kindness", { username: "nyr" });

writeFileSync("image.png", (await draw.drawTree()).toBuffer("image/png"));
