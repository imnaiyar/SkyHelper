/**
 * Transformer for SkyGame Planner data
 * This file handles processing the raw data and resolving references between objects
 */
import type {
  IArea,
  IAreaConnection,
  IEvent,
  IEventInstance,
  IEventInstanceSpirit,
  IIAP,
  IItem,
  IItemList,
  IItemListNode,
  IMapShrine,
  INode,
  IRealm,
  IReturningSpirit,
  IReturningSpirits,
  IRevisedSpiritTree,
  ISeason,
  IShop,
  ISpirit,
  ISpiritTree,
  ITravelingSpirit,
  IWingedLight,
} from "./interfaces.js";
import type { FetchedData } from "./fetcher.js";
import { APPLICATION_EMOJIS, realms_emojis, season_emojis } from "../emojis.js";
import { resolveToLuxon } from "./service.js";

/** Typeguard for filtering array, bcz .filter(Boolean) doesn't properly infer */
function notNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
// Interface for the transformed data with resolved references
export interface TransformedData {
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
  travelingSpirits: ITravelingSpirit[];
  wingedLights: IWingedLight[];
  // Map from guid to object for quick lookup
  guidMap: Map<string, any>;
}

/**
 * Transforms raw fetched data by resolving references between objects
 * @param fetchedData The raw data fetched from the repository
 * @returns Transformed data with resolved references
 */
export function transformData(fetchedData: FetchedData): TransformedData {
  // Create a map of all objects by their guid for easy reference resolution
  const guidMap = new Map<string, any>();

  // Initialize the transformed data
  const transformedData: TransformedData = {
    areas: fetchedData.areas.items,
    events: fetchedData.events.items,
    eventInstances: fetchedData.events.items.flatMap((event) => event.instances || []),
    eventInstanceSpirits: fetchedData.events.items.flatMap((event) =>
      (event.instances || []).flatMap((instance) => instance.spirits || []),
    ),
    iaps: fetchedData.iaps.items,
    items: fetchedData.items.items,
    itemLists: fetchedData.itemLists.items,
    itemListNodes: fetchedData.itemLists.items.flatMap((list) => list.items || []),
    mapShrines: fetchedData.mapShrines.items,
    nodes: fetchedData.nodes.items,
    realms: fetchedData.realms.items,
    returningSpirits: fetchedData.returningSpirits.items,
    returningSpiritsVisits: fetchedData.returningSpirits.items.flatMap((rs) => rs.spirits || []),
    seasons: fetchedData.seasons.items,
    shops: fetchedData.shops.items,
    spirits: fetchedData.spirits.items,
    spiritTrees: fetchedData.spiritTrees.items,
    travelingSpirits: fetchedData.travelingSpirits.items,
    wingedLights: fetchedData.wingedLights.items,
    guidMap,
  };

  // Register all objects in the guid map
  registerGuids(transformedData);

  // Resolve references
  resolveReferences(transformedData);

  return transformedData;
}

/**
 * Registers all objects in the guid map for easy lookup
 * @param data The transformed data
 */
function registerGuids(data: TransformedData): void {
  // Register each type of object in the map
  for (const area of data.areas) {
    data.guidMap.set(area.guid, area);
  }

  for (const event of data.events) {
    data.guidMap.set(event.guid, event);
  }

  for (const instance of data.eventInstances) {
    data.guidMap.set(instance.guid, instance);
  }

  for (const spirit of data.eventInstanceSpirits) {
    data.guidMap.set(spirit.guid, spirit);
  }

  for (const iap of data.iaps) {
    data.guidMap.set(iap.guid, iap);
  }

  for (const item of data.items) {
    data.guidMap.set(item.guid, item);
  }

  for (const list of data.itemLists) {
    data.guidMap.set(list.guid, list);
  }

  for (const node of data.itemListNodes) {
    data.guidMap.set(node.guid, node);
  }

  for (const shrine of data.mapShrines) {
    data.guidMap.set(shrine.guid, shrine);
  }

  for (const node of data.nodes) {
    data.guidMap.set(node.guid, node);
  }

  for (const realm of data.realms) {
    data.guidMap.set(realm.guid, realm);
  }

  for (const rs of data.returningSpirits) {
    data.guidMap.set(rs.guid, rs);
  }

  for (const visit of data.returningSpiritsVisits) {
    data.guidMap.set(visit.guid, visit);
  }

  for (const season of data.seasons) {
    data.guidMap.set(season.guid, season);
  }

  for (const shop of data.shops) {
    data.guidMap.set(shop.guid, shop);
  }

  for (const spirit of data.spirits) {
    data.guidMap.set(spirit.guid, spirit);
  }

  for (const tree of data.spiritTrees) {
    data.guidMap.set(tree.guid, tree);
  }

  for (const ts of data.travelingSpirits) {
    data.guidMap.set(ts.guid, ts);
  }

  for (const wl of data.wingedLights) {
    data.guidMap.set(wl.guid, wl);
  }
}

const resolveUrl = (url: string) => (url.startsWith("/assets") ? `https://sky-planner.com` + url : url);

/**
 * Resolves all references between objects
 * @param data The transformed data
 */
function resolveReferences(data: TransformedData): void {
  // Helper function to resolve a reference
  function resolveRef<T>(guidRef: string | undefined): T | undefined {
    if (!guidRef) return undefined;

    // probably already resolved
    if (typeof guidRef === "object") return guidRef;
    return data.guidMap.get(guidRef) as T;
  }

  // Helper function to resolve an array of references
  function resolveRefs<T>(guidRefs: string[] | undefined): T[] | undefined {
    if (!guidRefs) return undefined;
    return guidRefs.map((guid) => data.guidMap.get(guid) as T).filter(Boolean);
  }

  // #region data.items
  for (const item of data.items) {
    if (item.previewUrl) item.previewUrl = resolveUrl(item.previewUrl);
    const emoji = APPLICATION_EMOJIS.find((e) => e.identifiers?.includes(item.id!));
    if (emoji) {
      item.icon = emoji.id!;
    }
  }

  // #region data.realms
  for (const realm of data.realms) {
    if (realm.imageUrl) realm.imageUrl = resolveUrl(realm.imageUrl);
    if (realm.areas) {
      realm.areas = realm.areas
        .map((areaRef) => {
          const area = resolveRef<IArea>(areaRef as any);
          if (area) area.realm = realm;
          return area;
        })
        .filter(notNull);
    }

    if (realm.elder) {
      realm.elder = resolveRef<ISpirit>(realm.elder as any);
    }

    if (realm.constellation?.icons) {
      for (const icon of realm.constellation.icons) {
        if (icon.spirit) {
          icon.spirit = resolveRef<ISpirit>(icon.spirit as any);
        }
      }
    }

    // resolve icon
    const emoji: string = (realms_emojis as any)[realm.name];
    if (emoji) realm.icon = emoji;
  }

  // #region data.areas
  for (const area of data.areas) {
    if (area.imageUrl) area.imageUrl = resolveUrl(area.imageUrl);
    if (area.spirits) {
      area.spirits = area.spirits
        .map((spiritRef) => {
          const spirit = resolveRef<ISpirit>(spiritRef as any);
          if (spirit) spirit.area = area;
          return spirit;
        })
        .filter(notNull);
    }

    if (area.wingedLights) {
      area.wingedLights = area.wingedLights
        .map((wlRef) => {
          const wl = resolveRef<IWingedLight>(wlRef as any);
          if (wl) wl.area = area;
          return wl;
        })
        .filter(notNull);
    }

    if (area.rs) {
      area.rs = area.rs
        .map((rsRef) => {
          const rs = resolveRef<IReturningSpirits>(rsRef as any);
          if (rs) rs.area = area;
          return rs;
        })
        .filter(notNull);
    }

    if (area.connections) {
      area.connections = area.connections
        .map((connRef) => {
          return { area: resolveRef<IArea>(connRef.area as any) };
        })
        .filter((conn) => conn.area) as IAreaConnection[];
    }

    if (area.mapShrines) {
      area.mapShrines = area.mapShrines
        .map((shrineRef) => {
          const shrine = resolveRef<IMapShrine>(shrineRef as any);
          if (shrine) shrine.area = area;
          return shrine;
        })
        .filter(notNull);
    }
  }

  // #region data.itemListNodes
  for (const node of data.itemListNodes) {
    if (node.item) {
      const item = resolveRef<IItem>(node.item as any);
      node.item = item!;
      if (item) {
        if (!item.listNodes) item.listNodes = [];
        item.listNodes.push(node);
      }
    }
  }

  // #region data.nodes
  for (const node of data.nodes) {
    if (node.item) {
      const item = resolveRef<IItem>(node.item as any);
      node.item = item;
      if (item) {
        if (!item.nodes) item.nodes = [];
        item.nodes.push(node);
      }
    }

    if (node.nw) {
      node.nw = resolveRef<INode>(node.nw as any);
      node.nw!.prev = node;
    }

    if (node.ne) {
      node.ne = resolveRef<INode>(node.ne as any);
      node.ne!.prev = node;
    }

    if (node.n) {
      node.n = resolveRef<INode>(node.n as any);
      node.n!.prev = node;
    }

    // Find root node
    let current = node;
    while (current.prev) {
      current = current.prev;
    }
    node.root = current;

    // resolve cost into single `currency` prop
    (["c", "h", "ac", "ec", "sc", "sh"] as const).forEach((key) => {
      if (node[key]) node.currency = { type: key, amount: node[key] };
    });
  }

  // #region data.seasons
  for (const season of data.seasons) {
    if (season.imageUrl) season.imageUrl = resolveUrl(season.imageUrl);
    if (season.spirits) {
      season.spirits = season.spirits
        .map((spiritRef) => {
          const spirit = resolveRef<ISpirit>(spiritRef as any);
          if (spirit) spirit.season = season;
          return spirit;
        })
        .filter(notNull);
    }

    if (season.shops) {
      season.shops = season.shops
        .map((shopRef) => {
          const shop = resolveRef<IShop>(shopRef as any);
          if (shop) shop.season = season;
          return shop;
        })
        .filter(notNull);
    }

    if (season.includedTrees) {
      season.includedTrees = season.includedTrees
        .map((treeRef) => {
          return resolveRef<ISpiritTree>(treeRef as any);
        })
        .filter(notNull);
    }

    // resolve icons
    const emoji: string = (season_emojis as any)[season.shortName];
    if (emoji) season.icon = emoji;
  }

  //#region data.spiritTrees
  for (const tree of data.spiritTrees) {
    if (tree.node) {
      const node = resolveRef<INode>(tree.node as any);
      tree.node = node!;
      if (node) node.spiritTree = tree;
    }
  }

  //#region data.spirits
  for (const spirit of data.spirits) {
    if (spirit.imageUrl) spirit.imageUrl = resolveUrl(spirit.imageUrl);
    if (spirit.tree) {
      const tree = resolveRef<ISpiritTree>(spirit.tree as any);
      spirit.tree = tree;
      if (tree) tree.spirit = spirit;
    }

    if (spirit.treeRevisions) {
      spirit.treeRevisions = spirit.treeRevisions
        .map((revisionRef) => {
          const revision = resolveRef<IRevisedSpiritTree>(revisionRef as any);
          if (revision) revision.spirit = spirit;
          return revision;
        })
        .filter(notNull);
    }

    // try to find spirits expression icon as spirits icon
    const nn = data.nodes.find(
      (n) => ["Emote", "Stance", "Call"].includes(n.item?.type || "") && n.root?.spiritTree?.guid === spirit.tree?.guid,
    );
    if (nn) spirit.icon = nn.item?.icon;
    // If there is no expression for the spirit, use the root node's item icon
    else if (spirit.tree?.node.item?.icon) spirit.icon = spirit.tree.node.item.icon;
  }

  // #region data.travelingSpirits
  const totalCount: Record<string, number> = {};
  // Resolve traveling spirit references
  for (const [i, ts] of data.travelingSpirits.entries()) {
    ts.number = i + 1;
    if (ts.spirit) {
      const spirit = resolveRef<ISpirit>(ts.spirit as any);
      ts.spirit = spirit!;
      if (spirit) {
        spirit.ts ??= [];
        spirit.ts.push(ts);
      }
    }

    totalCount[ts.spirit.name] ??= 0;
    totalCount[ts.spirit.name]++;
    ts.visit = totalCount[ts.spirit.name];

    if (ts.tree) {
      const tree = resolveRef<ISpiritTree>(ts.tree as any);
      ts.tree = tree!;
      if (tree) tree.ts = ts;
    }
  }

  // #region data.returningSpirits
  for (const rs of data.returningSpirits) {
    if (rs.spirits) {
      rs.spirits = rs.spirits
        .map((visitRef) => {
          const visit = resolveRef<IReturningSpirit>(visitRef as any);
          if (visit) visit.return = rs;
          return visit;
        })
        .filter(notNull);
    }
  }

  // #region data.returningSpiritsVisits
  for (const visit of data.returningSpiritsVisits) {
    if (visit.spirit) {
      const spirit = resolveRef<ISpirit>(visit.spirit as any);
      visit.spirit = spirit!;
      if (spirit) {
        if (!spirit.returns) spirit.returns = [];
        spirit.returns.push(visit);
      }
    }

    if (visit.tree) {
      const tree = resolveRef<ISpiritTree>(visit.tree as any);
      visit.tree = tree!;
      if (tree) tree.visit = visit;
    }
  }

  // #region data.events
  for (const event of data.events) {
    if (event.instances) {
      event.instances = event.instances
        .map((instanceRef) => {
          const instance = resolveRef<IEventInstance>(instanceRef.guid);
          if (instance) instance.event = event;
          return instance;
        })
        .filter(notNull)
        .sort((a, b) => resolveToLuxon(b.date).toMillis() - resolveToLuxon(a.date).toMillis());
    }
  }

  // #region data.eventInstances
  for (const instance of data.eventInstances) {
    if (instance.shops) {
      instance.shops = instance.shops
        .map((shopRef) => {
          const shop = resolveRef<IShop>(shopRef as any);
          if (shop) shop.event = instance;
          return shop;
        })
        .filter((s): s is IShop => Boolean(s));
    }

    if (instance.spirits) {
      instance.spirits = instance.spirits
        .map((spiritRef) => {
          const spirit = resolveRef<IEventInstanceSpirit>(spiritRef as any);
          if (spirit) spirit.eventInstance = instance;
          return spirit;
        })
        .filter(notNull);
    }
  }

  // #region data.eventInstanceSpirits
  for (const eventSpirit of data.eventInstanceSpirits) {
    if (eventSpirit.spirit) {
      const spirit = resolveRef<ISpirit>(eventSpirit.spirit as any);
      eventSpirit.spirit = spirit!;
      if (spirit) {
        if (!spirit.events) spirit.events = [];
        spirit.events.push(eventSpirit);
      }
    }

    if (eventSpirit.tree) {
      const tree = resolveRef<ISpiritTree>(eventSpirit.tree as any);
      eventSpirit.tree = tree!;
      if (tree) tree.eventInstanceSpirit = eventSpirit;
    }
  }

  // #region data.shops
  for (const shop of data.shops) {
    if (shop.iaps) {
      shop.iaps = shop.iaps
        .map((iapRef) => {
          const iap = resolveRef<IIAP>(iapRef as any);
          if (iap) iap.shop = shop;
          return iap;
        })
        .filter(notNull);
    }

    if (shop.itemList) {
      const itemList = resolveRef<IItemList>(shop.itemList as any);
      shop.itemList = itemList;
      if (itemList) itemList.shop = shop;
    }

    if (shop.spirit) {
      shop.spirit = resolveRef<ISpirit>(shop.spirit as any);
    }
  }

  // #region data.iaps
  for (const iap of data.iaps) {
    if (iap.items) {
      iap.items = iap.items
        .map((itemRef) => {
          const item = resolveRef<IItem>(itemRef as any);
          if (item) {
            if (!item.iaps) item.iaps = [];
            item.iaps.push(iap);
          }
          return item;
        })
        .filter(notNull);
    }
  }

  // #region data.itemLists
  for (const list of data.itemLists) {
    if (list.items) {
      list.items = list.items
        .map((nodeRef) => {
          const node = resolveRef<IItemListNode>(nodeRef as any);
          if (node) node.itemList = list;
          return node;
        })
        .filter(notNull);
    }
  }

  // Recursively walk through the node tree and set season on items
  function walkNodeTree(node: INode, season: ISeason) {
    if (node.item) {
      node.item.season = season;
    }

    if (node.nw) walkNodeTree(node.nw, season);
    if (node.ne) walkNodeTree(node.ne, season);
    if (node.n) walkNodeTree(node.n, season);
  }

  // Link season items
  for (const season of data.seasons) {
    // Spirit tree items
    for (const spirit of season.spirits || []) {
      if (!spirit?.tree?.node) continue;

      if (spirit.tree?.node) {
        walkNodeTree(spirit.tree.node, season);
      }
    }

    // IAP items
    for (const shop of season.shops || []) {
      for (const iap of shop.iaps || []) {
        for (const item of iap.items || []) {
          item.season = season;
        }
      }
    }
  }
}
