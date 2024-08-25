import type { SpiritsData } from "./type.d.ts";
import realmsSData from "./base/index.js";
import seasonalSData from "./seasonal/index.js";
const spiritsData: Record<string, SpiritsData> = {
  ...realmsSData,
  ...seasonalSData,
};
export default spiritsData;
