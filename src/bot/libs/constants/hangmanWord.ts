import spiritsData from "./spirits-datas/index.js";
import { SummaryData } from "./realmsData.js";
import seasonsData from "./seasonsData.js";

/* prettier-ignore */
export const hangmanWords = ["Ancestor Spirit", "Traveling Spirit", "Seasonal Spirit", "Candle Cake", "Candles",
    "Ascended Candles", "Light", "Winged Light", "Wing Buff", "Candle Run", "Constellation Table",
    "Friendship Constellation", "Prop Closet", "Shared Memories", "Shared Space", "Expression",
    "Meditation Shrine", "Krill", "Dark Dragon", "Seasonal Cosmetics", "Cloud Tunnel", "Sky Kids",
    "Moth", "Chibi Mask", "Ancestor Mask", "Constellation Gate", "Elder Spirit", "Constellation Map",
    "Seasonal Quest", "Emote", "Flight", "Flight Path", "Sanctuary Island", "Spirit Memory",
    "Wing Collector", "Temple", "Temple Relic", "Shrine", "Shrine of Reflection", "Golden Wasteland",
    "Golden Sky", "Wasteland Gate", "Forest Clearing", "Forest Brook", "Forest Passage",
    "Prairie Birds", "Prairie Village", "Valley Ice Rink", "Prairie Cave", "Cave of Prophecies",
    "Enchantment Quest", "Enchantment Relic", "Dream Quest", "Candle Spirit", "Collectibles",
    "Spirit Elder", "Spirit Cape", "Spirit Tree", "Golden Temple", "Ice Temple", "Flying Temple",
    "Manta Ray", "Jellyfish", "Whale", "Light Manta", "Rainbow Cape", "Rainbow Trail",
    "Prince's Rose", "Golden Boat", "Prairie Summit", "Forest Shaman", "Sky Hammock", "Sanctuary Spirit",
    "Seasonal Realm", "Prairie Puzzle", "Prairie Cave Spirit", "Waterfall Shrine",
    "Rainbow Candles", "Candle Shrine", "Forest Elder", "Ancient Temple", "Valley of Remembrance",
    "Vault Elder", "Vault Gate", "Vault Pass", "Sky Kingdom", "Sky Shards", "Sky Whisperer",
    "Golden Citadel", "Dark Valley", "Sky Storm", "Valley of Ascent", "Forest Elder Cave",
    "Valley Elder", "Golden Guardian", "Prairie Pilgrimage", "Golden Courtyard", "Sky Lantern",
    "Sanctuary Quest", "Enchantment Staff", "Dream Realm",
    "Aurora Light", "Forest Shrine", "Candlelight Ceremony", "Prairie Passage", "Golden Prophecy",
    "Temple Puzzle", "Valley Path", "Golden Spirit", "Light Shrine", "Elder Prophecy",
    "Ancestor Puzzle", "Cave of Relics", "Flight Relic", "Golden Wasteland Elder", "Sky Ritual",
    "Prairie Journey", "Valley Gate", "Forest Gate", "Sky Pilgrim",
    "Enchantment Flight", "Sanctuary Cave", "Candlelight Path",
    "Valley Shaman", "Golden Light", "Manta Flight", "Prairie Elder", "Vault Elder", "Golden Passage",
    "Manta Call", "Sky Whale", "Golden Relic", "Sky Journey", "Prairie Ritual",
    "Vault of Prophecy", "Dark Shard", "Aurora Spirit", "Vault Cave", "Vault Journey", "Sanctuary Spirit",
    ...(Object.entries(spiritsData).map(([, v]) => v.name)),
    ...(Object.entries(SummaryData).map(([, v]) => v["main"].title)),
    ...(Object.entries(seasonsData).map(([, v]) => v.name)),
  ];

console.log(hangmanWords);
