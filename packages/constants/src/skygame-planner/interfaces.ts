/**
 * TypeScript interfaces for SkyGame Planner data.
 * Based on the interfaces from https://github.com/Silverfeelin/SkyGame-Planner
 */

/**
 * Base interfaces
 */
export interface IGuid {
  guid: string;
}

export interface IConfig<T> {
  items: T[];
}

export interface IPeriod {
  date: string; // ISO date string
  endDate: string; // ISO date string
}

/**
 * Cost interfaces
 */
export interface ICost {
  /** Cost in candles. */
  c?: number;
  /** Cost in hearts. */
  h?: number;
  /** Cost in seasonal candles. */
  sc?: number;
  /** Cost in seasonal hearts. */
  sh?: number;
  /** Cost in ascended candles. */
  ac?: number;
  /** Cost in event currency. */
  ec?: number;
}

/**
 * Item interfaces
 */
export enum ItemType {
  HairAccessory = "HairAccessory",
  HeadAccessory = "HeadAccessory",
  Hair = "Hair",
  Mask = "Mask",
  FaceAccessory = "FaceAccessory",
  Necklace = "Necklace",
  Outfit = "Outfit",
  Shoes = "Shoes",
  Cape = "Cape",
  Held = "Held",
  Furniture = "Furniture",
  Prop = "Prop",
  Emote = "Emote",
  Stance = "Stance",
  Call = "Call",
  Spell = "Spell",
  Music = "Music",
  Quest = "Quest",
  WingBuff = "WingBuff",
  Special = "Special",
}

export enum ItemSubtype {
  Instrument = "Instrument",
  FriendEmote = "FriendEmote",
}

export type ItemGroup = "Elder" | "SeasonPass" | "Ultimate" | "Limited";

export interface IItemDyeSpec {
  cost?: number;
}

export interface IItemDye {
  primary?: IItemDyeSpec;
  secondary?: IItemDyeSpec;
  previewUrl?: string;
  infoUrl?: string;
}

export interface IItem extends IGuid {
  /** Unique item ID. */
  id?: number;
  /** Item type. */
  type: ItemType | string;
  /* Item subtype */
  subtype?: ItemSubtype | string;
  /** Item group. */
  group?: ItemGroup;
  /** Item name. */
  name: string;

  /** Path of the icon image */
  icon?: string;

  /** Emoji id of the icon, if available */
  emoji?: string;
  /** Path to preview image. */
  previewUrl?: string;
  /** Item order (within category). */
  order?: number;
  /** Dye slots on item. */
  dye?: IItemDye;
  /** Emote level. */
  level?: number;
  /** Music sheet */
  sheet?: string;
  /** Quantity */
  quantity?: number;
  /** Hide from closet (Outfit request) */
  closetHide?: boolean;

  // References can be added when transforming the data
  nodes?: INode[];
  hiddenNodes?: INode[];
  listNodes?: IItemListNode[];
  iaps?: IIAP[];
  season?: ISeason;

  // Progress
  unlocked?: boolean;
  autoUnlocked?: boolean;
  favourited?: boolean;
}

export type IItemConfig = IConfig<IItem>;

// #region INode
/**
 * Node interfaces
 */
export interface INode extends IGuid, ICost {
  /** Item unlocked through this node. */
  item?: IItem;
  /** Items unlocked through this node that are not visible in the node. Generally ones added retroactively. */
  hiddenItems?: IItem[];

  /**
   * Spirit tree containing this node.
   * @remarks For normal spirit trees only the first node has this reference.
   * Other nodes have a reference to their `prev` node.
   * For spirit trees with friendship tiers, every node has this reference.
   */
  spiritTree?: ISpiritTree;
  /** Node north west of this node. */
  nw?: INode;
  /** Node north east of this node. */
  ne?: INode;
  /** Node north of this node. */
  n?: INode;
  /** Previous node. */
  prev?: INode;
  /**
   * Root node.
   * @remarks Can be a self-reference if this is the root node.
   * For spirit trees with friendship tiers, every node is its own root.
   */
  root?: INode;

  // Progress
  unlocked?: boolean;
  currency?: { type: string; amount: number };
}
export interface INodeTier extends INode {
  tier?: number;
}

export type INodeConfig = IConfig<INode>;
// #endregion

// #region ISpiritTree
/**
 * Spirit Tree interfaces
 */
export interface ISpiritTree extends IGuid {
  name?: string;
  draft?: boolean;

  // References
  permanent?: boolean | string;
  node?: INode;
  ts?: ITravelingSpirit;
  tier?: ISpiritTreeTier;
  visit?: IReturningSpirit;
  spirit?: ISpirit;
  eventInstanceSpirit?: IEventInstanceSpirit;
}

export interface IRevisedSpiritTree extends ISpiritTree {
  revisionType: "DuringSeason" | "AfterSeason" | "Limited";
}

export interface ISpiritTreeTier extends IGuid {
  spiritTree?: ISpiritTree;
  prev?: ISpiritTreeTier;
  next?: ISpiritTreeTier;
  root?: ISpiritTreeTier;
  rows: SpiritTreeTierRow[];
}

export type SpiritTreeTierRow = [INode?, INode?, INode?];

export type ISpiritTreeConfig = IConfig<ISpiritTree>;
export type ISpiritTreeTierConfig = IConfig<ISpiritTreeTier>;
// #endregion

export enum SpiritType {
  Regular = "Regular",
  Elder = "Elder",
  Guide = "Guide",
  Season = "Season",
  Event = "Event",
  Special = "Special",
}

export interface ISpirit extends IGuid {
  /** Name of the spirit. */
  name: string;
  /** Type of the spirit. */
  type: SpiritType;

  /** Icon of the expression offered by this spirit, for display purpose */
  emoji?: string;

  /** Image URL. */
  imageUrl?: string;

  // / References ///

  /**
   * Main spirit tree(s).
   * For regular spirits this is the constellation tree.
   * For season spirits this is the seasonal tree.
   */
  tree?: ISpiritTree;

  /** Revised versions of the main spirit tree. */
  treeRevisions?: IRevisedSpiritTree[];

  /** Area this spirit can be found in normally. */
  area?: IArea;

  /** Season this spirit is part of. */
  season?: ISeason;
  /** All Traveling Spirit visits of this spirit. */
  ts?: ITravelingSpirit[];

  /** All visits as returning spirits.  */
  returns?: IReturningSpirit[];

  /** All visits during events. */
  events?: IEventInstanceSpirit[];

  /** All shop instances. */
  shops?: IShop[];

  _wiki?: IWiki;
}

export interface IWiki {
  href?: string;
}

export interface ICalendarFm {
  href?: string;
}

export type ISpiritConfig = IConfig<ISpirit>;

/**
 * Area interfaces
 */
export interface IArea extends IGuid {
  name: string;
  mapData?: IMapData;
  imageUrl?: string;
  imagePosition?: string;

  // References
  realm: IRealm;
  spirits?: ISpirit[];
  wingedLights?: IWingedLight[];
  rs?: IReturningSpirits[];
  connections?: IAreaConnection[];
  mapShrines?: IMapShrine[];
}

export interface IAreaConnection {
  area: IArea;
}

export type IAreaConfig = IConfig<IArea>;

/**
 * Realm interfaces
 */
export interface IRealm extends IGuid {
  name: string;
  shortName: string;
  emoji?: string;
  imageUrl?: string;
  imagePosition?: string;
  hidden?: boolean;

  // References
  areas?: IArea[];
  constellation?: IRealmConstellation;
  elder?: ISpirit;
}

export interface IRealmConstellation {
  imageUrl: string;
  icons: IRealmConstellationIcon[];
}

export interface IRealmConstellationIcon {
  imageUrl: string;
  position: [number, number];
  spirit?: ISpirit;
  flag?: boolean;
}

export type IRealmConfig = IConfig<IRealm>;

/**
 * Season interfaces
 */
export interface ISeason extends IGuid, IPeriod {
  /** Name of the season. */
  name: string;
  /** Short name of the season. */
  shortName: string;

  /** Emoji id of the season icon */
  emoji?: string;
  /** Path to the season icon. */
  iconUrl?: string;
  imageUrl?: string;
  imagePosition?: string;
  /** Year of the season. */
  year: number;
  /** Season number, starting at 1 for Gratitude. */
  number: number;
  /** If marked as draft, data may be inaccurate or incomplete. */
  draft?: boolean;

  // References
  spirits: ISpirit[];
  shops?: IShop[];
  includedTrees?: ISpiritTree[];
}

export type ISeasonConfig = IConfig<ISeason>;

/**
 * Event interfaces
 */
export interface IEvent extends IGuid {
  /** Name of the event. */
  name: string;
  shortName?: string;
  /** Path to overview image. */
  imageUrl?: string;
  imagePosition?: string;
  /** If true, the event recurs regularly (generally yearly). */
  recurring?: boolean;

  // References
  instances?: IEventInstance[];
}

export interface IEventInstance extends IGuid {
  /** Name for older event instances, used if an event changes name throughout time. */
  name?: string;
  date: { day: number; month: number; year: number } | string;
  endDate: { day: number; month: number; year: number } | string;
  shortName?: string;
  /** Event instance number starting at 1. */
  number: number;
  /** If marked as draft, data may be inaccurate or incomplete. */
  draft?: boolean;

  // References
  event: IEvent;
  shops: IShop[];
  spirits: IEventInstanceSpirit[];
}

export interface IEventInstanceSpirit extends IGuid {
  /** Custom name to better identify spirit. */
  name?: string;

  // References
  spirit: ISpirit;
  tree: ISpiritTree;
  eventInstance?: IEventInstance;
}

export type IEventConfig = IConfig<IEvent>;

/**
 * Traveling Spirit interfaces
 */
export interface ITravelingSpirit extends IGuid {
  /** Traveling Spirit number, starting at 1 for the first TS visit. */
  number: number;
  /** This is the n-th visit of this spirit. */
  visit: number;

  date: string;

  endDate?: string;

  // References
  spirit: ISpirit;
  tree: ISpiritTree;
}

export type ITravelingSpiritConfig = IConfig<ITravelingSpirit>;

/**
 * Returning Spirit interfaces
 */
export interface IReturningSpirits extends IGuid, IPeriod {
  /** Name of the occassion. */
  name?: string;
  /** Area the spirits visited. */
  area?: IArea;
  /** Visiting spirits. */
  spirits: IReturningSpirit[];
  imageUrl?: string;
  draft?: boolean;
}

export interface IReturningSpirit extends IGuid {
  // References
  return: IReturningSpirits;
  spirit: ISpirit;
  tree: ISpiritTree;
}

export type IReturningSpiritsConfig = IConfig<IReturningSpirits>;

/**
 * Shop interfaces
 */
export type ShopType = "Store" | "Spirit" | "Object";

export interface IPlannerCurrencies {
  candles: number;
  hearts: number;
  ascendedCandles: number;
  giftPasses: number;
  eventCurrencies: Record<string, { tickets: number }>;
  seasonCurrencies: Record<string, { candles: number; hearts?: number }>;
}

export interface UserPlannerData {
  date: string;
  currencies: IPlannerCurrencies;
  /** Comma-separated list of unlocked item/node GUIDs */
  unlocked: string;
  /** Comma-separated list of unlocked winged light GUIDs */
  wingedLights: string;
  /** Comma-separated list of favorited item GUIDs */
  favourites: string;
  /** Comma-separated list of season GUIDs for which user has season pass */
  seasonPasses: string;
  /** Comma-separated list of gifted IAP/season pass GUIDs */
  gifted: string;
  /** Extra datas related to planner */
  keys: Record<string, any>;
}

/**
 * Helper class for working with UserPlannerData
 */
export class PlannerDataHelper {
  /**
   * Parse a comma-separated string into a Set of GUIDs
   */
  static parseGuidSet(value?: string): Set<string> {
    if (!value || value.length === 0) return new Set();
    return new Set(value.split(",").filter((s) => s.length > 0));
  }

  /**
   * Serialize a Set of GUIDs into a comma-separated string
   */
  static serializeGuidSet(set: Set<string>): string {
    return Array.from(set).join(",");
  }

  /**
   * Add GUIDs to a comma-separated string
   */
  static addToGuidString(current = "", ...guids: string[]): string {
    const set = this.parseGuidSet(current);
    guids.forEach((guid) => set.add(guid));
    return this.serializeGuidSet(set);
  }

  /**
   * Remove GUIDs from a comma-separated string
   */
  static removeFromGuidString(current = "", ...guids: string[]): string {
    const set = this.parseGuidSet(current);
    guids.forEach((guid) => set.delete(guid));
    return this.serializeGuidSet(set);
  }

  /**
   * Check if a GUID exists in a comma-separated string
   */
  static hasGuid(value = "", guid: string): boolean {
    return this.parseGuidSet(value).has(guid);
  }

  /**
   * Create an empty UserPlannerData object
   */
  static createEmpty(): UserPlannerData {
    return {
      date: new Date().toISOString(),
      currencies: {
        candles: 0,
        hearts: 0,
        ascendedCandles: 0,
        giftPasses: 0,
        eventCurrencies: {},
        seasonCurrencies: {},
      },
      unlocked: "",
      wingedLights: "",
      favourites: "",
      seasonPasses: "",
      gifted: "",
      keys: {},
    };
  }
}

export interface IShop extends IGuid {
  type: ShopType;
  name?: string;
  date?: string;
  endDate?: string;
  permanent?: boolean | string;

  // References
  iaps?: IIAP[];
  itemList?: IItemList;
  event?: IEventInstance;
  spirit?: ISpirit;
  season?: ISeason;
}

export type IShopConfig = IConfig<IShop>;

/**
 * IAP interfaces
 */
export interface IIAP extends IGuid {
  /** Price in USD. */
  price?: number;
  /** Name of the IAP. */
  name?: string;
  /** If true this is a returning IAP or catch-up pack. */
  returning?: boolean;
  /** Regular candles included in purchase. */
  c?: number;
  /** Season candles included in purchase. */
  sc?: number;
  /** Season Gift Passes included in purchase. */
  sp?: number;

  // References
  items?: IItem[];
  shop?: IShop;

  // Progress
  bought?: boolean;
  gifted?: boolean;
}

export type IIAPConfig = IConfig<IIAP>;

/**
 * Item List interfaces
 */
export interface IItemList extends IGuid {
  /** All items in the list. */
  items: IItemListNode[];
  description?: string;

  // References
  shop?: IShop;
}

export interface IItemListNode extends IGuid, ICost {
  /** Item unlocked through this node. */
  item: IItem;
  quantity?: number;

  // References
  itemList: IItemList;

  // Progress
  unlocked?: boolean;
}

export type IItemListConfig = IConfig<IItemList>;

/**
 * Map interfaces
 */
export interface IMapData {
  position?: [number, number];
  zoom?: number;
  boundary?: Array<[number, number]>;
  boundaryLabelAlign?: string;
  boundaryColor?: string;
  videoUrl?: string;
}

/**
 * Map Shrine interfaces
 */
export interface IMapShrine extends IGuid {
  description?: string;
  imageUrl?: string;
  mapData?: IMapData;

  // References
  area: IArea;
}

export type IMapShrineConfig = IConfig<IMapShrine>;

/**
 * Winged Light interfaces
 */
export interface IWingedLight extends IGuid {
  name?: string;
  description?: string;
  mapData?: IMapData;

  // References
  area: IArea;

  // Progress
  unlocked?: boolean;
}

export type IWingedLightConfig = IConfig<IWingedLight>;

/**
 * Currency breakdown interfaces for tracking spent resources
 */
export interface IBreakdownInstanceCost {
  cost: ICost;
  price: number;
  nodes: INode[];
  listNodes: IItemListNode[];
  iaps: IIAP[];
}

export interface IBreakdownData {
  total: IBreakdownInstanceCost;
  regular: IBreakdownInstanceCost;
  seasons: Map<string, IBreakdownInstanceCost>;
  events: Map<string, IBreakdownInstanceCost>;
  eventInstances: Map<string, IBreakdownInstanceCost>;
}
