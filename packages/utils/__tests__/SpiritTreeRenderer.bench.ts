/**
 * Performance benchmarks for SpiritTreeRenderer
 * Run with: pnpm bench
 */

import { bench, describe } from "vitest";
import { generateSpiritTree } from "../src/classes/SpiritTreeRenderer";
import {
  mockSimpleLinearTree,
  mockBranchingTree,
  mockComplexTree,
  mockSeasonalTree,
  mockLargeTree,
  mockEmptyTree,
} from "./mocks/spiritTreeData.ts";
import type { ISpiritTree, INode } from "@skyhelperbot/constants/skygame-planner";

describe("SpiritTreeRenderer - Performance Benchmarks", () => {
  describe("Tree Complexity Impact", () => {
    bench("render empty tree (1 node)", async () => {
      await generateSpiritTree(mockEmptyTree);
    });

    bench("render simple linear tree (3 nodes)", async () => {
      await generateSpiritTree(mockSimpleLinearTree);
    });

    bench("render branching tree (5 nodes)", async () => {
      await generateSpiritTree(mockBranchingTree);
    });

    bench("render complex tree (13+ nodes)", async () => {
      await generateSpiritTree(mockComplexTree);
    });

    bench("render large tree (100+ nodes)", async () => {
      await generateSpiritTree(mockLargeTree);
    });

    bench("render seasonal tree with badges", async () => {
      await generateSpiritTree(mockSeasonalTree, { season: true });
    });
  });

  describe("Scale Impact on Performance", () => {
    bench("render at scale 0.25x", async () => {
      await generateSpiritTree(mockComplexTree, { scale: 0.25 });
    });

    bench("render at scale 0.5x (default)", async () => {
      await generateSpiritTree(mockComplexTree, { scale: 0.5 });
    });

    bench("render at scale 0.75x", async () => {
      await generateSpiritTree(mockComplexTree, { scale: 0.75 });
    });

    bench("render at scale 1.0x", async () => {
      await generateSpiritTree(mockComplexTree, { scale: 1.0 });
    });

    bench("render at scale 1.5x", async () => {
      await generateSpiritTree(mockComplexTree, { scale: 1.5 });
    });

    bench("render at scale 2.0x", async () => {
      await generateSpiritTree(mockComplexTree, { scale: 2.0 });
    });
  });

  describe("Tree Depth Impact", () => {
    bench("depth 1 (single node)", async () => {
      const tree = createTreeWithDepth(1);
      await generateSpiritTree(tree);
    });

    bench("depth 3", async () => {
      const tree = createTreeWithDepth(3);
      await generateSpiritTree(tree);
    });

    bench("depth 5", async () => {
      const tree = createTreeWithDepth(5);
      await generateSpiritTree(tree);
    });

    bench("depth 7", async () => {
      const tree = createTreeWithDepth(7);
      await generateSpiritTree(tree);
    });

    bench("depth 10", async () => {
      const tree = createTreeWithDepth(10);
      await generateSpiritTree(tree);
    });
  });

  describe("Tree Width Impact (Branching Factor)", () => {
    bench("no branching (linear)", async () => {
      const tree = createTreeWithBranching(5, 0);
      await generateSpiritTree(tree);
    });

    bench("branching factor 1", async () => {
      const tree = createTreeWithBranching(5, 1);
      await generateSpiritTree(tree);
    });

    bench("branching factor 2", async () => {
      const tree = createTreeWithBranching(5, 2);
      await generateSpiritTree(tree);
    });

    bench("branching factor 3", async () => {
      const tree = createTreeWithBranching(5, 3);
      await generateSpiritTree(tree);
    });
  });

  describe("Options Impact", () => {
    bench("no options (default)", async () => {
      await generateSpiritTree(mockComplexTree);
    });

    bench("with custom spirit name", async () => {
      await generateSpiritTree(mockComplexTree, {
        spiritName: "Custom Name",
      });
    });

    bench("with custom spirit URL", async () => {
      await generateSpiritTree(mockComplexTree, {
        spiritUrl:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      });
    });

    bench("with season mode enabled", async () => {
      await generateSpiritTree(mockSeasonalTree, {
        season: true,
      });
    });

    bench("with all options", async () => {
      await generateSpiritTree(mockSeasonalTree, {
        scale: 0.75,
        spiritName: "Custom Name",
        spiritUrl:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        season: true,
      });
    });
  });

  describe("Caching Impact", () => {
    bench("first render (cold cache)", async () => {
      // Create unique tree to avoid cache
      const uniqueTree = {
        ...mockComplexTree,
        guid: `tree-${Math.random()}`,
      };
      await generateSpiritTree(uniqueTree);
    });

    bench("second render (warm cache)", async () => {
      // Reuse same tree for cache benefit
      await generateSpiritTree(mockComplexTree);
    });

    bench("concurrent renders (shared cache)", async () => {
      await Promise.all([
        generateSpiritTree(mockComplexTree),
        generateSpiritTree(mockComplexTree),
        generateSpiritTree(mockComplexTree),
      ]);
    });
  });

  describe("Real-World Scenarios", () => {
    bench("typical spirit tree (5-10 nodes)", async () => {
      await generateSpiritTree(mockBranchingTree);
    });

    bench("season spirit tree (10-15 nodes)", async () => {
      await generateSpiritTree(mockComplexTree, { season: true });
    });

    bench("large constellation tree (15+ nodes)", async () => {
      await generateSpiritTree(mockLargeTree);
    });

    bench("traveling spirit tree (quick render)", async () => {
      await generateSpiritTree(mockSimpleLinearTree, { scale: 0.5 });
    });

    bench("high-quality export (2x scale)", async () => {
      await generateSpiritTree(mockComplexTree, { scale: 2.0 });
    });

    bench("thumbnail generation (0.25x scale)", async () => {
      await generateSpiritTree(mockComplexTree, { scale: 0.25 });
    });
  });

  describe("Batch Processing", () => {
    bench("render 5 trees sequentially", async () => {
      for (let i = 0; i < 5; i++) {
        await generateSpiritTree(mockSimpleLinearTree);
      }
    });

    bench("render 5 trees concurrently", async () => {
      await Promise.all(Array.from({ length: 5 }, () => generateSpiritTree(mockSimpleLinearTree)));
    });

    bench("render 10 trees concurrently", async () => {
      await Promise.all(Array.from({ length: 10 }, () => generateSpiritTree(mockSimpleLinearTree)));
    });
  });

  describe("Edge Cases Performance", () => {
    bench("very wide tree (many branches)", async () => {
      const wideTree = createWideTree(3, 5);
      await generateSpiritTree(wideTree);
    });

    bench("very deep tree (many levels)", async () => {
      const deepTree = createTreeWithDepth(15);
      await generateSpiritTree(deepTree);
    });

    bench("tree with high-cost items (999+ values)", async () => {
      const highCostTree = createHighCostTree();
      await generateSpiritTree(highCostTree);
    });

    bench("tree with all item properties", async () => {
      const fullPropsTree = createFullPropertiesTree();
      await generateSpiritTree(fullPropsTree);
    });
  });
});

// Helper functions for benchmark data generation

function createTreeWithDepth(depth: number): ISpiritTree {
  function createNode(currentDepth: number): INode {
    const node: INode = {
      guid: `depth-node-${currentDepth}-${Math.random()}`,
      item: {
        guid: `depth-item-${currentDepth}`,
        type: "Emote",
        name: `Item ${currentDepth}`,
        icon: "🎯",
        unlocked: currentDepth === 0,
      },
      currency: {
        type: "c",
        amount: currentDepth * 5,
      },
    };

    if (currentDepth < depth) {
      node.n = createNode(currentDepth + 1);
    }

    return node;
  }

  return {
    guid: `depth-tree-${depth}`,
    name: `Depth ${depth} Tree`,
    node: createNode(0),
    spirit: {
      guid: "spirit-depth",
      name: "Depth Test Spirit",
      type: "Regular" as any,
      imageUrl:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    } as any,
  };
}

function createTreeWithBranching(depth: number, branchingFactor: number): ISpiritTree {
  function createNode(currentDepth: number): INode {
    const node: INode = {
      guid: `branch-node-${currentDepth}-${Math.random()}`,
      item: {
        guid: `branch-item-${currentDepth}`,
        type: "Emote",
        name: `Item ${currentDepth}`,
        icon: "🌲",
        unlocked: currentDepth === 0,
      },
      currency: {
        type: "c",
        amount: 10,
      },
    };

    if (currentDepth < depth) {
      node.n = createNode(currentDepth + 1);

      if (branchingFactor >= 1) {
        node.nw = createNode(currentDepth + 1);
      }

      if (branchingFactor >= 2) {
        node.ne = createNode(currentDepth + 1);
      }
    }

    return node;
  }

  return {
    guid: `branching-tree-${depth}-${branchingFactor}`,
    name: `Branching Tree (depth ${depth}, factor ${branchingFactor})`,
    node: createNode(0),
  };
}

function createWideTree(depth: number, branchesPerLevel: number): ISpiritTree {
  function createNode(currentDepth: number, branchIndex: number): INode {
    const node: INode = {
      guid: `wide-node-${currentDepth}-${branchIndex}-${Math.random()}`,
      item: {
        guid: `wide-item-${currentDepth}-${branchIndex}`,
        type: "Emote",
        name: `Item ${currentDepth}-${branchIndex}`,
        icon: "🌿",
        unlocked: false,
      },
      currency: {
        type: "c",
        amount: 5,
      },
    };

    if (currentDepth < depth) {
      // Create multiple branches
      node.n = createNode(currentDepth + 1, 0);
      if (branchesPerLevel >= 2) {
        node.nw = createNode(currentDepth + 1, 1);
      }
      if (branchesPerLevel >= 3) {
        node.ne = createNode(currentDepth + 1, 2);
      }
    }

    return node;
  }

  return {
    guid: `wide-tree-${depth}-${branchesPerLevel}`,
    name: `Wide Tree`,
    node: createNode(0, 0),
  };
}

function createHighCostTree(): ISpiritTree {
  return {
    guid: "high-cost-tree",
    name: "High Cost Tree",
    node: {
      guid: "high-cost-node",
      item: {
        guid: "high-cost-item",
        type: "Cape",
        name: "Expensive Cape",
        icon: "💎",
        unlocked: false,
      },
      currency: {
        type: "c",
        amount: 9999,
      },
      n: {
        guid: "high-cost-node-2",
        item: {
          guid: "high-cost-item-2",
          type: "Outfit",
          name: "Ultra Expensive",
          icon: "👑",
          unlocked: false,
        },
        currency: {
          type: "h",
          amount: 99999,
        },
      },
    },
  };
}

function createFullPropertiesTree(): ISpiritTree {
  return {
    guid: "full-props-tree",
    name: "Full Properties Tree",
    node: {
      guid: "full-props-node",
      item: {
        guid: "full-props-item",
        type: "Music",
        name: "Complete Item",
        icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        unlocked: false,
        level: 10,
        sheet: "999",
        group: "Ultimate",
        season: {
          guid: "season-full",
          name: "Full Season",
          shortName: "Full",
          iconUrl:
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          year: 2024,
          number: 1,
          date: "2024-01-01",
          endDate: "2024-03-01",
          spirits: [],
        } as any,
      },
      currency: {
        type: "ac",
        amount: 50,
      },
    },
    spirit: {
      guid: "spirit-full",
      name: "Full Props Spirit",
      type: "Elder" as any,
      imageUrl:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    } as any,
  };
}
