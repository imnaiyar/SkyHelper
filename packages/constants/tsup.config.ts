import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/spirits-datas/index.ts"],
  format: ["esm"],
  minify: true,
  sourcemap: true,
  clean: true,
});
