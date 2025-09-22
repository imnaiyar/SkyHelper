import spiritsData from "./seasonsData.js";
import { SummaryData } from "./realmsData.js";
import seasonsData from "./seasonsData.js";

// TODO: Rename it to a more neutral name
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
    ...(Object.entries(SummaryData).map(([, v]) => v.main.title)),
    ...(Object.entries(seasonsData).map(([, v]) => v.name)),
  ];

export enum HangmanResponseCodes {
  Timeout,
  NotAnAlphabet,
  AlreadyGuessed,
  WrongGuess,
  GuessSuccess,
  NextUp,
  Winner,
  NotInitialized,
  FirstRound,
  GuessedFullWord,
  WrongWordGuess,
  SingleModeStart,
  LivesExhausted,
  EndmGame,
}

export const HangmanResponses: Record<HangmanResponseCodes, string | ((...args: any[]) => string)> = {
  [HangmanResponseCodes.Timeout]: `Timed-out! You took too long to answer.`,
  [HangmanResponseCodes.NotAnAlphabet]: "The given answer is not an English alphabet!",
  [HangmanResponseCodes.AlreadyGuessed]: (letter: string) => `\`${letter}\` has already been guessed.`,
  [HangmanResponseCodes.GuessSuccess]: "Correct ✅! That was a correct guess!",
  [HangmanResponseCodes.WrongGuess]: "Oops! That was a wrong guess!",
  [HangmanResponseCodes.WrongWordGuess]: "Incorrect ❌! That was not the correct word.",
  [HangmanResponseCodes.NextUp]: (user: string) => `Next turn is for <@${user}>.`,
  [HangmanResponseCodes.Winner]: (user: string, word: string) =>
    `The winner of this game is <@${user}> 🎊. The correct word was \`${word}\`.`,
  [HangmanResponseCodes.NotInitialized]:
    "Something went wrong! CurrentPlayer is not initialized yet. Did you call `initialize()`?.",
  [HangmanResponseCodes.FirstRound]: (user: string) =>
    `<@${user}> will start with the first round. The game will start in 3s, be ready!`,
  [HangmanResponseCodes.GuessedFullWord]: (user: string, word: string) =>
    `<@${user}> has correctly guessed the word! Congrats 🎊. The word was \`${word}\`.`,
  [HangmanResponseCodes.SingleModeStart]: (lives: number) =>
    `The game will start soon. You'll have ${lives} lives, each incorrect guess will cost you one live. Try to guess the word before you lives runs out. Good luck!`,
  [HangmanResponseCodes.LivesExhausted]: (word: string) =>
    `Sorry! Looks like you have exhausted your lives. Better luck next time! \`${word}\` was the correct word.`,
  [HangmanResponseCodes.EndmGame]: `Stopped the game!`,
};
export const getHangmanResponse = (code: HangmanResponseCodes, ...args: any[]) => {
  const response = HangmanResponses[code];
  if (typeof response === "function") return response(...args);
  return response;
};

// prettier-ignore
export const EnglishAlphabets = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l",
  "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"] as const;
