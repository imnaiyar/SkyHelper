import fs from "fs";
import path from "path";

const OPENAPI_DIR = "./content/docs/openapi";
const META_JSON_PATH = path.join(OPENAPI_DIR, "meta.json");

// Mapping of OpenAPI tags to display names
const TAG_TO_GROUP = {
  Application: "Application",
  "Bot Statistics": "Bot Statistics",
  "Guild Management": "Guild Management",
  "User Management": "User Management",
  "Event Management": "Event Management",
};

async function fetchOpenAPISpec() {
  const specUrl =
    process.env.NODE_ENV === "development"
      ? "../../packages/skyhelper/openapi.json"
      : "https://raw.githubusercontent.com/imnaiyar/skyhelper-openapi-spec/refs/heads/main/openapi.json";

  if (process.env.NODE_ENV === "development") {
    // Read local file
    const specContent = fs.readFileSync(path.resolve(specUrl), "utf8");
    return JSON.parse(specContent);
  } else {
    // Fetch from URL
    const response = await fetch(specUrl);
    return await response.json();
  }
}

function extractTagFromOperation(operation) {
  return operation.tags?.[0] || "Uncategorized";
}

async function groupOpenAPIDocsByTags() {
  try {
    console.log("🚀 Starting OpenAPI docs grouping script...");
    console.log("Fetching OpenAPI specification...");
    const openApiSpec = await fetchOpenAPISpec();

    console.log("Analyzing endpoints and their tags...");

    // Get all MDX files (excluding index.mdx)
    const files = fs.readdirSync(OPENAPI_DIR).filter((file) => file.endsWith(".mdx") && file !== "index.mdx");

    console.log(`Found ${files.length} MDX files to process`);

    // Group endpoints by tags
    const groupedEndpoints = {};

    // Read each file to get its path and method, then match with OpenAPI spec
    for (const fileName of files) {
      try {
        const filePath = path.join(OPENAPI_DIR, fileName);
        const content = fs.readFileSync(filePath, "utf8");
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

        if (frontmatterMatch) {
          const frontmatter = frontmatterMatch[1];

          // Extract method and route from frontmatter
          const methodMatch = frontmatter.match(/method:\s*(\w+)/);
          const routeMatch = frontmatter.match(/route:\s*(.+)/);

          if (methodMatch && routeMatch) {
            const method = methodMatch[1].toLowerCase();
            const route = routeMatch[1].trim();

            console.log(`Processing ${fileName}: ${method.toUpperCase()} ${route}`);

            // Find the corresponding operation in OpenAPI spec
            const pathItem = openApiSpec.paths[route];
            if (pathItem && pathItem[method]) {
              const operation = pathItem[method];
              const tag = extractTagFromOperation(operation);
              const groupName = TAG_TO_GROUP[tag] || "Uncategorized";

              if (!groupedEndpoints[groupName]) {
                groupedEndpoints[groupName] = [];
              }

              const fileNameWithoutExt = fileName.replace(".mdx", "");
              groupedEndpoints[groupName].push(fileNameWithoutExt);

              console.log(`  → Grouped under: ${groupName}`);
            } else {
              console.warn(`  → No matching operation found in OpenAPI spec`);
            }
          } else {
            console.warn(`  → Could not extract method/route from frontmatter`);
          }
        } else {
          console.warn(`  → No frontmatter found in ${fileName}`);
        }
      } catch (error) {
        console.warn(`  → Error processing ${fileName}:`, error.message);
      }
    }

    console.log("Grouped endpoints:", groupedEndpoints);

    // Build the new pages array with groups
    const pages = ["index"];

    // Add separators and grouped endpoints in a specific order
    const groupOrder = ["Application", "Bot Statistics", "Guild Management", "User Management", "Event Management"];

    for (const groupName of groupOrder) {
      const endpoints = groupedEndpoints[groupName];
      if (endpoints && endpoints.length > 0) {
        pages.push(`---${groupName}---`);
        pages.push(...endpoints.sort());
      }
    }

    // Add any uncategorized endpoints
    if (groupedEndpoints["Uncategorized"] && groupedEndpoints["Uncategorized"].length > 0) {
      pages.push("---Uncategorized---");
      pages.push(...groupedEndpoints["Uncategorized"].sort());
    }

    // Read current meta.json
    const currentMeta = JSON.parse(fs.readFileSync(META_JSON_PATH, "utf8"));

    // Update with grouped pages
    const newMeta = {
      ...currentMeta,
      pages: pages,
    };

    // Write back the updated meta.json
    fs.writeFileSync(META_JSON_PATH, JSON.stringify(newMeta, null, 2));

    console.log("✅ Successfully grouped OpenAPI documentation in meta.json");
    console.log(
      `📊 Created ${Object.keys(groupedEndpoints).length} groups with ${pages.length - Object.keys(groupedEndpoints).length - 1} total endpoint pages`,
    );

    // Display the final structure
    console.log("\n📋 Final sidebar structure:");
    pages.forEach((page) => {
      if (page.startsWith("---") && page.endsWith("---")) {
        console.log(`  ${page}`);
      } else if (page === "index") {
        console.log(`  📄 ${page}`);
      } else {
        console.log(`    📄 ${page}`);
      }
    });
  } catch (error) {
    console.error("❌ Error grouping OpenAPI docs:", error);
    process.exit(1);
  }
}

// Run the script
console.log("🎯 Script starting...");
groupOpenAPIDocsByTags().catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});
