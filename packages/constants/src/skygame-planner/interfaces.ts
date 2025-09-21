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
  items: Array<T>;
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
  group?: ItemGroup | string;
  /** Item name. */
  name: string;
  /** Path to item icon. */
  icon?: string;
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
  nodes?: Array<INode>;
  hiddenNodes?: Array<INode>;
  listNodes?: Array<IItemListNode>;
  iaps?: Array<IIAP>;
  season?: ISeason;

  // Progress
  unlocked?: boolean;
  autoUnlocked?: boolean;
  favourited?: boolean;
}

export interface IItemConfig extends IConfig<IItem> {}

/**
 * Node interfaces
 */
export interface INode extends IGuid, ICost {
  // References to be added during data transformation
  item?: IItem;
  hiddenItems?: Array<IItem>;
  spiritTree?: ISpiritTree;
  nw?: INode;
  ne?: INode;
  n?: INode;
  prev?: INode;
  root?: INode;
  currency?: { type: string; amount: number };

  // Progress
  unlocked?: boolean;
}

export interface INodeConfig extends IConfig<INode> {}

/**
 * Spirit Tree interfaces
 */
export interface ISpiritTree extends IGuid {
  name?: string;
  draft?: boolean;

  // References
  permanent?: boolean | string;
  node: INode;
  ts?: ITravelingSpirit;
  visit?: IReturningSpirit;
  spirit?: ISpirit;
  eventInstanceSpirit?: IEventInstanceSpirit;
}

export interface IRevisedSpiritTree extends ISpiritTree {
  revisionType: "DuringSeason" | "AfterSeason" | "Limited";
}

export interface ISpiritTreeConfig extends IConfig<ISpiritTree> {}

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
  icon?: string;

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
  treeRevisions?: Array<IRevisedSpiritTree>;

  /** Area this spirit can be found in normally. */
  area?: IArea;

  /** Season this spirit is part of. */
  season?: ISeason;
  /** All Traveling Spirit visits of this spirit. */
  ts?: Array<ITravelingSpirit>;

  /** All visits as returning spirits.  */
  returns?: Array<IReturningSpirit>;

  /** All visits during events. */
  events?: Array<IEventInstanceSpirit>;

  /** All shop instances. */
  shops?: Array<IShop>;

  _wiki?: IWiki;
}

export interface IWiki {
  href?: string;
}

export interface ICalendarFm {
  href?: string;
}

export interface ISpiritConfig extends IConfig<ISpirit> {}

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
  spirits?: Array<ISpirit>;
  wingedLights?: Array<IWingedLight>;
  rs?: Array<IReturningSpirits>;
  connections?: Array<IAreaConnection>;
  mapShrines?: Array<IMapShrine>;
}

export interface IAreaConnection {
  area: IArea;
}

export interface IAreaConfig extends IConfig<IArea> {}

/**
 * Realm interfaces
 */
export interface IRealm extends IGuid {
  name: string;
  shortName: string;
  icon?: string;
  imageUrl?: string;
  imagePosition?: string;
  hidden?: boolean;

  // References
  areas?: Array<IArea>;
  constellation?: IRealmConstellation;
  elder?: ISpirit;
}

export interface IRealmConstellation {
  imageUrl: string;
  icons: Array<IRealmConstellationIcon>;
}

export interface IRealmConstellationIcon {
  imageUrl: string;
  position: [number, number];
  spirit?: ISpirit;
  flag?: boolean;
}

export interface IRealmConfig extends IConfig<IRealm> {}

/**
 * Season interfaces
 */
export interface ISeason extends IGuid, IPeriod {
  /** Name of the season. */
  name: string;
  /** Short name of the season. */
  shortName: string;

  /** Emoji id of the season icon */
  icon?: string;
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
  spirits: Array<ISpirit>;
  shops?: Array<IShop>;
  includedTrees?: Array<ISpiritTree>;
}

export interface ISeasonConfig extends IConfig<ISeason> {}

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
  instances?: Array<IEventInstance>;
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
  shops: Array<IShop>;
  spirits: Array<IEventInstanceSpirit>;
}

export interface IEventInstanceSpirit extends IGuid {
  /** Custom name to better identify spirit. */
  name?: string;

  // References
  spirit: ISpirit;
  tree: ISpiritTree;
  eventInstance?: IEventInstance;
}

export interface IEventConfig extends IConfig<IEvent> {}

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

export interface ITravelingSpiritConfig extends IConfig<ITravelingSpirit> {}

/**
 * Returning Spirit interfaces
 */
export interface IReturningSpirits extends IGuid, IPeriod {
  /** Name of the occassion. */
  name?: string;
  /** Area the spirits visited. */
  area?: IArea;
  /** Visiting spirits. */
  spirits: Array<IReturningSpirit>;
  imageUrl?: string;
  draft?: boolean;
}

export interface IReturningSpirit extends IGuid {
  // References
  return: IReturningSpirits;
  spirit: ISpirit;
  tree: ISpiritTree;
}

export interface IReturningSpiritsConfig extends IConfig<IReturningSpirits> {}

/**
 * Shop interfaces
 */
export type ShopType = "Store" | "Spirit" | "Object";

export interface IShop extends IGuid {
  type: ShopType;
  name?: string;
  date?: string;
  endDate?: string;
  permanent?: boolean | string;

  // References
  iaps?: Array<IIAP>;
  itemList?: IItemList;
  event?: IEventInstance;
  spirit?: ISpirit;
  season?: ISeason;
}

export interface IShopConfig extends IConfig<IShop> {}

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
  items?: Array<IItem>;
  shop?: IShop;

  // Progress
  bought?: boolean;
  gifted?: boolean;
}

export interface IIAPConfig extends IConfig<IIAP> {}

/**
 * Item List interfaces
 */
export interface IItemList extends IGuid {
  /** All items in the list. */
  items: Array<IItemListNode>;
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

export interface IItemListConfig extends IConfig<IItemList> {}

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

export interface IMapShrineConfig extends IConfig<IMapShrine> {}

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

export interface IWingedLightConfig extends IConfig<IWingedLight> {}
