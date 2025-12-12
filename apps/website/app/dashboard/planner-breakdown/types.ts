export interface PlannerBreakdownData {
  user: {
    id: string;
    username: string;
    avatar: string | null;
  };
  progress: {
    items: {
      total: number;
      unlocked: number;
      percentage: number;
    };
    nodes: {
      total: number;
      unlocked: number;
      percentage: number;
    };
    wingedLights: {
      total: number;
      unlocked: number;
      percentage: number;
    };
    iaps: {
      total: number;
      bought: number;
      percentage: number;
    };
  };
  currencies: {
    candles: number;
    hearts: number;
    ascendedCandles: number;
    giftPasses: number;
    eventCurrencies: Record<string, { tickets: number }>;
    seasonCurrencies: Record<string, { candles: number; hearts?: number }>;
  };
  breakdown: {
    total: BreakdownCost;
    regular: BreakdownCost;
    seasons: SeasonBreakdown[];
    events: EventBreakdown[];
    eventInstances: EventInstanceBreakdown[];
  };
}

export interface BreakdownCost {
  cost: {
    candles: number;
    hearts: number;
    seasonCandles: number;
    seasonHearts: number;
    ascendedCandles: number;
    eventCurrency: number;
  };
  price: number;
  items: {
    nodes: NodeItem[];
    shopItems: ShopItem[];
    iaps: IAPItem[];
  };
}

export interface NodeItem {
  guid: string;
  name: string;
  cost: {
    candles: number;
    hearts: number;
    seasonCandles: number;
    seasonHearts: number;
    ascendedCandles: number;
    eventCurrency: number;
  };
  spirit: {
    guid: string;
    name: string;
    imageUrl?: string;
  } | null;
}

export interface ShopItem {
  guid: string;
  name: string;
  quantity: number;
  cost: {
    candles: number;
    hearts: number;
    seasonCandles: number;
    seasonHearts: number;
    ascendedCandles: number;
    eventCurrency: number;
  };
  shop: string;
}

export interface IAPItem {
  guid: string;
  name: string;
  price: number;
}

export interface SeasonBreakdown extends BreakdownCost {
  guid: string;
  name: string;
  number?: number;
  imageUrl?: string;
}

export interface EventBreakdown extends BreakdownCost {
  guid: string;
  name: string;
  imageUrl?: string;
}

export interface EventInstanceBreakdown extends BreakdownCost {
  guid: string;
  name: string;
  eventName?: string;
  date?: string;
  imageUrl?: string;
}

export type FilterType = "all" | "regular" | "seasons" | "events";
export type CurrencyType = "candles" | "hearts" | "seasonCandles" | "seasonHearts" | "ascendedCandles" | "eventCurrency" | "iaps";
