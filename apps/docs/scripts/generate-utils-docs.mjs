import { createGenerator, generateFiles } from "fumadocs-typescript";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create a generator with the utils package configuration
const generator = createGenerator({
  tsconfigPath: path.resolve(__dirname, "../../packages/utils/tsconfig.json"),
  basePath: path.resolve(__dirname, "../../packages/utils"),
});

void generateFiles(generator, {
  // Input TypeScript files to generate docs from - exclude index files
  input: ["../../packages/utils/src/**/*.ts", "!../../packages/utils/src/**/index.ts"],
  // Output directory for generated docs
  output: "./content/docs/utils",
  // Transform output to add frontmatter
  transformOutput: (filePath, content) => {
    // Extract just the filename for the title
    const basename = path.basename(filePath, ".mdx");
    const title = basename
      .replace(/([A-Z])/g, " $1") // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
      .trim();

    const frontmatter = `---
title: ${title}
description: TypeScript API documentation for ${basename}
---

`;
    return frontmatter + content;
  },
}).catch(console.error);
