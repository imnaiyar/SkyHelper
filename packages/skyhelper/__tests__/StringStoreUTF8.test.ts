import { describe, expect, it } from "@jest/globals";
import Utils from "../src/bot/utils/classes/Utils";

describe("Utils string-store UTF-8 safety", () => {
  describe("serialize", () => {
    it("should handle normal ASCII strings", () => {
      const data = { user: "123456789012345678", data: "test" };
      const serialized = Utils.store.serialize(19, data); // CustomId.Default
      expect(typeof serialized).toBe("string");
      expect(serialized.length).toBeLessThanOrEqual(100);
    });

    it("should handle emoji characters correctly", () => {
      const data = { user: "123456789012345678", data: "🚫🌟✨" };
      const serialized = Utils.store.serialize(19, data);
      expect(typeof serialized).toBe("string");

      // Verify round-trip
      const deserialized = Utils.store.deserialize(serialized);
      expect(deserialized.data.data).toBe("🚫🌟✨");
    });

    it("should handle complex emoji sequences", () => {
      const data = { user: "123456789012345678", data: "🧚‍♀️👨‍👩‍👧‍👦" };
      const serialized = Utils.store.serialize(19, data);
      expect(typeof serialized).toBe("string");

      // Verify round-trip
      const deserialized = Utils.store.deserialize(serialized);
      expect(deserialized.data.data).toBe("🧚‍♀️👨‍👩‍👧‍👦");
    });

    it("should handle Unicode characters", () => {
      const data = { user: "123456789012345678", data: "café测试" };
      const serialized = Utils.store.serialize(19, data);
      expect(typeof serialized).toBe("string");

      // Verify round-trip
      const deserialized = Utils.store.deserialize(serialized);
      expect(deserialized.data.data).toBe("café测试");
    });

    it("should throw error when data causes buffer overflow", () => {
      // Create data that would cause buffer overflow
      const longData = {
        user: "123456789012345678",
        data: "a".repeat(200), // Very long string
      };

      expect(() => {
        Utils.store.serialize(19, longData);
      }).toThrow(/String-store buffer overflow.*Data is too large to serialize/);
    });

    it("should validate UTF-8 integrity", () => {
      const data = { user: "123456789012345678", data: "normal_data" };
      const serialized = Utils.store.serialize(19, data);

      // Verify it's valid UTF-8
      const buffer = Buffer.from(serialized, "utf8");
      const backToString = buffer.toString("utf8");
      expect(serialized).toBe(backToString);
    });

    it("should include debugging context in error messages", () => {
      // Test with invalid schema ID to trigger an error
      expect(() => {
        Utils.store.serialize(999, { user: "123", data: "test" });
      }).toThrow(/String-store serialization failed/);
    });
  });

  describe("deserialize", () => {
    it("should deserialize normal strings correctly", () => {
      const data = { user: "123456789012345678", data: "test" };
      const serialized = Utils.store.serialize(19, data);
      const deserialized = Utils.store.deserialize(serialized);

      expect(deserialized.id).toBe(19);
      expect(deserialized.data.user).toBe("123456789012345678");
      expect(deserialized.data.data).toBe("test");
    });

    it("should deserialize emoji strings correctly", () => {
      const data = { user: "123456789012345678", data: "🚫🌟✨" };
      const serialized = Utils.store.serialize(19, data);
      const deserialized = Utils.store.deserialize(serialized);

      expect(deserialized.data.data).toBe("🚫🌟✨");
    });

    it("should validate UTF-8 integrity of input", () => {
      // Test with a valid serialized string first
      const data = { user: "123456789012345678", data: "test" };
      const serialized = Utils.store.serialize(19, data);

      // This should work with valid UTF-8
      expect(() => {
        Utils.store.deserialize(serialized);
      }).not.toThrow();

      // Test with an invalid custom ID that should fail deserialization
      expect(() => {
        Utils.store.deserialize("definitely_invalid_custom_id");
      }).toThrow(/String-store deserialization failed/);
    });

    it("should include debugging context in error messages", () => {
      // Test with invalid serialized string
      expect(() => {
        Utils.store.deserialize("invalid_custom_id");
      }).toThrow(/String-store deserialization failed/);
    });

    it("should handle all CustomId enum values", () => {
      // Test a few different CustomId types
      const testCases = [
        { id: 2, spirit: "test_spirit", user: "123456789012345678" }, // SpiritCollectible
        { id: 4, error: "test_error", user: "123456789012345678" }, // BugReports
        { id: 19, user: "123456789012345678", data: "test_data" }, // Default
      ];

      testCases.forEach((testCase) => {
        const serialized = Utils.store.serialize(testCase.id, testCase);
        const deserialized = Utils.store.deserialize(serialized);
        expect(deserialized.id).toBe(testCase.id);
      });
    });
  });

  describe("round-trip integrity", () => {
    it("should maintain data integrity through multiple round-trips", () => {
      const originalData = {
        user: "123456789012345678",
        data: "🧚‍♀️_test_café_测试_✨",
      };

      // Perform multiple round-trips
      let serialized = Utils.store.serialize(19, originalData);
      for (let i = 0; i < 5; i++) {
        const deserialized = Utils.store.deserialize(serialized);
        serialized = Utils.store.serialize(19, deserialized.data);
      }

      const finalDeserialized = Utils.store.deserialize(serialized);
      expect(finalDeserialized.data.data).toBe(originalData.data);
      expect(finalDeserialized.data.user).toBe(originalData.user);
    });

    it("should handle edge case emoji sequences", () => {
      const edgeCases = [
        "🏳️‍⚧️", // Flag with ZWJ
        "👨‍👩‍👧‍👦", // Family emoji
        "🧚‍♀️", // Fairy with gender modifier
        "🌟⭐️✨💫🔆", // Multiple star emojis
        "café", // Accented characters
        "测试中文", // CJK characters
      ];

      edgeCases.forEach((testString) => {
        const data = { user: "123456789012345678", data: testString };
        const serialized = Utils.store.serialize(19, data);
        const deserialized = Utils.store.deserialize(serialized);
        expect(deserialized.data.data).toBe(testString);
      });
    });

    it("should reject strings with unpaired UTF-8 surrogates", () => {
      // Test case based on real issue reported by @imnaiyar
      // This string contains unpaired surrogates that cause UTF-8 corruption
      const problematicString = `\x13'恢晪桤桨摤晦摬恲晰≬렀\ud985륽Ǒ`;

      expect(() => {
        Utils.store.deserialize(problematicString);
      }).toThrow(/String-store deserialization failed.*Invalid UTF-8 characters/);
    });

    it("should handle the exact scenario reported by user", () => {
      // This is the exact scenario that was reported to produce the problematic string
      const userData = {
        user: "1053244422336290836",
        data: "nav_next",
      };

      // This should work fine with our UTF-8 validation
      expect(() => {
        const serialized = Utils.store.serialize(19, userData);
        const deserialized = Utils.store.deserialize(serialized);
        expect(deserialized.data.user).toBe(userData.user);
        expect(deserialized.data.data).toBe(userData.data);
      }).not.toThrow();
    });
  });
});
