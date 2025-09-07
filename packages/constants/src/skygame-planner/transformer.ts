/**
 * Transformer for SkyGame Planner data
 * This file handles processing the raw data and resolving references between objects
 */
import {
  IArea,
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
  ISeason,
  IShop,
  ISpirit,
  ISpiritTree,
  ITravelingSpirit,
  IWingedLight,
} from "./interfaces.js";
import { FetchedData } from "./fetcher.js";

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

/**
 * Resolves all references between objects
 * @param data The transformed data
 */
function resolveReferences(data: TransformedData): void {
  // Helper function to resolve a reference
  function resolveRef<T>(guidRef: string | undefined): T | undefined {
    if (!guidRef) return undefined;
    return data.guidMap.get(guidRef) as T;
  }

  // Helper function to resolve an array of references
  function resolveRefs<T>(guidRefs: string[] | undefined): T[] | undefined {
    if (!guidRefs) return undefined;
    return guidRefs.map((guid) => data.guidMap.get(guid) as T).filter(Boolean);
  }

  // Resolve realm references
  for (const realm of data.realms) {
    if (realm.areas) {
      realm.areas = realm.areas
        .map((areaRef) => {
          const area = resolveRef<IArea>(areaRef as any);
          if (area) area.realm = realm;
          return area;
        })
        .filter(Boolean);
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
  }

  // Resolve area references
  for (const area of data.areas) {
    if (area.spirits) {
      area.spirits = area.spirits
        .map((spiritRef) => {
          const spirit = resolveRef<ISpirit>(spiritRef as any);
          if (spirit) spirit.area = area;
          return spirit;
        })
        .filter(Boolean);
    }

    if (area.wingedLights) {
      area.wingedLights = area.wingedLights
        .map((wlRef) => {
          const wl = resolveRef<IWingedLight>(wlRef as any);
          if (wl) wl.area = area;
          return wl;
        })
        .filter(Boolean);
    }

    if (area.rs) {
      area.rs = area.rs
        .map((rsRef) => {
          const rs = resolveRef<IReturningSpirits>(rsRef as any);
          if (rs) rs.area = area;
          return rs;
        })
        .filter(Boolean);
    }

    if (area.connections) {
      area.connections = area.connections
        .map((connRef) => {
          return { area: resolveRef<IArea>(connRef.area as any) };
        })
        .filter((conn) => conn.area);
    }

    if (area.mapShrines) {
      area.mapShrines = area.mapShrines
        .map((shrineRef) => {
          const shrine = resolveRef<IMapShrine>(shrineRef as any);
          if (shrine) shrine.area = area;
          return shrine;
        })
        .filter(Boolean);
    }
  }

  // Resolve season references
  for (const season of data.seasons) {
    if (season.spirits) {
      season.spirits = season.spirits
        .map((spiritRef) => {
          const spirit = resolveRef<ISpirit>(spiritRef as any);
          if (spirit) spirit.season = season;
          return spirit;
        })
        .filter(Boolean);
    }

    if (season.shops) {
      season.shops = season.shops
        .map((shopRef) => {
          const shop = resolveRef<IShop>(shopRef as any);
          if (shop) shop.season = season;
          return shop;
        })
        .filter(Boolean);
    }

    if (season.includedTrees) {
      season.includedTrees = season.includedTrees
        .map((treeRef) => {
          return resolveRef<ISpiritTree>(treeRef as any);
        })
        .filter(Boolean);
    }
  }

  // Resolve spirit references
  for (const spirit of data.spirits) {
    if (spirit.tree) {
      spirit.tree = resolveRef<ISpiritTree>(spirit.tree as any);
    }

    // Initialize arrays if they don't exist
    spirit.travels = [];
    spirit.events = [];
    spirit.returns = [];
  }

  // Resolve spirit tree references
  for (const tree of data.spiritTrees) {
    if (tree.node) {
      const node = resolveRef<INode>(tree.node as any);
      tree.node = node;
      if (node) node.spiritTree = tree;
    }

    if (tree.spirit) {
      tree.spirit = resolveRef<ISpirit>(tree.spirit as any);
    }
  }

  // Resolve traveling spirit references
  for (const ts of data.travelingSpirits) {
    if (ts.spirit) {
      const spirit = resolveRef<ISpirit>(ts.spirit as any);
      ts.spirit = spirit;
      if (spirit) {
        if (!spirit.travels) spirit.travels = [];
        spirit.travels.push(ts);
      }
    }

    if (ts.tree) {
      const tree = resolveRef<ISpiritTree>(ts.tree as any);
      ts.tree = tree;
      if (tree) tree.ts = ts;
    }
  }

  // Resolve returning spirits references
  for (const rs of data.returningSpirits) {
    if (rs.spirits) {
      rs.spirits = rs.spirits
        .map((visitRef) => {
          const visit = resolveRef<IReturningSpirit>(visitRef as any);
          if (visit) visit.return = rs;
          return visit;
        })
        .filter(Boolean);
    }
  }

  for (const visit of data.returningSpiritsVisits) {
    if (visit.spirit) {
      const spirit = resolveRef<ISpirit>(visit.spirit as any);
      visit.spirit = spirit;
      if (spirit) {
        if (!spirit.returns) spirit.returns = [];
        spirit.returns.push(visit);
      }
    }

    if (visit.tree) {
      const tree = resolveRef<ISpiritTree>(visit.tree as any);
      visit.tree = tree;
      if (tree) tree.visit = visit;
    }
  }

  // Resolve event references
  for (const event of data.events) {
    if (event.instances) {
      event.instances = event.instances
        .map((instanceRef) => {
          const instance = resolveRef<IEventInstance>(instanceRef.guid);
          if (instance) instance.event = event;
          return instance;
        })
        .filter(Boolean);
    }
  }

  for (const instance of data.eventInstances) {
    if (instance.shops) {
      instance.shops = instance.shops
        .map((shopRef) => {
          const shop = resolveRef<IShop>(shopRef as any);
          if (shop) shop.event = instance;
          return shop;
        })
        .filter(Boolean);
    }

    if (instance.spirits) {
      instance.spirits = instance.spirits
        .map((spiritRef) => {
          const spirit = resolveRef<IEventInstanceSpirit>(spiritRef as any);
          if (spirit) spirit.eventInstance = instance;
          return spirit;
        })
        .filter(Boolean);
    }
  }

  for (const eventSpirit of data.eventInstanceSpirits) {
    if (eventSpirit.spirit) {
      const spirit = resolveRef<ISpirit>(eventSpirit.spirit as any);
      eventSpirit.spirit = spirit;
      if (spirit) {
        if (!spirit.events) spirit.events = [];
        spirit.events.push(eventSpirit);
      }
    }

    if (eventSpirit.tree) {
      const tree = resolveRef<ISpiritTree>(eventSpirit.tree as any);
      eventSpirit.tree = tree;
      if (tree) tree.eventInstanceSpirit = eventSpirit;
    }
  }

  // Resolve shop references
  for (const shop of data.shops) {
    if (shop.iaps) {
      shop.iaps = shop.iaps
        .map((iapRef) => {
          const iap = resolveRef<IIAP>(iapRef as any);
          if (iap) iap.shop = shop;
          return iap;
        })
        .filter(Boolean);
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

  // Resolve IAP references
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
        .filter(Boolean);
    }
  }

  // Resolve item list references
  for (const list of data.itemLists) {
    if (list.items) {
      list.items = list.items
        .map((nodeRef) => {
          const node = resolveRef<IItemListNode>(nodeRef as any);
          if (node) node.itemList = list;
          return node;
        })
        .filter(Boolean);
    }
  }

  for (const node of data.itemListNodes) {
    if (node.item) {
      const item = resolveRef<IItem>(node.item as any);
      node.item = item;
      if (item) {
        if (!item.listNodes) item.listNodes = [];
        item.listNodes.push(node);
      }
    }
  }

  // Resolve node references
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
    }

    if (node.ne) {
      node.ne = resolveRef<INode>(node.ne as any);
    }

    if (node.n) {
      node.n = resolveRef<INode>(node.n as any);
    }
  }

  // Resolve node prev/root relationships
  for (const node of data.nodes) {
    if (node.nw && !node.nw.prev) node.nw.prev = node;
    if (node.ne && !node.ne.prev) node.ne.prev = node;
    if (node.n && !node.n.prev) node.n.prev = node;

    // Find root node
    let current = node;
    while (current.prev) {
      current = current.prev;
    }
    node.root = current;
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
