import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL, URL } from "node:url";

// Replicate "lodash.get" function
const _get = (obj, _path) => {
  return _path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
};

const root = pathToFileURL(`${process.cwd()}/`);

const aliases = await loadPathAliasMap();

// Sort aliases by longest key first
const sortedAliases = [...aliases.entries()].sort((a, b) => b[0].length - a[0].length);
export { resolvePathAliases as resolve };

/**
 * @type {import('node:module').LoadHook}
 */
export function resolvePathAliases(specifier, ctx, next) {
  for (const [key, dest] of sortedAliases) {
    if (key.endsWith("*") && specifier.startsWith(key.slice(0, -1))) {
      let replaced = specifier.replace(key.replace("*", ""), dest);
      // Append `.js` if it's missing (and not a directory)
      if (!replaced.endsWith(".js") && !replaced.endsWith("/")) {
        replaced = replaced + ".js";
      }

      specifier = replaced;
      break;
    }

    if (specifier === key) {
      specifier = dest;
      break;
    }
  }

  return next(specifier, ctx);
}

export async function loadPathAliasMap() {
  const filepath = path.join(process.cwd(), "tsconfig.json");

  const config = await readFile(filepath).then(
    (cnf) =>
      cnf
        .toString()
        .replace(/\/\/.*$/gm, "") // Remove single line comments
        .replace(/\/\*[\s\S]*?\*\//g, ""), // remove multi line comments
  );

  const json = _get(JSON.parse(config), "compilerOptions.paths");

  /** @type {Map<string, string>} */
  const _aliases = new Map();

  for (const [key, alias] of Object.entries(json)) {
    // strip .js and replace `src` with `dist` folder
    const aliasPath = alias[0].replace(/\*.js$/, "").replace("src", "dist");

    const dest = new URL(aliasPath, root).href;
    _aliases.set(key, dest);
  }

  return _aliases;
}
