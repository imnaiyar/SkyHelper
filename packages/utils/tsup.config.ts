import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  minify: true,
  sourcemap: true,
  clean: true,
});
