import type { APIEmoji } from "discord-api-types/v10";

import jsonc from "jsonc-parser";
import { readFile } from "fs/promises";
import { join } from "path";
export const emojis = {
  tree_top: "<:tree_top:1424038331716604017>",
  tree_middle: "<:tree_middle:1424038339958407301> ",
  tree_end: "<:tree_end:1424038349307641998>",
  down_chevron: "<:down_chevron:1424038358002302987>",
  left_chevron: "<:left_chevron:1424038367343018105>",
  up_chevron: "<:upchevron:1424038377249964214>",
  right_chevron: "<:rightchevron:1424038386553065693>",
  "30s_timer": "<a:30sec:1424038397068050622>",
  eventticket: "1424038404848353440",
  wingwedge: "1424038414415822960",
  leftarrow: "1424038423550754856",
  realmelders: "1424038434099433594",
  regularspirit: "1424038444191187147",
  auroraguide: "1424038453070528513",
  travelingspirit: "1424038464709464197",
  shopcart: "1424038475308597318",
  rightarrow: "1424038485282652301",
  uparrow: "1424038494375903282",
  downarrow: "1424038503431540806",
  location: "1424038512037990430",
  filter: "1424038520347164765",
  spicon: "1424038529662451804",
  leftarryello: "1424038538562900029",
  checkmark: "1429192156471492808",
  wax: "1125091974869946369",
  red_shard: "1233057065799254106",
  black_shard: "1233057106903699497",
} as const;

export const realms_emojis = {
  "Isle of Dawn": "1424053501285236867",
  "Daylight Prairie": "1424053517215076553",
  "Hidden Forest": "1424053534063595644",
  "Valley of Triumph": "1424053551679930429",
  "Golden Wasteland": "1424053568238915645",
  "Vault of Knowledge": "1424053585116925993",
  "Eye of Eden": "1424053600883048639",
  "Aviary Village": "1424053618100797605",
  Home: "1424053634429354099",
} as const;

export const season_emojis = {
  Migration: "1429896923526992092",
  "Two Embers - Part 1": "1424038546091671574",
  "Blue Bird": "1424038554820153457",
  Radiance: "1424038564294955058",
  Moomin: "1424038573211914294",
  Duets: "1424038584532599034",
  Nesting: "1424038593768194090",
  "Nine-Colored Deer": "1424038603012444201",
  Revival: "1424038612948746351",
  Moments: "1424038623116001443",
  Passage: "1424038632049606740",
  Remembrance: "1424038642929893408",
  AURORA: "1424038652689776790",
  Shattering: "1424038662500515971",
  Performance: "1424038673351180372",
  Abyss: "1424038682989428777",
  Flight: "1424038692733059183",
  "The Little Prince": "1424038705873551361",
  Assembly: "1424038714769674321",
  Dreams: "1424038725146382388",
  Prophecy: "1424038735238004948",
  Sanctuary: "1424038745149145211",
  Enchantment: "1424038754821079132",
  Rhythm: "1424038770965217330",
  Belonging: "1424053449888370811",
  Lightseekers: "1424053465814143067",
  Gratitude: "1424053482368929896",
} as const;

export const currency = {
  h: "1424054268616249425",
  c: "1424054284114460775",
  ac: "1424053681153900556",
  sc: "1424054299989643365",
  sh: "1424054315881992346",
  ec: "1424054333430825113",
};

// These are the server that holds emojis for the bot.
const EMOJI_SERVERS: string[] = [];

/**
 * The emojis here are typically only those that'll be used by game planner/tracker, as the their names are mapped according to skygame planner data structures
 * for e.g `id` of an `item`, to make it easier to map it and retrieve corresponding items
 */
export const APPLICATION_EMOJIS: Array<
  APIEmoji & {
    /**
     * Array of skygame structure `id`(s) used to identify emoji to their items
     */
    identifiers?: number[];
  }
> = [];

/**
 *
 * This is mapping of hashes used for emoji name whose name exceeded the 32 char limit, the values are base 36 encoded id of item joined together by "_".
 *
 */
export const EMOJIS_HASH = jsonc.parse(
  await readFile(join(import.meta.dirname, "../emoji_hashes.json")).then((t) => t.toString()),
) as Record<string, string>;

const BASE_API = "https://discord.com/api/v10";

export async function fetchEmojis() {
  const fetchedEmojis: APIEmoji[] = [];

  // fetch all the guild emojis
  for (const guildId of EMOJI_SERVERS) {
    console.log(`Fetching emojis form guild: ${guildId}...`);
    const res = await fetch(`${BASE_API}/guilds/${guildId}/emojis`, {
      headers: {
        Authorization: `Bot ${process.env.TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      console.error(`Failed to fetch emojis from guild ${guildId}: ${res.status} ${res.statusText}`);
      continue;
    }
    const emjs = (await res.json()) as APIEmoji[];
    console.log(`Fetched ${emjs.length} emojis from guild: ${guildId}`);
    fetchedEmojis.push(...emjs);
  }

  // Fetch application emojis
  console.log(`Fetching application emojis...`);
  const appRes = await fetch(`${BASE_API}/applications/${process.env.CLIENT_ID}/emojis`, {
    headers: {
      Authorization: `Bot ${process.env.TOKEN}`,
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());

  const appEmojis = appRes.items as APIEmoji[];
  console.log(`Fetched ${appEmojis.length} application emojis`);
  fetchedEmojis.push(...appEmojis);
  return transformEmojis(fetchedEmojis);
}

function transformEmojis(emjs: APIEmoji[]) {
  const transformed: Array<
    APIEmoji & {
      identifiers?: number[];
    }
  > = [];

  console.log("Transforming emojis...");
  for (const emoji of emjs) {
    const identifier: string = emoji.name?.startsWith("h_") ? (EMOJIS_HASH as any)[emoji.name] : emoji.name;
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

  APPLICATION_EMOJIS.push(...transformed);

  return transformed;
}
