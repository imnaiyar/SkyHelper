import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage",
      reporter: ["text", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
    },
    clearMocks: true,
    globals: false,
  },
  plugins: [tsconfigPaths({ ignoreConfigErrors: true })],
});
