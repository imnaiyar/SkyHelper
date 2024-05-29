import SeasonProgressCard from "#libs/classes/SeasonProgressCard";
import fs from "node:fs";
import { join } from "node:path";
const card = new SeasonProgressCard();
const build = await card.build();
fs.writeFileSync(join(import.meta.dirname, "progress.png"), build);
