import type { SpiritsData } from "../type.d.ts";
import { readdirSync } from "node:fs";
import path from "node:path";
let toExport: Record<string, SpiritsData> = {};
import { fileURLToPath } from "url";

// Not using `import.meta.dirname` here because it is returning undefined in jest leading to tests being failed
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const paths = readdirSync(__dirname).filter(
  (file) => file.split(".")[0] !== "index" && (file.endsWith(".js") || file.endsWith(".ts")),
);

for (const p of paths) {
  const { default: data } = (await import(path.join(__dirname, p))) as {
    default: Record<string, SpiritsData>;
  };
  toExport = { ...toExport, ...data };
}

export default toExport;
