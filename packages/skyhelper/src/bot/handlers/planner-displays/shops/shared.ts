import type { IIAP, IItemList, IShop } from "@skyhelperbot/constants/skygame-planner";
import type { BasePlannerHandler } from "../base.js";
import { button, row, section, textDisplay } from "@skyhelperbot/utils";
import type { APIComponentInContainer } from "discord-api-types/v10";
import { emojis } from "@skyhelperbot/constants";

export function getIGCnIApDisplay(
  item: IItemList,
  planner: BasePlannerHandler,
  type: "igc",
  highlighted?: boolean,
): APIComponentInContainer[];
export function getIGCnIApDisplay(
  item: IIAP,
  planner: BasePlannerHandler,
  type: "iap",
  highlighted?: boolean,
): APIComponentInContainer[];
export function getIGCnIApDisplay(
  item: IIAP | IItemList,
  planner: BasePlannerHandler,
  type: "iap" | "igc",
  highlighted = false,
): APIComponentInContainer[] {
  if (type === "igc") {
    const as = item as IItemList;
    return [
      textDisplay(
        `${highlighted ? "#" : "##"} ${as.shop ? getshopname(as.shop) : "IGC"}${highlighted ? planner.formatemoji(emojis.leftarryello) + planner.formatemoji(emojis.leftarryello) : ""}`,
      ),
      ...as.items.map((l) =>
        section(
          // TODO: handle acquiring the item
          planner.viewbtn(planner.createCustomId({ it: l.guid }), { label: "Acquire", disabled: true }),
          `${planner.formatemoji(l.item.emoji, l.item.name)} ${l.item.name}`,
          planner.planner.formatCosts(l),
        ),
      ),
    ];
  } else {
    const as = item as IIAP;
    return [
      textDisplay(
        `${highlighted ? "#" : "##"} ${as.name ?? "In-App Purchase"}${highlighted ? planner.formatemoji(emojis.leftarryello) + planner.formatemoji(emojis.leftarryello) : ""}`,
        [
          `$ ${as.price ?? "N/A"} | ${as.returning ? "Returning" : "New"} IAP`,
          as.sc || as.c || as.sc ? planner.planner.formatCosts(as) : null,
          as.sp ? `${planner.formatemoji(emojis.spicon, "SeasonPass")} x${as.sp}` : null,
          as.items?.map((i) => `${planner.formatemoji(i.emoji, i.name)} ${i.name}`).join(" \u2022 ") ?? null,
        ]
          .filter((s) => !!s)
          .join("\n"),
      ),

      /** TODO:  handle buying/recieving the item */
      row(
        button({
          custom_id: planner.createCustomId({ it: as.guid, d: "Buy" }),
          emoji: { name: "🛒" },
          label: "Bought",
          style: 3,
        }),
        button({
          custom_id: planner.createCustomId({ it: as.guid, d: "Receive" }),
          label: "Received",
          emoji: { name: "🎁" },
          style: 2,
        }),
      ),
    ];
  }
}

function getshopname(shop: IShop) {
  if (shop.name) return shop.name;
  if (shop.event) return `${shop.event.event.name} Shop`;
  if (shop.season) return `${shop.season.name} Shop`;
  return "Shop";
}
