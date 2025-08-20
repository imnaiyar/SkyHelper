#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
const LOCALE_DIR = path.join(import.meta.dirname, "../packages/constants/locales/en-US");
const SEARCH_DIRS = [path.join(import.meta.dirname, "../packages/jobs"), path.join(import.meta.dirname, "../packages/skyhelper")];

const SEARCH_EXTENSIONS = [".js", ".ts", ".jsx", ".tsx"];
const IGNORED_KEYS = [
  "features:times-embed.EVENTS",
  "features:REALMS",
  "features:reminders.EDEN_RESET",
  "features:reminders.DAILY_RESET",
];
// Colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

/**
 * Recursively get all keys from a nested object with dot notation
 * @param {object} obj - The object to extract keys from
 * @param {string} prefix - The current prefix for nested keys
 * @returns {string[]} Array of dot-notated keys
 */
function extractKeys(obj, prefix = "") {
  const keys = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      keys.push(...extractKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

/**
 * Read and parse all locale files to get all translation keys
 * @returns {Map<string, string[]>} Map of namespace to keys
 */
function getLocaleKeys() {
  const localeKeys = new Map();

  try {
    const files = fs.readdirSync(LOCALE_DIR);

    for (const file of files) {
      if (file.endsWith(".json")) {
        const namespace = path.basename(file, ".json");
        const filePath = path.join(LOCALE_DIR, file);
        const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const keys = extractKeys(content);
        localeKeys.set(namespace, keys);
      }
    }
  } catch (error) {
    console.error(`${colors.red}Error reading locale files:${colors.reset}`, error.message);
    process.exit(1);
  }

  return localeKeys;
}

/**
 * Recursively find all files with specific extensions
 * @param {string} dir - Directory to search
 * @param {string[]} extensions - File extensions to include
 * @returns {string[]} Array of file paths
 */
function findFiles(dir, extensions) {
  const files = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules, .git, dist, and other common directories
        if (!["node_modules", ".git", "dist", ".turbo", "logs", "__tests__"].includes(entry.name)) {
          files.push(...findFiles(fullPath, extensions));
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.warn(`${colors.yellow}Warning: Could not read directory ${dir}:${colors.reset}`, error.message);
  }
  return files;
}

/**
 * Search for translation key usage in source files
 * @param {string[]} files - Array of file paths to search
 * @param {string} namespace - The namespace to search for
 * @param {string} key - The translation key to search for
 * @returns {object[]} Array of usage objects with file and line info
 */
function searchKeyUsage(files, namespace, key) {
  const usages = [];
  const searchPatterns = [
    // Direct usage: t("namespace:key")
    new RegExp(`t\\(["'\`]${namespace}:${key}["'\`]`, "g"),
    // Template literal: t(\`namespace:key\`)
    new RegExp(`t\\(\`${namespace}:${key}\``, "g"),
    // With interpolation: t("namespace:key", {...})
    new RegExp(`t\\(["'\`]${namespace}:${key}["'\`]\\s*,`, "g"),
    // Just "namespace:key" pattern (not inside t())
    new RegExp(`["'\`]${namespace}:${key}["'\`]`, "g"),
  ];

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, "utf8");
      const lines = content.split("\n");

      for (const pattern of searchPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const lineNumber = content.substring(0, match.index).split("\n").length;
          const line = lines[lineNumber - 1];

          usages.push({
            file: path.relative(process.cwd(), file),
            line: lineNumber,
            content: line.trim(),
            match: match[0],
          });
        }
        // Reset regex lastIndex for next iteration
        pattern.lastIndex = 0;
      }
    } catch (error) {
      console.warn(`${colors.yellow}Warning: Could not read file ${file}:${colors.reset}`, error.message);
    }
  }

  return usages;
}

/**
 * Remove unused keys from locale files
 * @param {Map<string, string[]>} unusedKeys - Map of namespace to unused keys
 * @param {boolean} dryRun - If true, only show what would be removed
 */
function removeUnusedKeys(unusedKeys, dryRun = true) {
  for (const [namespace, keys] of unusedKeys) {
    if (keys.length === 0) continue;

    const filePath = path.join(LOCALE_DIR, `${namespace}.json`);

    try {
      const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const originalContent = JSON.stringify(content, null, 2);

      // Remove unused keys
      for (const key of keys) {
        const keyParts = key.split(".");
        let current = content;

        // Navigate to parent object
        for (let i = 0; i < keyParts.length - 1; i++) {
          if (current[keyParts[i]]) {
            current = current[keyParts[i]];
          } else {
            break;
          }
        }

        // Remove the key
        const lastKey = keyParts[keyParts.length - 1];
        // eslint-disable-next-line no-prototype-builtins
        if (current && current.hasOwnProperty(lastKey)) {
          delete current[lastKey];
          console.log(`${colors.red}  - Removed: ${namespace}:${key}${colors.reset}`);
        }
      }

      cleanEmptyObjects(content);

      if (!dryRun) {
        const newContent = JSON.stringify(content, null, 2);
        if (newContent !== originalContent) {
          fs.writeFileSync(filePath, newContent + "\n", "utf8");
          console.log(`${colors.green}✓ Updated ${filePath}${colors.reset}`);
        }
      } else {
        console.log(`${colors.yellow}  (Dry run - no changes made to ${filePath})${colors.reset}`);
      }
    } catch (error) {
      console.error(`${colors.red}Error processing ${filePath}:${colors.reset}`, error.message);
    }
  }
}

// Clean up empty objects
function cleanEmptyObjects(obj) {
  for (const key in obj) {
    if (obj[key] && typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      cleanEmptyObjects(obj[key]);
      if (Object.keys(obj[key]).length === 0) {
        delete obj[key];
      }
    }
  }
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const shouldRemove = args.includes("--remove");
  const dryRun = !shouldRemove;

  console.log(`${colors.cyan}🔍 Checking for unused locale strings...${colors.reset}\n`);

  // Get all locale keys
  console.log(`${colors.blue}📖 Reading locale files from: ${LOCALE_DIR}${colors.reset}`);
  const localeKeys = getLocaleKeys();

  let totalKeys = 0;
  for (const keys of localeKeys.values()) {
    totalKeys += keys.length;
  }
  console.log(`${colors.green}Found ${totalKeys} translation keys across ${localeKeys.size} namespaces${colors.reset}\n`);

  // Find all source files
  console.log(`${colors.blue}🔍 Searching for usage in:${colors.reset}`);
  const allFiles = [];
  for (const dir of SEARCH_DIRS) {
    console.log(`  - ${dir}`);
    const files = findFiles(dir, SEARCH_EXTENSIONS);
    allFiles.push(...files);
  }
  console.log(`${colors.green}Found ${allFiles.length} source files to analyze${colors.reset}\n`);

  // Check usage for each key
  const unusedKeys = new Map();
  const usedKeys = new Map();
  let processedKeys = 0;

  for (const [namespace, keys] of localeKeys) {
    console.log(`${colors.magenta}Checking namespace: ${namespace}${colors.reset}`);
    const namespaceUnused = [];
    const namespaceUsed = [];
    const ignored = [];
    for (const key of keys) {
      processedKeys++;
      process.stdout.write(`\r  Progress: ${processedKeys}/${totalKeys} (${Math.round((processedKeys / totalKeys) * 100)}%)`);
      if (IGNORED_KEYS.some((k) => `${namespace}:${key}`.startsWith(k))) {
        namespaceUsed.push({ key, usages: [] });
        ignored.push(`${namespace}:${key}`);
        continue;
      }
      const usages = searchKeyUsage(allFiles, namespace, key);

      if (usages.length === 0) {
        namespaceUnused.push(key);
      } else {
        namespaceUsed.push({ key, usages });
      }
    }
    unusedKeys.set(namespace, namespaceUnused);
    usedKeys.set(namespace, namespaceUsed);
    if (ignored.length > 0) {
      console.log(`\n  ${colors.yellow}Ignored keys in ${namespace}: ${ignored.length}${colors.reset}`);
      ignored.forEach((key) => console.log(`${colors.yellow}    - ${key}${colors.reset}`));
    }
    console.log(
      `  ${colors.green}✓ Used: ${namespaceUsed.length}${colors.reset} | ${colors.red}✗ Unused: ${namespaceUnused.length}${colors.reset}\n`,
    );
  }

  // Summary
  console.log(`${colors.cyan}📊 Summary:${colors.reset}\n`);

  let totalUnused = 0;
  let totalUsed = 0;

  for (const [namespace, unused] of unusedKeys) {
    const used = usedKeys.get(namespace) || [];
    totalUnused += unused.length;
    totalUsed += used.length;

    console.log(`${colors.blue}${namespace}:${colors.reset}`);
    console.log(`  Used: ${colors.green}${used.length}${colors.reset}`);
    console.log(`  Unused: ${colors.red}${unused.length}${colors.reset}`);

    if (unused.length > 0) {
      console.log(`  ${colors.red}Unused keys:${colors.reset}`);
      unused.forEach((key) => console.log(`    - ${namespace}:${key}`));
    }
    console.log();
  }

  console.log(`${colors.cyan}🎯 Total Results:${colors.reset}`);
  console.log(`  Used keys: ${colors.green}${totalUsed}${colors.reset}`);
  console.log(`  Unused keys: ${colors.red}${totalUnused}${colors.reset}`);
  console.log(`  Total keys: ${totalKeys}`);
  console.log(`  Usage rate: ${colors.green}${Math.round((totalUsed / totalKeys) * 100)}%${colors.reset}\n`);

  // Remove unused keys if requested
  if (totalUnused > 0) {
    if (shouldRemove) {
      console.log(`${colors.yellow}🗑️  Removing unused keys...${colors.reset}\n`);
      removeUnusedKeys(unusedKeys, dryRun);
    } else {
      console.log(`${colors.yellow}💡 To remove unused keys, run with --remove flag${colors.reset}`);
      console.log(`${colors.yellow}   Example: node check-unused-locales.js --remove${colors.reset}`);
    }
  } else {
    console.log(`${colors.green}🎉 All locale keys are being used!${colors.reset}`);
  }
}

// Run the script
main();
