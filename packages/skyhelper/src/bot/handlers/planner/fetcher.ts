import type { SkyHelper } from "@/structures";
import { Collection } from "@discordjs/collection";
import type { APIApplicationEmoji } from "discord-api-types/v10";
import { SkyDataResolver, SpiritTreeHelper, type ISkyData } from "skygame-data";
import { parse as jsonc } from "jsonc-parser";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { realms_emojis, season_emojis } from "@skyhelperbot/constants";
const URL = "https://unpkg.com/skygame-data@beta/assets/everything.json";

let cachedData: ISkyData | null = null;
let lastFetchTime = 0;
const CACHE_LIFETIME_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetches and returns the data with all the refrences resolved
 * @param client
 * @param force whether to force fetch the data bypassing cache
 */
export async function fetchSkyData(client: SkyHelper, force = false) {
  const now = Date.now();
  const cacheExpired = now - lastFetchTime > CACHE_LIFETIME_MS;
  if (!cachedData || cacheExpired || force) {
    const fetchedData = await fetch(URL).then((res) => res.text());
    const parsed = SkyDataResolver.parse(fetchedData);
    // refresh emojis too in-case any emoji was updated
    client.applicationEmojis = await client.api.applications
      .getEmojis(process.env.CLIENT_ID)
      .then((cmds) => new Collection(cmds.items.map((c) => [c.id, c])));
    cachedData = resolveData(parsed, [...client.applicationEmojis.values()]);
    lastFetchTime = now;
  }
  return cachedData;
}

const Sky_Planner_Url = "https://sky-planner.com";
export const resolvePlannerUrl = (url: string) => (url.startsWith("http") ? url : Sky_Planner_Url + url);

function resolveData(data: ISkyData, emojis: APIApplicationEmoji[]) {
  const transformedEmojis = transformEmojis(emojis);
  const resolved = SkyDataResolver.resolve(data);

  // resolve urls
  for (const obj of resolved.guids.values()) {
    if ("imageUrl" in obj) obj.imageUrl = resolvePlannerUrl(obj.imageUrl as string);
    if ("previewUrl" in obj) obj.previewUrl = resolvePlannerUrl(obj.previewUrl as string);
  }

  // add emojis to relevent structures
  for (const item of resolved.items.items) {
    let emoji = transformedEmojis.find((e) => e.identifiers?.includes(item.id!));

    // If not found, fall back to a specific placeholder emoji
    emoji ??= transformedEmojis.find((e) => e.name === "h_7df56a33eb505ce" /* Question mark emoji */);

    if (emoji) item.emoji = emoji.id!;
  }

  for (const realm of resolved.realms.items) {
    realm.emoji = (realms_emojis as any)[realm.name];
  }

  for (const spirit of resolved.spirits.items) {
    const node = SpiritTreeHelper.getNodes(spirit.tree)[0];
    const emoteN = resolved.nodes.items.find(
      (n) => ["Emote", "Stance", "Call"].includes(n.item?.type ?? "") && n.root?.tree?.guid === spirit.tree?.guid,
    );
    spirit.emoji = emoteN?.item?.emoji ?? node?.item?.emoji;
  }

  for (const season of resolved.seasons.items) {
    season.emoji = (season_emojis as any)[season.shortName];
  }
  return resolved;
}

// TODO: remeber to change the hash path
/**
 *
 * This is mapping of hashes used for emoji name whose name exceeded the 32 char limit, the values are base 36 encoded id of item joined together by "_".
 *
 */
export const EMOJIS_HASH = jsonc(
  await readFile(join(process.cwd(), "assets/emoji_hashes.json")).then((t) => t.toString()),
) as Record<string, string>;

/** Transforms application emoji and attaches approprite item id, based on their name identifiers */
function transformEmojis(emojis: APIApplicationEmoji[]) {
  const transformed: Array<
    APIApplicationEmoji & {
      identifiers?: number[];
    }
  > = [];
  for (const emoji of [...emojis]) {
    const identifier: string = emoji.name.startsWith("h_") ? (EMOJIS_HASH as any)[emoji.name] : emoji.name;
    const identifiers = identifier
      ? identifier
          .split("_")
          .map((id: string) => parseInt(id, 36))
          .filter(Boolean)
      : undefined;
    transformed.push({
      ...emoji,
      identifiers,
    });
  }
  console.log(`Transformed emojis: ${transformed.length}`);

  return transformed;
}

// Augmentations
interface Emoji {
  /** Emoji id of the item's icon/image */
  emoji?: string;
}

declare module "skygame-data" {
  interface IItem extends Emoji {}
  interface ISpirit extends Emoji {}
  interface IRealm extends Emoji {}
  interface ISeason extends Emoji {}
}
