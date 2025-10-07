import mongoose, { type Document } from "mongoose";
import { LimitedCollection } from "@/utils/classes/LimitedCollection";
import config from "@/config";

export interface UserPlannerData extends Document {
  _id: string; // User ID

  // Unlocked items (by GUID)
  unlockedItems: string[];

  // Unlocked spirit nodes (by node GUID)
  unlockedNodes: string[];

  // Winged Lights collected (by WL GUID)
  collectedWLs: string[];

  // Resources
  candles: number;
  hearts: number;
  ascendedCandles: number;
  seasonalCandles: number;

  // Wing buffs
  wingBuffs: number;

  // Last updated timestamp
  updatedAt: Date;
}

const cache = new LimitedCollection<string, UserPlannerData>({ maxSize: config.CACHE_SIZE.USERS });
export { cache as plannerDataCache };

const Schema = new mongoose.Schema<UserPlannerData>({
  _id: { type: String, required: true },
  unlockedItems: { type: [String], default: [] },
  unlockedNodes: { type: [String], default: [] },
  collectedWLs: { type: [String], default: [] },
  candles: { type: Number, default: 0 },
  hearts: { type: Number, default: 0 },
  ascendedCandles: { type: Number, default: 0 },
  seasonalCandles: { type: Number, default: 0 },
  wingBuffs: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

const Model = mongoose.model<UserPlannerData>("planner_data", Schema);

export { Model as PlannerDataModel };

/**
 * Get or create user planner data
 */
export async function getPlannerData(userId: string): Promise<UserPlannerData> {
  if (!userId) throw new Error("User ID is undefined");

  const cached = cache.get(userId);
  if (cached) return cached;

  let data = await Model.findById(userId);
  if (!data) {
    data = new Model({
      _id: userId,
      unlockedItems: [],
      unlockedNodes: [],
      collectedWLs: [],
      candles: 0,
      hearts: 0,
      ascendedCandles: 0,
      seasonalCandles: 0,
      wingBuffs: 0,
      updatedAt: new Date(),
    });
    await data.save();
  }

  cache.set(userId, data);
  return data;
}

/**
 * Update user planner data
 */
export async function updatePlannerData(
  userId: string,
  updates: Partial<Omit<UserPlannerData, "_id" | "updatedAt">>,
): Promise<UserPlannerData> {
  const data = await getPlannerData(userId);

  Object.assign(data, updates);
  data.updatedAt = new Date();

  await data.save();
  cache.set(userId, data);

  return data;
}

/**
 * Toggle item unlock status
 */
export async function toggleItemUnlock(userId: string, itemGuid: string): Promise<boolean> {
  const data = await getPlannerData(userId);

  const index = data.unlockedItems.indexOf(itemGuid);
  const isNowUnlocked = index === -1;

  if (isNowUnlocked) {
    data.unlockedItems.push(itemGuid);
  } else {
    data.unlockedItems.splice(index, 1);
  }

  data.updatedAt = new Date();
  await data.save();
  cache.set(userId, data);

  return isNowUnlocked;
}

/**
 * Toggle node unlock status
 */
export async function toggleNodeUnlock(userId: string, nodeGuid: string): Promise<boolean> {
  const data = await getPlannerData(userId);

  const index = data.unlockedNodes.indexOf(nodeGuid);
  const isNowUnlocked = index === -1;

  if (isNowUnlocked) {
    data.unlockedNodes.push(nodeGuid);
  } else {
    data.unlockedNodes.splice(index, 1);
  }

  data.updatedAt = new Date();
  await data.save();
  cache.set(userId, data);

  return isNowUnlocked;
}

/**
 * Toggle WL collection status
 */
export async function toggleWLCollection(userId: string, wlGuid: string): Promise<boolean> {
  const data = await getPlannerData(userId);

  const index = data.collectedWLs.indexOf(wlGuid);
  const isNowCollected = index === -1;

  if (isNowCollected) {
    data.collectedWLs.push(wlGuid);
  } else {
    data.collectedWLs.splice(index, 1);
  }

  data.updatedAt = new Date();
  await data.save();
  cache.set(userId, data);

  return isNowCollected;
}
