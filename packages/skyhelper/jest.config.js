/** @type { import('jest').Config } */
const config = {
  testEnvironment: "node",
  testTimeout: 30_000,
  collectCoverage: true,
  clearMocks: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  roots: ["."],

  // ESM support:
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^@/api/(.*)$": "<rootDir>/src/api/$1.ts",
    "^@/structures$": "<rootDir>/src/bot/structures/index.ts",
    "^@/types/(.*)$": "<rootDir>/src/bot/@types/$1.ts",
    "^@/config$": "<rootDir>/src/config.ts",
    "^@/(.*)$": "<rootDir>/src/bot/$1",
  },
  transform: {
    "^.+\\.m?[tj]sx?$": [
      "ts-jest",
      {
        useESM: true,
        isolatedModules: true,
      },
    ],
  },

  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/docs/"],
};
export default config;
