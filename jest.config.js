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
  },
  transform: {
    "^.+\\.m?[tj]sx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },

  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/docs/"],
};
export default config;
