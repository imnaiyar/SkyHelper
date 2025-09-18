/**
 * Fetcher for SkyGame Planner data from GitHub repository
 */
import {
  IAreaConfig,
  IEventConfig,
  IIAPConfig,
  IItemConfig,
  IItemListConfig,
  IMapShrineConfig,
  INodeConfig,
  IRealmConfig,
  IReturningSpiritsConfig,
  ISeasonConfig,
  IShopConfig,
  ISpiritConfig,
  ISpiritTreeConfig,
  ITravelingSpiritConfig,
  IWingedLightConfig,
} from "./interfaces.js";
import { parse as jsonc } from "jsonc-parser";
export const BASE_URL = `https://sky-planner.com`;
const DATA_PATH = "/assets/data";

// List of data files to fetch
const DATA_FILES = {
  areas: "areas.json",
  events: "events.json",
  iaps: "iaps.json",
  items: "items.json",
  itemLists: "item-lists.json",
  mapShrines: "map-shrines.json",
  nodes: "nodes.json",
  quests: "quests.json",
  realms: "realms.json",
  returningSpirits: "returning-spirits.json",
  seasons: "seasons.json",
  shops: "shops.json",
  spirits: "spirits.json",
  spiritTrees: "spirit-trees.json",
  travelingSpirits: "traveling-spirits.json",
  wingedLights: "winged-lights.json",
};

// Interface for the fetched data
export interface FetchedData {
  areas: IAreaConfig;
  events: IEventConfig;
  iaps: IIAPConfig;
  items: IItemConfig;
  itemLists: IItemListConfig;
  mapShrines: IMapShrineConfig;
  nodes: INodeConfig;
  quests: IQuestConfig;
  realms: IRealmConfig;
  returningSpirits: IReturningSpiritsConfig;
  seasons: ISeasonConfig;
  shops: IShopConfig;
  spirits: ISpiritConfig;
  spiritTrees: ISpiritTreeConfig;
  travelingSpirits: ITravelingSpiritConfig;
  wingedLights: IWingedLightConfig;
}

/**
 * Fetches a single data file from the SkyGame Planner repository
 * @param filename The name of the file to fetch
 * @returns The parsed JSON data
 */
async function fetchDataFile<T>(filename: string): Promise<T> {
  const url = `${BASE_URL}/${DATA_PATH}/${filename}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filename}: ${response.statusText}`);
    }
    const text = await response.text();
    return jsonc(text) as T;
  } catch (error) {
    console.error(`Error fetching ${filename}:`, error);
    throw error;
  }
}

/**
 * Fetches all data files from the SkyGame Planner repository
 * @returns Object containing all fetched data
 */
export async function fetchAllData(): Promise<FetchedData> {
  try {
    // Create an object to store promises for all the data files
    const promises: Record<string, Promise<any>> = {};

    // Create a promise for each data file
    for (const [key, filename] of Object.entries(DATA_FILES)) {
      promises[key] = fetchDataFile(filename);
    }

    // Wait for all promises to resolve
    const results = await Promise.all(Object.values(promises));

    // Create an object with the resolved data
    const data: Record<string, any> = {};
    Object.keys(promises).forEach((key, index) => {
      data[key] = results[index];
    });

    return data as FetchedData;
  } catch (error) {
    console.error("Error fetching all data:", error);
    throw error;
  }
}

/**
 * Interface for quest data
 */
export interface IQuestConfig {
  items: any[]; // Replace with actual quest interface when needed
}
