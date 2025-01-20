/** ALL RIGHTS RESERVED TO {@link https://github.com/nodejs-loaders/nodejs-loaders} */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL, URL } from "node:url";

const _get = (obj, _path) => {
  return _path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
};

const projectRoot = pathToFileURL(`${process.cwd()}/`);

const aliases = await readConfigFile("tsconfig.json");

if (!aliases) {
  console.warn('Alias loader was registered but no "paths" were found in tsconfig.json');
}

// Sort aliases by longest key first
const sortedAliases = [...aliases.entries()].sort((a, b) => b[0].length - a[0].length);

/**
 * @type {import('node:module').LoadHook}
 */
function resolveAlias(specifier, ctx, next) {
  return (sortedAliases ? resolveAliases : next)(specifier, ctx, next);
}
export { resolveAlias as resolve };

/**
 * @type {import('node:module').LoadHook}
 */
export function resolveAliases(specifier, ctx, next) {
  for (const [key, dest] of sortedAliases) {
    if (specifier === key) {
      specifier = dest;
      break;
    }
    if (specifier.startsWith(key.slice(0, -1))) {
      let replaced = specifier.replace(key.slice(0, -1), dest);

      // Append `.js` if it's missing (and not a directory)
      if (!replaced.endsWith(".js") && !replaced.endsWith("/")) {
        replaced = replaced + ".js";
      }
      specifier = replaced;
      break;
    }
  }

  return next(specifier, ctx);
}

export async function readConfigFile(filename) {
  const filepath = path.join(process.cwd(), filename);
  return (
    readFile(filepath)
      .then(
        (contents) =>
          contents
            .toString()
            .replace(/\/\/.*$/gm, "") // Remove single line comments
            .replace(/\/\*[\s\S]*?\*\//g, ""), // remove multi line comments
      )
      .then((contents) => JSON.parse(contents))
      // Get the `compilerOptions.paths` object from the parsed JSON
      .then((contents) => _get(contents, "compilerOptions.paths"))
      .then(buildAliasMaps)
      .catch((err) => {
        if (err.code !== "ENOENT") throw err;
      })
  );
}

/**
 * @typedef {Map<string, string>} AliasMap
 */

function buildAliasMaps(config) {
  if (!config) return;

  const _aliases = /** @type {AliasMap} */ (new Map());

  for (const rawKey of Object.keys(config)) {
    /** @type {string} */
    const alias = config[rawKey][0];

    const key = rawKey;
    const baseDest = alias.slice(0, -4);
    const dest = baseDest[0] === "/" || URL.canParse(baseDest) ? baseDest : new URL(baseDest, projectRoot).href;

    _aliases.set(key, dest.replace("src", "dist"));
  }

  return _aliases;
}
