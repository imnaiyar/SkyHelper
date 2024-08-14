import type { SpiritsData } from "#libs/types";
import realmsSData from "./base/index.js";
import seasonalSData from "./seasonal/index.js";
const spiritsData: Record<string, SpiritsData> = {
  ...realmsSData,
  ...seasonalSData,
};
export default spiritsData;
