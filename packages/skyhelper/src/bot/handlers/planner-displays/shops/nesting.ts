// ------------------------------------------------------------------------------------------------------------------------------ //
/** Some of the codes/logic here are adapted from SkyGame Planner by Silverfeelin
 * {@see https://github.com/Silverfeelin/SkyGame-Planner/blob/master/src/app/components/shops/shop-nesting/shop-nesting.component.ts} */
// --------------------------------------------------------------------------------------------------------------------------------- //

/* eslint-disable @typescript-eslint/no-redundant-type-constituents */ // idk what is wrong with this rule
import { button, container, row, section, separator, textDisplay } from "@skyhelperbot/utils";
import { BasePlannerHandler } from "../base.js";
import { zone, type SkyPlannerData } from "@skyhelperbot/constants";
import { nestingconfigs, type IRotationItem, type IRotation } from "@skyhelperbot/constants/skygame-planner";
import { DateTime } from "luxon";
import type { ResponseData } from "@/utils/classes/InteractionUtil";
import type { IItemListNode, INestingConfig } from "@skyhelperbot/constants/skygame-planner";
import { ComponentType, MessageFlags } from "discord-api-types/v10";
import { spiritTreeDisplay } from "../shared.js";
interface IRotationDisplay {
  guid: string;
  title: string;
  items: Array<IRotationItem | IItemListNode>;
}

export class NestingWorkshopDisplay extends BasePlannerHandler {
  private currentRotation: INestingConfig["rotations"][number] = { guid: "", items: [] };
  private rotations = new Map<string, IRotationDisplay>();
  private permanentItems: IRotation = [];
  private currentRotationIndex = 0;
  private workshopItems = new Map<string, IRotationItem>();
  /** Mapped to item's guid */
  private workshopItemsListNode = new Map<string, IItemListNode>();
  /** Mapped to list node's guid */
  private workshopListNode = new Map<string, IItemListNode>();
  private legacyRotations = new Map<string, IRotationDisplay>();
  private challengeSpirits: SkyPlannerData.ISpirit[] = [];
  private legacyFreeItems: IRotationDisplay = { guid: "QYzVVxhNlt", title: "Intro", items: [] };
  private legacyCorrectionItems: IRotationDisplay = {
    guid: "b0c0trdeVx",
    title: "Corrections",
    items: [],
  };

  override handle() {
    this.initializeNestingData();

    if (this.state.f === "permanent") {
      return this.showPermanentItems();
    }

    if (this.state.f === "rotation") {
      const legacy = this.state.i === "l";
      if (this.state.it) {
        const rotation =
          this.legacyFreeItems.guid === this.state.it
            ? this.legacyFreeItems
            : this.legacyCorrectionItems.guid === this.state.it
              ? this.legacyCorrectionItems
              : legacy
                ? this.legacyRotations.get(this.state.it)!
                : this.rotations.get(this.state.it)!;

        return this.showRotationItems(rotation, legacy);
      }
      return this.showRotations([...this.rotations.values()]);
    }

    // l = legacy
    if (this.state.f === "l") {
      return this.showLegacyItems();
    }

    if (this.state.f === "challange") {
      return this.showChallengeSpirits();
    }

    // Default: Show overview
    return this.showOverview();
  }

  private initializeNestingData(): void {
    // Calculate current rotation based on weeks since April 15, 2024
    const startDate = DateTime.fromISO("2024-04-15", { zone }).startOf("week");
    const currentWeek = DateTime.now().setZone(zone).startOf("week");
    const weeksBetween = Math.ceil(currentWeek.diff(startDate, "weeks").weeks);
    this.currentRotationIndex = weeksBetween % nestingconfigs.rotations.length;
    this.currentRotation = nestingconfigs.rotations[this.currentRotationIndex]!;
    this.permanentItems = nestingconfigs.permanentItems;

    // items list
    const listnodes = this.data.itemLists.find((l) => l.guid === "AKNI67tVW-");
    if (listnodes) {
      this.workshopItemsListNode = new Map(listnodes.items.map((i) => [i.item.guid, i]));
      this.workshopListNode = new Map(listnodes.items.map((i) => [i.guid, i]));
    }

    // Map items from data
    for (const [index, rotation] of nestingconfigs.rotations.entries()) {
      for (const item of rotation.items) {
        const gameItem = this.data.items.find((i) => i.guid === item.guid);
        if (gameItem) {
          item.item = gameItem;
        }

        this.workshopItems.set(item.guid, item);
      }
      this.rotations.set(rotation.guid, { ...rotation, title: `Rotation ${index + 1}` });
    }

    for (const item of this.permanentItems) {
      const gameItem = this.data.items.find((i: any) => i.guid === item.guid);
      if (gameItem) {
        item.item = gameItem;
      }

      this.workshopItems.set(item.guid, item);
    }

    this.legacyRotations = nestingconfigs.rotations.reduce(
      (map, rotation, index) =>
        map.set(rotation.guid, {
          guid: rotation.guid,
          title: `Rotation ${index + 1}`,
          items: rotation.items.map((r) => this.workshopItemsListNode.get(r.guid)).filter((s) => !!s),
        }),
      new Map<string, IRotationDisplay>(),
    );

    this.legacyFreeItems.items = nestingconfigs.legacyFreeItems.map((guid) => this.workshopListNode.get(guid)!);

    this.legacyCorrectionItems.items = nestingconfigs.legacyCorrectionItems.map((guid) => this.workshopListNode.get(guid)!);

    // Get challenge spirits
    this.challengeSpirits = nestingconfigs.challengeSpirits
      .map((guid: string) => this.data.spirits.find((s: any) => s.guid === guid))
      .filter(Boolean) as SkyPlannerData.ISpirit[];
  }

  private showOverview(): ResponseData {
    const nextRotationDate = DateTime.now().setZone("America/Los_Angeles").startOf("week").plus({ weeks: 1 });

    return {
      components: [
        container(
          section(
            this.backbtn(this.createCustomId({ it: "", f: "", d: "", p: 1, ...this.state.b, b: null })),
            "# 🏠 Nesting Workshop",
            "A cozy workshop where you can craft home decoration props and furniture.",
            `**Estimated Current Rotation:** ${this.currentRotationIndex + 1}/${nestingconfigs.rotations.length}`,
            `**Next Rotation:** ${this.formatDateTimestamp(nextRotationDate, "R")}`,
            `-# Disclaimer: This is only an estimation of current rotation. TGC is known to shift rotations or items in rotations. If the current rotation or rotation items is not accurate, please browse through other rotations to find the correct item(s).`,
          ),
          separator(),
          row(
            button({
              custom_id: this.createCustomId({ f: "rotation" }),
              label: `Rotations (${this.rotations.size} rotations)`,
              style: 2,
              emoji: { name: "🔄" },
            }),
            button({
              custom_id: this.createCustomId({ f: "permanent" }),
              label: `Permanent Items (${this.permanentItems.length} items)`,
              style: 2,
              emoji: { name: "📌" },
            }),
          ),
          row(
            button({
              custom_id: this.createCustomId({ f: "l" }),
              label: "Workshop Legacy Rotations",
              style: 2,
              emoji: { name: "⏳" },
            }),
            button({
              custom_id: this.createCustomId({
                f: "challange",
              }),
              label: "Challenge Spirits",
              style: 2,
              emoji: { name: "⚡" },
            }),
          ),
          separator(),
          textDisplay("## Current Rotation Preview"),
          ...this.currentRotation.items
            .map((item) => [textDisplay(this.createItemTitle(item, true)), this.createItemQuantityToggles(item)])
            .flat(),
        ),
      ],
      flags: MessageFlags.IsComponentsV2,
    };
  }

  private showRotations(items: IRotationDisplay[], legacy = false): ResponseData {
    return {
      components: [
        container(
          section(
            this.backbtn(this.createCustomId({ f: "", it: "", p: 1 })),
            `# Workshop Props ${legacy ? "(Legacy)" : ""}`,
            legacy
              ? [
                  "Items with special historical pricing or availability.",
                  "-# Before patch 0.27.0 (10-10-2024), the Nesting Workshop sold some items in a quantity.",
                  "-# If you purchased items before this patch, please mark them as purchased here.",
                ].join("\n")
              : "",
          ),
          separator(),
          ...this.displayPaginatedList({
            page: this.state.p ?? 1,
            user: this.state.user,
            perpage: 5,
            items,
            itemCallback: (a) => [
              section(
                this.viewbtn(
                  this.createCustomId({
                    f: "rotation",
                    it: a.guid,
                    d: "nesting",
                    i: legacy ? "l" : "",
                    b: { ...this.state, user: null, b: null },
                  }),
                ),
                "## " + a.title,
                a.items
                  .map(
                    (i) =>
                      `${this.formatemoji(i.item!.emoji, i.item!.name)} ${i.item!.name}${"quantity" in i ? ` (X${i.quantity ?? 1})` : ""} - ${this.planner.formatCosts(i)}`,
                  )
                  .join("\n"),
              ),
            ],
          }),
        ),
      ],
    };
  }
  private showRotationItems(rotation: IRotationDisplay, legacy = false): ResponseData {
    const rotationIndex = nestingconfigs.rotations.findIndex((r) => r.guid === rotation.guid);

    const getNextRotationOccurrence = (): DateTime | null => {
      if (legacy || rotationIndex === -1) return null;

      const startDate = DateTime.fromISO("2024-04-15", { zone }).startOf("week");
      const currentWeek = DateTime.now().setZone(zone).startOf("week");
      const weeksBetween = Math.ceil(currentWeek.diff(startDate, "weeks").weeks);

      if (rotationIndex === this.currentRotationIndex) {
        const weeksUntilNextCycle = nestingconfigs.rotations.length;
        return currentWeek.plus({ weeks: weeksUntilNextCycle });
      }

      let weeksUntilRotation = rotationIndex - (weeksBetween % nestingconfigs.rotations.length);
      if (weeksUntilRotation <= 0) {
        weeksUntilRotation += nestingconfigs.rotations.length;
      }

      return currentWeek.plus({ weeks: weeksUntilRotation });
    };

    const nextOccurrence = getNextRotationOccurrence();

    return {
      components: [
        container(
          section(
            this.backbtn(this.createCustomId({ f: "", it: "", ...this.state.b, b: null })),
            `# ${rotation.title}`,
            `**Items:** ${rotation.items.length}`,
            [
              legacy ? "Legacy workshop rotation" : null,
              !legacy && rotationIndex === this.currentRotationIndex
                ? `**Current Rotation** (Estimated) - Rotates: ${this.formatDateTimestamp(
                    DateTime.now().setZone("America/Los_Angeles").startOf("week").plus({ weeks: 1 }),
                    "R",
                  )}`
                : null,
              !legacy && rotationIndex !== this.currentRotationIndex && nextOccurrence
                ? `**Estimated Next Occurrence:** ${this.formatDateTimestamp(nextOccurrence, "R")}`
                : null,
              !legacy
                ? "-# Current/Next Occurrence are only estimations. TGC is known to change things. Please verify from official sources or in-game."
                : null,
            ]
              .filter((s) => !!s)
              .join("\n"),
          ),
          separator(),
          ...this.displayPaginatedList({
            items: rotation.items,
            itemCallback: (item, _index: number) => this.createItemDisplay(item, legacy),
            perpage: 4,
          }),
        ),
      ],
      flags: MessageFlags.IsComponentsV2,
    };
  }

  private showPermanentItems(): ResponseData {
    return {
      components: [
        container(
          section(
            this.backbtn(this.createCustomId({ f: "", it: "", p: 1, ...this.state.b, b: null })),
            "# Permanent Items",
            `**Items:** ${this.permanentItems.length}`,
            "These items are always available in the workshop.",
          ),
          separator(),
          ...this.displayPaginatedList({
            items: this.permanentItems,
            itemCallback: (item: IRotationItem, _index: number) => this.createItemDisplay(item),
            perpage: 4,
          }),
        ),
      ],
      flags: MessageFlags.IsComponentsV2,
    };
  }

  private showLegacyItems(): ResponseData {
    return this.showRotations([this.legacyFreeItems, ...this.legacyRotations.values(), this.legacyCorrectionItems], true);
  }

  /*  private showItemDetails(itemGuid: string): ResponseData {
    const item = this.workshopItems.get(itemGuid);
    if (!item) {
      return { components: [container(textDisplay("Item not found"))] };
    }

    const isPermanent = this.permanentItems.some((r: any) => r.guid === itemGuid);
    const rotationIndex = nestingconfigs.rotations.findIndex((rotation: any) => rotation.some((r: any) => r.guid === itemGuid));

    return {
      components: [
        container(
          section(
            this.backbtn(this.createCustomId({ it: "" })),
            `# ${this.formatemoji(item.item?.emoji, item.item?.name)} ${item.item?.name}`,
            "Nesting workshop item",
          ),
          separator(),
          textDisplay(
            `**Availability:** ${isPermanent ? "Permanent" : `Rotation ${rotationIndex + 1}`}`,
            `**Cost:** ${this.planner.formatCosts(item)}`,
            item.item?.type ? `**Type:** ${item.item?.type}` : "",
          ),
          separator(),
          row(
            button({
              custom_id: this.createCustomId({ d: "acquire" }),
              label: "Mark as Acquired",
              style: 3,
              emoji: { name: "✅" },
            }),
            button({
              custom_id: this.createCustomId({ d: "wishlist" }),
              label: "Add to Wishlist",
              style: 2,
              emoji: { name: "⭐" },
            }),
          ),
        ),
      ],
      flags: MessageFlags.IsComponentsV2,
    };
  } */

  private createItemTitle(item: IRotationItem | IItemListNode, showCosts = false) {
    // NOTE: quantity is only in IItemListNode and ListNode is only  passed from legacy rotations
    return `${this.formatemoji(item.item?.emoji, item.item?.name)} **${item.item?.name}**${
      "quantity" in item ? ` (x${item.quantity ?? 1})` : ""
    }\n${showCosts ? this.planner.formatCosts(item) : ""}`;
  }

  private createItemQuantityToggles(item: IRotationItem | IItemListNode) {
    return row(
      this.viewbtn(this.createCustomId({ it: item.guid }), { label: "-", disabled: true }),
      this.viewbtn(this.createCustomId({ it: item.guid }), { label: "+", disabled: true }),
    );
  }

  private createItemDisplay(item: IRotationItem | IItemListNode, legacy = false) {
    if (!item.item) return [];
    const title = this.createItemTitle(item, true);
    // TODO: update this btns customId and it's  handling
    return [
      legacy
        ? section(
            this.viewbtn(this.createCustomId({}), {
              label: "Mark as Acquired",
              style: 3,
              emoji: { name: "✅" },
              disabled: true,
            }),
            title,
          )
        : textDisplay(title),
      ...(legacy ? [] : [this.createItemQuantityToggles(item)]),
      separator(false),
    ];
  }

  private async showChallengeSpirits(): Promise<ResponseData> {
    const guid = this.state.v?.[0];
    const spirit = guid ? this.challengeSpirits.find((s) => s.guid === guid)! : this.challengeSpirits[0]!;
    const { file, components } = await spiritTreeDisplay(spirit.tree!, this);

    const action = row({
      type: ComponentType.StringSelect,
      custom_id: this.createCustomId({}),
      options: this.challengeSpirits.map((s) => ({
        label: s.name,
        default: s.guid === spirit.guid,
        value: s.guid,
        emoji: s.emoji ? { id: s.emoji } : undefined,
      })),
    });
    return {
      files: [file],
      components: [
        container(
          section(
            this.backbtn(this.createCustomId({ f: "", it: "", p: 1, ...this.state.b, b: null })),
            "# Nesting Challenges",
            `${this.formatemoji(spirit.emoji, spirit.name)} ${spirit.name}`,
          ),
          separator(true, 1),
          action,
          ...components,
        ),
      ],
    };
  }
}
