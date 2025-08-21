import { generateFiles } from "fumadocs-openapi";

void generateFiles({
  // the OpenAPI schema, you can also give it an external URL.
  input: [
    process.env.NODE_ENV === "development"
      ? "../../packages/skyhelper/openapi.json"
      : "https://raw.githubusercontent.com/imnaiyar/skyhelper-openapi-spec/refs/heads/main/openapi.json",
  ],
  output: "./content/docs/openapi",
  // we recommend to enable it
  // make sure your endpoint description doesn't break MDX syntax.
  includeDescription: true,
});
