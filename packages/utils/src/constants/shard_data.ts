import { RealmValue, zone, type RealmKey } from "@skyhelperbot/constants";
import { DateTime, Duration } from "luxon";

const realms = Object.values(RealmValue).slice(4); // remove first 4 that are `home`, `eden`, `aviary`, and `isle` where shard doesn't land

export const Areas = {
  PRAIRIE_BUTTERFLY: "prairie.butterfly",
  PRAIRIE_VILLAGE: "prairie.village",
  PRAIRIE_CAVE: "prairie.cave",
  PRAIRIE_BIRD: "prairie.bird",
  PRAIRIE_ISLAND: "prairie.island",
  FOREST_BROOK: "forest.brook",
  FOREST_BONEYARD: "forest.boneyard",
  FOREST_END: "forest.end",
  FOREST_TREE: "forest.tree",
  FOREST_SUNNY: "forest.sunny",
  VALLEY_RINK: "valley.rink",
  VALLEY_DREAMS: "valley.dreams",
  VALLEY_HERMIT: "valley.hermit",
  WASTELAND_TEMPLE: "wasteland.temple",
  WASTELAND_BATTLEFIELD: "wasteland.battlefield",
  WASTELAND_GRAVEYARD: "wasteland.graveyard",
  WASTELAND_CRAB: "wasteland.crab",
  WASTELAND_ARK: "wasteland.ark",
  VAULT_STARLIGHT: "vault.starlight",
  VAULT_JELLY: "vault.jelly",
} as const;

export type AreaKey = (typeof Areas)[keyof typeof Areas];

interface ShardInfo {
  offset: Duration;
  /** ISO weekday numbers: Monday = 1 ... Sunday = 7 (matches Luxon's `weekday`). */
  noShardDays: number[];
  rewards: number;
  areas: AreaKey[];
}

export interface ShardMusic {
  name: string;
  spotifyLink: string;
}

const shardInfos: ShardInfo[] = [
  // light red shard
  {
    offset: Duration.fromObject({ hours: 7, minutes: 40 }),
    noShardDays: [1, 2],
    areas: [Areas.PRAIRIE_CAVE, Areas.FOREST_END, Areas.VALLEY_DREAMS, Areas.WASTELAND_GRAVEYARD, Areas.VAULT_JELLY],
    rewards: 2.0,
  },
  // medium
  {
    offset: Duration.fromObject({ hours: 2, minutes: 20 }),
    noShardDays: [2, 3],
    areas: [Areas.PRAIRIE_BIRD, Areas.FOREST_TREE, Areas.VALLEY_DREAMS, Areas.WASTELAND_CRAB, Areas.VAULT_JELLY],
    rewards: 2.5,
  },
  // strong
  {
    offset: Duration.fromObject({ hours: 3, minutes: 30 }),
    noShardDays: [3, 4],
    areas: [Areas.PRAIRIE_ISLAND, Areas.FOREST_SUNNY, Areas.VALLEY_HERMIT, Areas.WASTELAND_ARK, Areas.VAULT_JELLY],
    rewards: 3.5,
  },
  // black shards
  {
    offset: Duration.fromObject({ hours: 2, minutes: 10 }),
    noShardDays: [7, 1],
    rewards: 200,
    areas: [Areas.PRAIRIE_VILLAGE, Areas.FOREST_BONEYARD, Areas.VALLEY_RINK, Areas.WASTELAND_BATTLEFIELD, Areas.VAULT_STARLIGHT],
  },
  {
    offset: Duration.fromObject({ hours: 1, minutes: 50 }),
    noShardDays: [6, 7],
    rewards: 200,
    areas: [Areas.PRAIRIE_BUTTERFLY, Areas.FOREST_BROOK, Areas.VALLEY_RINK, Areas.WASTELAND_TEMPLE, Areas.VAULT_STARLIGHT],
  },
];

const blackShardInterval = Duration.fromObject({ hours: 8 });
const redShardInterval = Duration.fromObject({ hours: 6 });

const skyChangeOffset = Duration.fromObject({ minutes: -32, seconds: -10 });
const shardLandOffset = Duration.fromObject({ minutes: 8, seconds: 40 });
const shardEndOffset = Duration.fromObject({ hours: 4 });

const blackShardMusic = "An Abrupt Premonition";
const blackShardMusicLink = "https://open.spotify.com/track/11FRruXhXnDJtZUsQyLXjP?si=c3fa48ba2e2e4e6e";

const redShardMusic = "Lights Afar";
const redShardMusicLink = "https://open.spotify.com/track/7jiyGCWrxYnVeXJZihRGFf?si=743089ef433d4983";

const mediumShardMusic = "Of The Essence";
const mediumShardMusicLink = "https://open.spotify.com/track/5Xf6BwbnHfpUhSU7Z7Upqr?si=c58586809d23462f";

export interface ShardOccurrence {
  skyChange: DateTime;
  gateShard: DateTime;
  shardLand: DateTime;
  shardEnd: DateTime;
}

export interface ShardData {
  type: "red" | "black";
  reward: number;
  areaKey: AreaKey;
  /** Realm key used to get localization */
  realmKey: RealmKey;
  occurrences: ShardOccurrence[];
  music: ShardMusic;
}

const rewardsOverride = new Map<AreaKey, number>([
  [Areas.FOREST_END, 2.0],
  [Areas.VALLEY_DREAMS, 2.5],
  [Areas.VAULT_JELLY, 3.5],
  [Areas.FOREST_TREE, 3.5],
]);

/**
 * Computes shard data for a given calendar date, or `null` if no shard occurs.
 */
export function getShardData(date: DateTime): ShardData | null {
  const today = date.setZone(zone).startOf("day");

  const day = date.day;

  // Red shards occur on odd days, black on even days.
  // @see https://github.com/PlutoyDev/sky-shards/blob/production/ShardPredictionRule.md
  // for detailed shard rule
  const isRedShard = day % 2 === 1;
  const realmIndex = (day - 1) % 5;

  const infoIndex = isRedShard ? Math.floor((day - 1) / 2) % 3 : 3 + Math.floor(((day - 2) % 4) / 2);

  const shard = shardInfos[infoIndex]!;

  // Luxon's `weekday` is already ISO: Monday = 1 ... Sunday = 7.
  if (shard.noShardDays.includes(today.weekday)) return null;

  const areaKey = shard.areas[realmIndex]!;

  let firstInstant = today.plus(shard.offset);
  const interval = isRedShard ? redShardInterval : blackShardInterval;

  // handle dst change if any
  if (today.isInDST !== firstInstant.isInDST) {
    firstInstant = firstInstant.plus({ hour: firstInstant.isInDST ? -1 : 1 });
  }

  const occurrences: ShardOccurrence[] = Array.from({ length: 3 }, (_, index) => {
    const offset = firstInstant.plus(Duration.fromMillis(interval.toMillis() * index));

    return {
      skyChange: offset.plus(skyChangeOffset),
      gateShard: offset,
      shardLand: offset.plus(shardLandOffset),
      shardEnd: offset.plus(shardEndOffset),
    };
  });

  const music: ShardMusic = !isRedShard
    ? { name: blackShardMusic, spotifyLink: blackShardMusicLink }
    : // medium shard is at index 2 in the info list
      // I agree not the best way to determine this nor is it future-proof, but alas
      infoIndex === 2
      ? { name: mediumShardMusic, spotifyLink: mediumShardMusicLink }
      : { name: redShardMusic, spotifyLink: redShardMusicLink };

  return {
    type: isRedShard ? "red" : "black",
    reward: rewardsOverride.get(areaKey) ?? shard.rewards,
    occurrences,
    areaKey,
    realmKey: realms[realmIndex]!,
    music,
  };
}
