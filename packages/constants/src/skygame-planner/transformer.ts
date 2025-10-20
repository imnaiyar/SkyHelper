/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/**
 * Transformer for SkyGame Planner data
 */
import {
  type IArea,
  type IAreaConnection,
  type IEvent,
  type IEventInstance,
  type IEventInstanceSpirit,
  type IIAP,
  type IItem,
  type IItemList,
  type IItemListNode,
  type IMapShrine,
  type INode,
  type IRealm,
  type IReturningSpirit,
  type IReturningSpirits,
  type ISeason,
  type IShop,
  type ISpirit,
  type ISpiritTree,
  type ITravelingSpirit,
  type IWingedLight,
  type IGuid,
  type ISpiritTreeTier,
} from "./interfaces.js";
import type { FetchedData } from "./fetcher.js";
import { APPLICATION_EMOJIS, realms_emojis, season_emojis } from "../emojis.js";
import { getAllNodes, getTreeTierNodes, resolvePlannerUrl, resolveToLuxon } from "./service.js";

/** Typeguard for filtering array */
function notNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/** Mappings of currency keys with thier names */
export const currencyMap = {
  c: "Candles",
  h: "Hearts",
  sc: "Season Candles",
  sh: "Season Hearts",
  ac: "Ascended Candles",
  ec: "Event Tickets",
};

export interface PlannerAssetData {
  areas: IArea[];
  events: IEvent[];
  eventInstances: IEventInstance[];
  eventInstanceSpirits: IEventInstanceSpirit[];
  iaps: IIAP[];
  items: IItem[];
  itemLists: IItemList[];
  itemListNodes: IItemListNode[];
  mapShrines: IMapShrine[];
  nodes: INode[];
  realms: IRealm[];
  returningSpirits: IReturningSpirits[];
  returningSpiritsVisits: IReturningSpirit[];
  seasons: ISeason[];
  shops: IShop[];
  spirits: ISpirit[];
  spiritTrees: ISpiritTree[];
  spiritTreeTiers: ISpiritTreeTier[];
  travelingSpirits: ITravelingSpirit[];
  wingedLights: IWingedLight[];
  guidMap: Map<string, any>;
}

/**
 * Main entrypoint: transform raw fetched data into resolved graph
 */
export function transformData(fetchedData: FetchedData): PlannerAssetData {
  const guidMap = new Map<string, any>();

  const transformedData: PlannerAssetData = {
    areas: fetchedData.areas.items,
    events: fetchedData.events.items,
    eventInstances: fetchedData.events.items.flatMap((e) => e.instances || []),
    // eslint-disable-next-line
    eventInstanceSpirits: fetchedData.events.items.flatMap((e) => e.instances || []).flatMap((i) => i.spirits || []),
    iaps: fetchedData.iaps.items,
    items: fetchedData.items.items,
    itemLists: fetchedData.itemLists.items,
    // eslint-disable-next-line
    itemListNodes: fetchedData.itemLists.items.flatMap((l) => l.items || []),
    mapShrines: fetchedData.mapShrines.items,
    nodes: fetchedData.nodes.items,
    realms: fetchedData.realms.items,
    returningSpirits: fetchedData.returningSpirits.items,
    returningSpiritsVisits: fetchedData.returningSpirits.items.flatMap((rs) => rs.spirits),
    seasons: fetchedData.seasons.items,
    shops: fetchedData.shops.items,
    spirits: fetchedData.spirits.items,
    spiritTrees: fetchedData.spiritTrees.items,
    spiritTreeTiers: fetchedData.spiritTreeTiers.items,
    travelingSpirits: fetchedData.travelingSpirits.items,
    wingedLights: fetchedData.wingedLights.items,
    guidMap,
  };

  registerGuids(transformedData);
  resolveReferences(transformedData);

  return transformedData;
}

// #region helpers

function fixUrl(obj: { imageUrl?: string }) {
  if (obj.imageUrl) obj.imageUrl = resolvePlannerUrl(obj.imageUrl);
}

function registerAll<T extends IGuid>(arr: T[], map: Map<string, any>) {
  for (const obj of arr) map.set(obj.guid, obj);
}

function registerGuids(data: PlannerAssetData) {
  (
    [
      data.areas,
      data.events,
      data.eventInstances,
      data.eventInstanceSpirits,
      data.iaps,
      data.items,
      data.itemLists,
      data.itemListNodes,
      data.mapShrines,
      data.nodes,
      data.realms,
      data.returningSpirits,
      data.returningSpiritsVisits,
      data.seasons,
      data.shops,
      data.spirits,
      data.spiritTrees,
      data.travelingSpirits,
      data.wingedLights,
    ] as IGuid[][]
  )
    // eslint-disable-next-line
    .forEach((arr) => registerAll(arr, data.guidMap));
}

function resolveRef<T>(guidRef: string | undefined, data: PlannerAssetData): T | undefined {
  if (!guidRef) return undefined;
  if (typeof guidRef === "object") return guidRef as T;
  return data.guidMap.get(guidRef) as T;
}

function resolveArray<T>(
  refs: Array<string | undefined> | undefined,
  data: PlannerAssetData,
  mapFn: (resolved: T) => void = () => {},
): T[] {
  return (refs || [])
    .map((ref) => {
      const resolved = resolveRef<T>(ref as any, data);
      if (resolved) mapFn(resolved);
      return resolved;
    })
    .filter(notNull);
}

function linkOne<T, P>(
  ref: string | undefined,
  parent: P,
  prop: keyof P,
  data: PlannerAssetData,
  backProp?: keyof T | ((ref: T) => void),
): T | undefined {
  const resolved = resolveRef<T>(ref, data);
  if (resolved) {
    (parent as any)[prop] = resolved;
    if (backProp) {
      if (typeof backProp === "function") backProp(resolved);
      else (resolved as any)[backProp] = parent;
    }
  }
  return resolved;
}

/* -------------------------------------------------------------------------- */
/*                          Reference Resolution Pass                         */
/* -------------------------------------------------------------------------- */

function resolveReferences(data: PlannerAssetData): void {
  /* ------------------------------ items ------------------------------ */
  // #region data.items
  for (const item of data.items) {
    if (item.previewUrl) item.previewUrl = resolvePlannerUrl(item.previewUrl);
    const emoji = APPLICATION_EMOJIS.find((e) => e.identifiers?.includes(item.id!));
    if (emoji) item.emoji = emoji.id!;
  }

  /* ------------------------------ realms ----------------------------- */
  // #region data.realms
  for (const realm of data.realms) {
    fixUrl(realm);
    realm.areas = resolveArray(realm.areas as any, data, (a) => (a.realm = realm));
    linkOne<ISpirit, IRealm>(realm.elder as any, realm, "elder", data);
    realm.constellation?.icons.forEach((icon) => linkOne<ISpirit, typeof icon>(icon.spirit as any, icon, "spirit", data));
    realm.emoji = (realms_emojis as any)[realm.name] || realm.emoji;
  }

  /* ------------------------------- areas ----------------------------- */
  // #region data.areas
  for (const area of data.areas) {
    fixUrl(area);
    area.spirits = resolveArray(area.spirits as any, data, (s) => (s.area = area));
    area.wingedLights = resolveArray(area.wingedLights as any, data, (wl) => (wl.area = area));
    area.rs = resolveArray(area.rs as any, data, (rs) => (rs.area = area));
    area.connections = (area.connections || [])
      .map((c) => ({ area: resolveRef<IArea>(c.area as any, data) }))
      .filter((c) => c.area) as IAreaConnection[];
    area.mapShrines = resolveArray(area.mapShrines as any, data, (s) => (s.area = area));
  }

  /* ---------------------------- spiritTrees -------------------------- */
  // #region data.spiritTrees
  for (const tree of data.spiritTrees) {
    const node = linkOne<INode, ISpiritTree>(tree.node as any, tree, "node", data, "spiritTree");
    if (node) node.spiritTree = tree;
    const tier = linkOne<ISpiritTreeTier, ISpiritTree>(tree.tier as any, tree, "tier", data, "spiritTree");
    if (tier) {
      const nodes = getTreeTierNodes(tier);
      nodes.forEach((n) => (n.spiritTree = tree));
      tree.tier = tier;
    }
  }
  /* -------------------------- spiritTreeTiers ------------------------ */
  // #region data.spiritTreeTiers
  for (const tier of data.spiritTreeTiers) {
    for (const row of tier.rows) {
      row.forEach((n, i) => {
        if (!n) return;
        const node = data.nodes.find((nn) => nn.guid === (n as any));
        if (!node) throw new Error("Recieve unknown node");
        row[i] = node;
        node.root = node;
      });
    }
    if (!tier.prev) tier.root = tier;

    if (typeof tier.next === "string") {
      const next = data.spiritTreeTiers.find((t) => t.guid === (tier.next as any));
      if (!next) throw new Error("unknown next tier", tier.next);
      tier.next = next;
      next.prev = tier;
      next.root = tier.root;
    }
  }

  /* --------------------------- itemListNodes ------------------------- */
  for (const node of data.itemListNodes) {
    const item = linkOne<IItem, IItemListNode>(node.item as any, node, "item", data);
    if (item) {
      item.listNodes ??= [];
      item.listNodes.push(node);
    }
  }

  /* ------------------------------- nodes ----------------------------- */
  // #region data.nodes
  const CURRENCY_KEYS = ["c", "h", "ac", "ec", "sc", "sh"] as const;
  for (const node of data.nodes) {
    linkOne<IItem, INode>(node.item as any, node, "item", data, (item) => {
      item.nodes ??= [];
      item.nodes.push(node);
    });

    node.nw = linkOne<INode, INode>(node.nw as any, node, "nw", data, "prev");
    node.ne = linkOne<INode, INode>(node.ne as any, node, "ne", data, "prev");
    node.n = linkOne<INode, INode>(node.n as any, node, "n", data, "prev");

    // root discovery
    let current = node;
    while (current.prev) current = current.prev;
    node.root = current;

    // currency resolution
    for (const key of CURRENCY_KEYS) {
      if (node[key]) {
        node.currency = { type: key, amount: node[key] };
        break;
      }
    }
  }

  /* ------------------------------ spirits ---------------------------- */
  // #region data.spirits
  for (const spirit of data.spirits) {
    fixUrl(spirit);
    linkOne<ISpiritTree, ISpirit>(spirit.tree as any, spirit, "tree", data, "spirit");
    spirit.treeRevisions = resolveArray(spirit.treeRevisions as any, data, (r) => (r.spirit = spirit));

    // icon from emote node
    const nn = data.nodes.find(
      (n) => ["Emote", "Stance", "Call"].includes(n.item?.type || "") && n.root?.spiritTree?.guid === spirit.tree?.guid,
    );
    // get the first node for fallback emoji
    const node = spirit.tree ? getAllNodes(spirit.tree)[0] : null;
    spirit.emoji = nn?.item?.emoji || node?.item?.emoji || spirit.emoji;
  }
  /* ------------------------------ seasons ---------------------------- */
  // #region data.seasons
  for (const season of data.seasons) {
    fixUrl(season);
    season.spirits = resolveArray(season.spirits as any, data, (s) => (s.season = season));
    season.shops = resolveArray(season.shops as any, data, (shop) => (shop.season = season));
    season.includedTrees = resolveArray(season.includedTrees as any, data);
    season.emoji = (season_emojis as any)[season.shortName] || season.emoji;
  }

  /* -------------------------- travelingSpirits ----------------------- */
  // #region data.travelingSpirits
  const totalCount: Record<string, number> = {};
  data.travelingSpirits.forEach((ts, i) => {
    ts.number = i + 1;
    linkOne<ISpirit, ITravelingSpirit>(ts.spirit as any, ts, "spirit", data, (spirit) => {
      spirit.ts ??= [];
      spirit.ts.push(ts);
    })!;
    totalCount[ts.spirit.name] ??= 0;
    ts.visit = ++totalCount[ts.spirit.name]!;
    linkOne<ISpiritTree, ITravelingSpirit>(ts.tree as any, ts, "tree", data, "ts");
  });

  /* -------------------------- returningSpirits ----------------------- */
  // #region data.returningSpirits
  for (const rs of data.returningSpirits) {
    rs.spirits = resolveArray(rs.spirits as any, data, (visit) => (visit.return = rs));
  }

  for (const visit of data.returningSpiritsVisits) {
    linkOne<ISpirit, IReturningSpirit>(visit.spirit as any, visit, "spirit", data, (spirit) => {
      spirit.returns ??= [];
      spirit.returns.push(visit);
    });
    linkOne<ISpiritTree, IReturningSpirit>(visit.tree as any, visit, "tree", data, "visit");
  }

  /* ------------------------------- events ---------------------------- */
  // #region data.events
  for (const event of data.events) {
    event.instances = resolveArray<IEventInstance>(event.instances as any, data, (i) => (i.event = event)).sort(
      (a, b) => resolveToLuxon(b.date).toMillis() - resolveToLuxon(a.date).toMillis(),
    );
  }

  // #region data.eventInstances
  for (const instance of data.eventInstances) {
    instance.shops = resolveArray(instance.shops as any, data, (shop) => (shop.event = instance));
    instance.spirits = resolveArray(instance.spirits as any, data, (s) => (s.eventInstance = instance));
  }

  for (const es of data.eventInstanceSpirits) {
    linkOne<ISpirit, IEventInstanceSpirit>(es.spirit as any, es, "spirit", data, "events");
    linkOne<ISpiritTree, IEventInstanceSpirit>(es.tree as any, es, "tree", data, "eventInstanceSpirit");
  }

  /* ------------------------------- shops ----------------------------- */
  // #region data.shops
  for (const shop of data.shops) {
    shop.iaps = resolveArray(shop.iaps as any, data, (iap) => (iap.shop = shop));
    linkOne<IItemList, IShop>(shop.itemList as any, shop, "itemList", data, "shop");
    linkOne<ISpirit, IShop>(shop.spirit as any, shop, "spirit", data);
  }

  /* -------------------------------- iaps ----------------------------- */
  // #region data.iaps
  for (const iap of data.iaps) {
    iap.items = resolveArray(iap.items as any, data, (item) => {
      item.iaps ??= [];
      item.iaps.push(iap);
    });
  }

  /* ---------------------------- itemLists ---------------------------- */
  // #region data.itemLists
  for (const list of data.itemLists) {
    list.items = resolveArray(list.items as any, data, (n) => (n.itemList = list));
  }

  /* ---------------------- season → items linking --------------------- */

  for (const season of data.seasons) {
    // eslint-disable-next-line
    for (const spirit of season.spirits || []) {
      if (spirit.tree) {
        const nodes = getAllNodes(spirit.tree);
        nodes.forEach((node) => {
          if (node.item) node.item.season = season;
        });
      }
    }
    for (const shop of season.shops || []) {
      for (const iap of shop.iaps || []) {
        for (const item of iap.items || []) {
          item.season = season;
        }
      }
    }
  }
}
