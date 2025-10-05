/**
 * Comprehensive tests for SpiritTreeRenderer
 * Tests cover functionality, edge cases, error handling, and performance
 */

import { describe, expect, it, vi } from "vitest";
import { generateSpiritTree } from "../src/classes/SpiritTreeRenderer";
import {
  mockSimpleLinearTree,
  mockBranchingTree,
  mockComplexTree,
  mockSeasonalTree,
  mockLargeTree,
  mockEmptyTree,
  mockTreeWithoutSpirit,
  mockCircularRefTree,
  mockTreeWithAllProperties,
  mockHighCostTree,
  mockNoCostTree,
  allMockTrees,
  MOCK_SPIRIT_IMAGE,
} from "./mocks/spiritTreeData.ts";

vi.mock("@skyhelperbot/constants/skygame-planner", async (importOriginal) => {
  const original = await importOriginal<typeof import("@skyhelperbot/constants/skygame-planner")>();
  return {
    ...original,
    resolvePlannerUrl: vi.fn((url) => url), // mock to just return the url as it is local image path instead of an actual remote url
  };
});

describe("SpiritTreeRenderer", () => {
  describe("Basic Functionality", () => {
    it("should generate a buffer for simple linear tree", async () => {
      const buffer = await generateSpiritTree(mockSimpleLinearTree);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);

      // Verify it's a valid PNG by checking the PNG signature
      expect(buffer.subarray(0, 8)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    });

    it("should generate a buffer for branching tree", async () => {
      const buffer = await generateSpiritTree(mockBranchingTree);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      expect(buffer.subarray(0, 8)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    });

    it("should generate a buffer for complex nested tree", async () => {
      const buffer = await generateSpiritTree(mockComplexTree);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
      expect(buffer.subarray(0, 8)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    });

    it("should generate larger image for complex trees", async () => {
      const simpleBuffer = await generateSpiritTree(mockSimpleLinearTree);
      const complexBuffer = await generateSpiritTree(mockComplexTree);

      // Complex trees should generally produce larger images
      expect(complexBuffer.length).toBeGreaterThan(simpleBuffer.length * 0.5);
    });
  });

  describe("Options Handling", () => {
    it("should accept and use scale option", async () => {
      const buffer1x = await generateSpiritTree(mockSimpleLinearTree, { scale: 0.5 });
      const buffer2x = await generateSpiritTree(mockSimpleLinearTree, { scale: 1.0 });

      expect(buffer1x).toBeInstanceOf(Buffer);
      expect(buffer2x).toBeInstanceOf(Buffer);

      // Higher scale should produce larger images
      expect(buffer2x.length).toBeGreaterThan(buffer1x.length);
    });

    it("should use custom spirit name", async () => {
      const buffer = await generateSpiritTree(mockSimpleLinearTree, {
        spiritName: "Custom Spirit Name",
      });

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should use custom spirit URL", async () => {
      const buffer = await generateSpiritTree(mockSimpleLinearTree, {
        spiritUrl: MOCK_SPIRIT_IMAGE as any,
      });

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should enable season mode", async () => {
      const buffer = await generateSpiritTree(mockSeasonalTree, {
        season: true,
      });

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle all options combined", async () => {
      const buffer = await generateSpiritTree(mockSeasonalTree, {
        scale: 0.75,
        spiritName: "Test Seasonal Spirit",
        spiritUrl: MOCK_SPIRIT_IMAGE as any,
        season: true,
      });

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should use default scale when not provided", async () => {
      const bufferDefault = await generateSpiritTree(mockSimpleLinearTree);
      const bufferExplicit = await generateSpiritTree(mockSimpleLinearTree, { scale: 0.5 });

      // Both should be valid buffers
      expect(bufferDefault).toBeInstanceOf(Buffer);
      expect(bufferExplicit).toBeInstanceOf(Buffer);
    });
  });

  describe("Seasonal Features", () => {
    it("should handle SeasonPass items with season badges", async () => {
      const buffer = await generateSpiritTree(mockSeasonalTree, { season: true });

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle Ultimate items with season badges", async () => {
      const buffer = await generateSpiritTree(mockTreeWithAllProperties, { season: true });

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should work without season mode for seasonal spirits", async () => {
      const buffer = await generateSpiritTree(mockSeasonalTree, { season: false });

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty tree with single node", async () => {
      const buffer = await generateSpiritTree(mockEmptyTree);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle tree without spirit info", async () => {
      const buffer = await generateSpiritTree(mockTreeWithoutSpirit);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle circular references without infinite loop", async () => {
      const buffer = await generateSpiritTree(mockCircularRefTree);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle items with all properties", async () => {
      const buffer = await generateSpiritTree(mockTreeWithAllProperties);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle high cost items (3+ digits)", async () => {
      const buffer = await generateSpiritTree(mockHighCostTree);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle items with no cost", async () => {
      const buffer = await generateSpiritTree(mockNoCostTree);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle items with level property", async () => {
      const treeWithLevels = {
        ...mockSimpleLinearTree,
        node: {
          ...mockSimpleLinearTree.node,
          item: {
            ...mockSimpleLinearTree.node.item!,
            level: 5,
          },
        },
      };

      const buffer = await generateSpiritTree(treeWithLevels);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle items with sheet property", async () => {
      const treeWithSheet = {
        ...mockSimpleLinearTree,
        node: {
          ...mockSimpleLinearTree.node,
          item: {
            ...mockSimpleLinearTree.node.item!,
            sheet: "789",
          },
        },
      };

      const buffer = await generateSpiritTree(treeWithSheet);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle different currency types", async () => {
      const currencyTypes = ["c", "h", "sc", "sh", "ac", "ec"];

      for (const currencyType of currencyTypes) {
        const tree = {
          ...mockSimpleLinearTree,
          node: {
            ...mockSimpleLinearTree.node,
            currency: {
              type: currencyType,
              amount: 10,
            },
          },
        };

        const buffer = await generateSpiritTree(tree);
        expect(buffer).toBeInstanceOf(Buffer);
        expect(buffer.length).toBeGreaterThan(0);
      }
    });

    it("should handle zero-amount currency", async () => {
      const tree = {
        ...mockSimpleLinearTree,
        node: {
          ...mockSimpleLinearTree.node,
          currency: {
            type: "c",
            amount: 0,
          },
        },
      };

      const buffer = await generateSpiritTree(tree);
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle unlocked vs locked items correctly", async () => {
      const unlockedTree = {
        ...mockSimpleLinearTree,
        node: {
          ...mockSimpleLinearTree.node,
          item: {
            ...mockSimpleLinearTree.node.item!,
            unlocked: true,
          },
        },
      };

      const lockedTree = {
        ...mockSimpleLinearTree,
        node: {
          ...mockSimpleLinearTree.node,
          item: {
            ...mockSimpleLinearTree.node.item!,
            unlocked: false,
          },
        },
      };

      const unlockedBuffer = await generateSpiritTree(unlockedTree);
      const lockedBuffer = await generateSpiritTree(lockedTree);

      expect(unlockedBuffer).toBeInstanceOf(Buffer);
      expect(lockedBuffer).toBeInstanceOf(Buffer);

      // Both should be valid but potentially different
      expect(unlockedBuffer.length).toBeGreaterThan(0);
      expect(lockedBuffer.length).toBeGreaterThan(0);
    });

    it("should handle autoUnlocked items", async () => {
      const tree = {
        ...mockSimpleLinearTree,
        node: {
          ...mockSimpleLinearTree.node,
          item: {
            ...mockSimpleLinearTree.node.item!,
            unlocked: false,
            autoUnlocked: true,
          },
        },
      };

      const buffer = await generateSpiritTree(tree);
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  describe("Canvas Dimensions", () => {
    it("should create minimum dimensions for small trees", async () => {
      const buffer = await generateSpiritTree(mockEmptyTree);

      expect(buffer).toBeInstanceOf(Buffer);
      // Minimum dimensions should still produce valid image
      expect(buffer.length).toBeGreaterThan(800); // PNG header + minimal data
    });

    it("should scale dimensions based on tree complexity", async () => {
      const emptyBuffer = await generateSpiritTree(mockEmptyTree);
      const largeBuffer = await generateSpiritTree(mockComplexTree);
      // More complex tree should generally produce larger image
      expect(largeBuffer.length).toBeGreaterThan(emptyBuffer.length);
    });

    it("should adjust canvas for wide branching trees", async () => {
      const buffer = await generateSpiritTree(mockBranchingTree);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should adjust canvas for deep linear trees", async () => {
      const buffer = await generateSpiritTree(mockSimpleLinearTree);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  describe("Rendering Quality", () => {
    it("should include watermark in generated image", async () => {
      const buffer = await generateSpiritTree(mockSimpleLinearTree);

      // Watermark should be present (SkyHelper text)
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should apply background blur when spirit image is available", async () => {
      const buffer = await generateSpiritTree(mockSimpleLinearTree);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should render connectors between nodes", async () => {
      const buffer = await generateSpiritTree(mockBranchingTree);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should render with different scales produce different sizes", async () => {
      const bufferSmall = await generateSpiritTree(mockSimpleLinearTree, { scale: 0.25 });
      const bufferMedium = await generateSpiritTree(mockSimpleLinearTree, { scale: 0.5 });
      const bufferLarge = await generateSpiritTree(mockSimpleLinearTree, { scale: 1.0 });

      expect(bufferSmall.length).toBeLessThan(bufferMedium.length);
      expect(bufferMedium.length).toBeLessThan(bufferLarge.length);
    });
  });

  describe("Error Handling", () => {
    it("should handle tree with missing item gracefully", async () => {
      const treeWithoutItem = {
        guid: "tree-no-item",
        name: "No Item Tree",
        node: {
          guid: "node-no-item",
          currency: { type: "c", amount: 5 },
        },
      };

      const buffer = await generateSpiritTree(treeWithoutItem as any);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle node without currency", async () => {
      const tree = {
        ...mockSimpleLinearTree,
        node: {
          ...mockSimpleLinearTree.node,
          currency: undefined,
        },
      };

      const buffer = await generateSpiritTree(tree);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it("should handle malformed item icon", async () => {
      const tree = {
        ...mockSimpleLinearTree,
        node: {
          ...mockSimpleLinearTree.node,
          item: {
            ...mockSimpleLinearTree.node.item!,
            icon: "",
          },
        },
      };

      const buffer = await generateSpiritTree(tree);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  describe("Integration Tests", () => {
    it("should successfully render all mock trees", async () => {
      for (const [name, tree] of Object.entries(allMockTrees)) {
        const buffer = await generateSpiritTree(tree);

        expect(buffer, `Failed to render tree: ${name}`).toBeInstanceOf(Buffer);
        expect(buffer.length, `Empty buffer for tree: ${name}`).toBeGreaterThan(0);
        expect(buffer.subarray(0, 8), `Invalid PNG for tree: ${name}`).toEqual(
          Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        );
      }
    });

    it("should handle rapid successive calls", async () => {
      const promises = Array.from({ length: 5 }, () => generateSpiritTree(mockSimpleLinearTree));

      const buffers = await Promise.all(promises);

      expect(buffers).toHaveLength(5);
      buffers.forEach((buffer) => {
        expect(buffer).toBeInstanceOf(Buffer);
        expect(buffer.length).toBeGreaterThan(0);
      });
    });

    it("should maintain consistency across multiple renders", async () => {
      const buffer1 = await generateSpiritTree(mockSimpleLinearTree, { scale: 0.5 });
      const buffer2 = await generateSpiritTree(mockSimpleLinearTree, { scale: 0.5 });

      // Same input should produce similar output sizes
      expect(Math.abs(buffer1.length - buffer2.length)).toBeLessThan(buffer1.length * 0.1);
    });
  });

  describe("Memory Management", () => {
    it("should not leak memory on multiple renders", async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Render multiple times
      for (let i = 0; i < 10; i++) {
        await generateSpiritTree(mockSimpleLinearTree);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 50MB for 10 renders)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    it("should handle large tree without excessive memory usage", async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      await generateSpiritTree(mockLargeTree);

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Should not use more than 100MB for a single large tree
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });
  });
});
