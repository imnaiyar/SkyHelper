/**
 * Mock data for SpiritTreeRenderer tests
 * This file contains various spirit tree configurations to test different scenarios
 * All icons use import locally to avoid network requests during tests
 */

import type { ISpiritTree, INode, ISpirit, ISeason } from "@skyhelperbot/constants/skygame-planner";
import path from "node:path";

export const MOCK_ICON_URL = () => path.join(import.meta.dirname, `icon_${Math.floor(Math.random() * 10)}.png`);

export const MOCK_SPIRIT_IMAGE = path.join(import.meta.dirname, "navigator.png");

/**
 * Simple linear spirit tree with 3 nodes in a vertical chain
 */
export const mockSimpleLinearTree = {
  guid: "tree-simple-linear",
  name: "Simple Spirit",
  node: {
    guid: "node-1",
    item: {
      guid: "item-1",
      type: "Emote",
      name: "Wave",
      icon: MOCK_ICON_URL(),
      unlocked: true,
    },
    currency: {
      type: "c",
      amount: 5,
    },
    n: {
      guid: "node-2",
      item: {
        guid: "item-2",
        type: "Cape",
        name: "Simple Cape",
        icon: MOCK_ICON_URL(),
        unlocked: false,
      },
      currency: {
        type: "h",
        amount: 2,
      },
      n: {
        guid: "node-3",
        item: {
          guid: "item-3",
          type: "Mask",
          name: "Mask",
          icon: MOCK_ICON_URL(),
          unlocked: false,
        },
        currency: {
          type: "c",
          amount: 10,
        },
      },
    },
  },
  spirit: {
    guid: "spirit-simple",
    name: "Simple Spirit",
    type: "Regular" as any,
  } as ISpirit,
} as const;

/**
 * Branching tree with nw and ne branches
 */
export const mockBranchingTree = {
  guid: "tree-branching",
  name: "Branching Spirit",
  node: {
    guid: "root",
    item: {
      guid: "item-root",
      type: "Emote",
      name: "Root Emote",
      icon: MOCK_ICON_URL(),
      unlocked: true,
    },
    currency: { type: "c", amount: 3 },
    n: {
      guid: "center-1",
      item: {
        guid: "item-center-1",
        type: "Hair",
        name: "Center Hair",
        icon: MOCK_ICON_URL(),
        unlocked: false,
      },
      currency: { type: "h", amount: 1 },
      nw: {
        guid: "left-branch",
        item: {
          guid: "item-left",
          type: "Cape",
          name: "Left Cape",
          icon: MOCK_ICON_URL(),
          unlocked: false,
        },
        currency: { type: "c", amount: 15 },
      },
      ne: {
        guid: "right-branch",
        item: {
          guid: "item-right",
          type: "Mask",
          name: "Right Mask",
          icon: MOCK_ICON_URL(),
          unlocked: false,
        },
        currency: { type: "c", amount: 20 },
      },
    },
  },
  spirit: {
    guid: "spirit-branching",
    name: "Branching Spirit",
    type: "Regular" as any,
    imageUrl: MOCK_SPIRIT_IMAGE as any,
  } as ISpirit,
} as const;

/**
 * Complex tree with deep nesting and multiple branches
 */
export const mockComplexTree = {
  guid: "tree-complex",
  name: "Complex Spirit Tree",
  node: {
    guid: "complex-root",
    item: {
      guid: "item-complex-root",
      type: "Emote",
      name: "Starting Emote",
      icon: MOCK_ICON_URL(),
      unlocked: true,
    },
    currency: { type: "c", amount: 5 },
    n: {
      guid: "complex-center-1",
      item: {
        guid: "item-complex-1",
        type: "Hair",
        name: "Hair Style 1",
        icon: MOCK_ICON_URL(),
        level: 1,
        unlocked: false,
      },
      currency: { type: "h", amount: 2 },
      nw: {
        guid: "complex-left-1",
        item: {
          guid: "item-complex-left-1",
          type: "Cape",
          name: "Left Cape",
          icon: MOCK_ICON_URL(),
          unlocked: false,
        },
        currency: { type: "c", amount: 10 },
        n: {
          guid: "complex-left-1-down",
          item: {
            guid: "item-complex-left-1-down",
            type: "Prop",
            name: "Left Prop",
            icon: MOCK_ICON_URL(),
            unlocked: false,
          },
          currency: { type: "c", amount: 8 },
        },
      },
      ne: {
        guid: "complex-right-1",
        item: {
          guid: "item-complex-right-1",
          type: "Mask",
          name: "Right Mask",
          icon: MOCK_ICON_URL(),
          unlocked: false,
        },
        currency: { type: "c", amount: 12 },
        n: {
          guid: "complex-right-1-down",
          item: {
            guid: "item-complex-right-1-down",
            type: "Shoes",
            name: "Right Shoes",
            icon: MOCK_ICON_URL(),
            unlocked: false,
          },
          currency: { type: "c", amount: 15 },
        },
      },
      n: {
        guid: "complex-center-2",
        item: {
          guid: "item-complex-2",
          type: "Emote",
          name: "Center Emote",
          icon: MOCK_ICON_URL(),
          level: 2,
          unlocked: false,
        },
        currency: { type: "sc", amount: 5 },
        nw: {
          guid: "complex-left-2",
          item: {
            guid: "item-complex-left-2",
            type: "Outfit",
            name: "Special Outfit",
            icon: MOCK_ICON_URL(),
            unlocked: false,
          },
          currency: { type: "h", amount: 3 },
        },
        ne: {
          guid: "complex-right-2",
          item: {
            guid: "item-complex-right-2",
            type: "Music",
            name: "Instrument",
            icon: MOCK_ICON_URL(),
            sheet: "123",
            unlocked: false,
          },
          currency: { type: "c", amount: 25 },
        },
      },
    },
  },
  spirit: {
    guid: "spirit-complex",
    name: "Complex Spirit",
    type: "Regular" as any,
    imageUrl: MOCK_SPIRIT_IMAGE as any,
  } as ISpirit,
} as const;

/**
 * Seasonal spirit tree with season badges
 */
export const mockSeasonalTree = {
  guid: "tree-seasonal",
  name: "Seasonal Spirit",
  node: {
    guid: "season-root",
    item: {
      guid: "item-season-root",
      type: "Emote",
      name: "Season Emote",
      icon: MOCK_ICON_URL(),
      group: "SeasonPass",
      unlocked: true,
      season: {
        guid: "season-test",
        name: "Test Season",
        shortName: "Test",
        iconUrl: MOCK_ICON_URL(),
        year: 2024,
        number: 1,
        date: "2024-01-01",
        endDate: "2024-03-01",
        spirits: [],
      } as ISeason,
    },
    currency: { type: "sc", amount: 10 },
    n: {
      guid: "season-node-1",
      item: {
        guid: "item-season-1",
        type: "Cape",
        name: "Ultimate Cape",
        icon: MOCK_ICON_URL(),
        group: "Ultimate",
        unlocked: false,
        season: {
          guid: "season-test",
          name: "Test Season",
          shortName: "Test",
          iconUrl: MOCK_ICON_URL(),
          year: 2024,
          number: 1,
          date: "2024-01-01",
          endDate: "2024-03-01",
          spirits: [],
        } as ISeason,
      },
      currency: { type: "sh", amount: 3 },
    },
  },
  spirit: {
    guid: "spirit-seasonal",
    name: "Seasonal Spirit",
    type: "Season" as any,
    imageUrl: MOCK_SPIRIT_IMAGE as any,
  } as ISpirit,
} as const;

/**
 * Large tree with many nodes for performance testing
 */
export const mockLargeTree = {
  guid: "tree-large",
  name: "Large Spirit Tree",
  node: generateLargeTreeNode(0, 5, 3), // depth 5, branching factor 3
  spirit: {
    guid: "spirit-large",
    name: "Large Spirit",
    type: "Regular" as any,
    imageUrl: MOCK_SPIRIT_IMAGE as any,
  } as ISpirit,
} as const;

/**
 * Helper function to generate a large tree recursively
 */
function generateLargeTreeNode(depth: number, maxDepth: number, branchFactor: number): INode {
  const node: INode = {
    guid: `large-node-${depth}-${Math.random().toString(36).substring(2, 9)}`,
    item: {
      guid: `large-item-${depth}`,
      type: depth % 5 === 0 ? "Emote" : depth % 5 === 1 ? "Cape" : depth % 5 === 2 ? "Hair" : depth % 5 === 3 ? "Mask" : "Outfit",
      name: `Item at depth ${depth}`,
      icon: MOCK_ICON_URL(),
      unlocked: depth === 0,
      level: depth > 0 ? depth : undefined,
    },
    currency: {
      type: depth % 3 === 0 ? "c" : depth % 3 === 1 ? "h" : "sc",
      amount: Math.floor(Math.random() * 50) + 5,
    },
  };

  if (depth < maxDepth) {
    // Always add center node
    node.n = generateLargeTreeNode(depth + 1, maxDepth, branchFactor);

    // Add branches based on branching factor
    if (branchFactor >= 2) {
      node.nw = generateLargeTreeNode(depth + 1, maxDepth, branchFactor - 1);
    }
    if (branchFactor >= 3) {
      node.ne = generateLargeTreeNode(depth + 1, maxDepth, branchFactor - 1);
    }
  }

  return node;
}

/**
 * Edge case: Empty tree with only root node
 */
export const mockEmptyTree = {
  guid: "tree-empty",
  name: "Empty Spirit",
  node: {
    guid: "empty-node",
    item: {
      guid: "item-empty",
      type: "Emote",
      name: "Only Emote",
      icon: MOCK_ICON_URL(),
      unlocked: true,
    },
    currency: { type: "c", amount: 0 },
  },
  spirit: {
    guid: "spirit-empty",
    name: "Empty Spirit",
    type: "Regular" as any,
    imageUrl: MOCK_SPIRIT_IMAGE as any,
  } as ISpirit,
} as const;

/**
 * Edge case: Tree without spirit info
 */
export const mockTreeWithoutSpirit = {
  guid: "tree-no-spirit",
  name: "No Spirit Tree",
  node: {
    guid: "no-spirit-node",
    item: {
      guid: "item-no-spirit",
      type: "Emote",
      name: "Standalone Emote",
      icon: MOCK_ICON_URL(),
      unlocked: true,
    },
    currency: { type: "c", amount: 5 },
  },
} as const;

/**
 * Edge case: Tree with circular reference prevention test
 * Note: We don't actually create a true circular reference as it would break JSON serialization
 * Instead, we test that the visited set prevents revisiting the same node
 */
export const mockCircularRefTree = {
  guid: "tree-circular",
  name: "Circular Test",
  node: {
    guid: "circular-node-1",
    item: {
      guid: "item-circular-1",
      type: "Emote",
      name: "Node 1",
      icon: MOCK_ICON_URL(),
      unlocked: true,
    },
    currency: { type: "c", amount: 5 },
    n: {
      guid: "circular-node-2",
      item: {
        guid: "item-circular-2",
        type: "Cape",
        name: "Node 2",
        icon: MOCK_ICON_URL(),
        unlocked: false,
      },
      currency: { type: "h", amount: 2 },
      n: {
        guid: "circular-node-3",
        item: {
          guid: "item-circular-3",
          type: "Mask",
          name: "Node 3",
          icon: MOCK_ICON_URL(),
          unlocked: false,
        },
        currency: { type: "c", amount: 3 },
      },
    },
  },
  spirit: {
    guid: "spirit-circular",
    name: "Circular Spirit",
    type: "Regular" as any,
    imageUrl: MOCK_ICON_URL(),
  } as ISpirit,
} as const;

/**
 * Tree with items that have all possible properties
 */
export const mockTreeWithAllProperties = {
  guid: "tree-all-props",
  name: "All Properties Tree",
  node: {
    guid: "all-props-node",
    item: {
      guid: "item-all-props",
      type: "Music",
      name: "Complete Item",
      icon: MOCK_ICON_URL(),
      unlocked: false,
      level: 4,
      sheet: "456",
      group: "Ultimate",
      season: {
        guid: "season-all-props",
        name: "Complete Season",
        shortName: "Complete",
        iconUrl: MOCK_ICON_URL(),
        year: 2024,
        number: 2,
        date: "2024-04-01",
        endDate: "2024-06-01",
        spirits: [],
      } as ISeason,
    },
    currency: { type: "ac", amount: 15 },
  },
  spirit: {
    guid: "spirit-all-props",
    name: "Complete Spirit",
    type: "Elder" as any,
    imageUrl: MOCK_ICON_URL(),
  } as ISpirit,
} as const;

/**
 * Tree with high-cost items (edge case for rendering)
 */
export const mockHighCostTree = {
  guid: "tree-high-cost",
  name: "High Cost Tree",
  node: {
    guid: "high-cost-node-1",
    item: {
      guid: "item-high-cost-1",
      type: "Cape",
      name: "Expensive Cape",
      icon: MOCK_ICON_URL(),
      unlocked: false,
    },
    currency: { type: "c", amount: 999 },
    n: {
      guid: "high-cost-node-2",
      item: {
        guid: "item-high-cost-2",
        type: "Outfit",
        name: "Ultra Expensive Outfit",
        icon: MOCK_ICON_URL(),
        unlocked: false,
      },
      currency: { type: "h", amount: 9999 },
    },
  },
  spirit: {
    guid: "spirit-high-cost",
    name: "Expensive Spirit",
    type: "Regular" as any,
    imageUrl: MOCK_ICON_URL(),
  } as ISpirit,
} as const;

/**
 * Tree with items that have no currency cost
 */
export const mockNoCostTree: ISpiritTree = {
  guid: "tree-no-cost",
  name: "Free Items Tree",
  node: {
    guid: "no-cost-node",
    item: {
      guid: "item-no-cost",
      type: "WingBuff",
      name: "Free Wing Buff",
      icon: MOCK_ICON_URL(),
      unlocked: true,
    },
  },
  spirit: {
    guid: "spirit-no-cost",
    name: "Generous Spirit",
    type: "Guide" as any,
    imageUrl: MOCK_ICON_URL(),
  } as ISpirit,
} as const;

/**
 * All mock trees for easy iteration in tests
 */
export const allMockTrees = {
  simple: mockSimpleLinearTree,
  branching: mockBranchingTree,
  complex: mockComplexTree,
  seasonal: mockSeasonalTree,
  large: mockLargeTree,
  empty: mockEmptyTree,
  noSpirit: mockTreeWithoutSpirit,
  circular: mockCircularRefTree,
  allProps: mockTreeWithAllProperties,
  highCost: mockHighCostTree,
  noCost: mockNoCostTree,
};
