import { describe, expect, it } from "vitest";
import { PermissionsUtil } from "../src/bot/utils/classes/PermissionUtils";
import { PermissionFlagsBits } from "@discordjs/core";

describe("PermissionsUtil", () => {
  describe("constructor", () => {
    it("should initialize with default bitfield", () => {
      const perms = new PermissionsUtil();
      expect(perms.bitfield).toBe(0n);
      expect(perms.flags).toEqual([]);
    });

    it("should initialize with provided bitfield", () => {
      const perms = new PermissionsUtil(8n);
      expect(perms.bitfield).toBe(8n);
      expect(perms.flags).toContain("Administrator");
    });

    it("should initialize with provided permission flags", () => {
      const perms = new PermissionsUtil("Administrator");
      expect(perms.bitfield).toBe(PermissionFlagsBits.Administrator);
    });
  });

  describe("resolveBits", () => {
    it("should resolve bigint permissions", () => {
      const bits = PermissionsUtil.resolveBits(8n);
      expect(bits).toBe(8n);
    });

    it("should resolve string permissions", () => {
      const bits = PermissionsUtil.resolveBits("8");
      expect(bits).toBe(8n);
    });

    it("should resolve permission flags", () => {
      const bits = PermissionsUtil.resolveBits("Administrator");
      expect(bits).toBe(PermissionFlagsBits.Administrator);
    });

    it("should resolve array of permissions", () => {
      // @ts-expect-error - array intentionally mixes literal types for coverage
      const bits = PermissionsUtil.resolveBits(["Administrator", "8"]);
      expect(bits).toBe(PermissionFlagsBits.Administrator | 8n);
    });

    it("should return 0n for unknown permissions", () => {
      // @ts-expect-error - unknown string should resolve to zero
      const bits = PermissionsUtil.resolveBits("UnknownPermission");
      expect(bits).toBe(0n);
    });
  });

  describe("resolveFlags", () => {
    it("should resolve bitfield to permission flags", () => {
      const flags = PermissionsUtil.resolveFlags(PermissionFlagsBits.Administrator);
      expect(flags).toContain("Administrator");
    });

    it("should resolve multiple bitfields to permission flags", () => {
      const flags = PermissionsUtil.resolveFlags(PermissionFlagsBits.Administrator | 8n);
      expect(flags).toContain("Administrator");
    });
  });

  describe("has", () => {
    it("should return true if permissions are present", () => {
      const perms = new PermissionsUtil("Administrator");
      expect(perms.has("Administrator")).toBe(true);
    });

    it("should return false if permissions are not present", () => {
      const perms = new PermissionsUtil("Administrator");
      expect(perms.has("KickMembers")).toBe(false);
    });
  });

  describe("remove", () => {
    it("should remove permissions", () => {
      const perms = new PermissionsUtil("Administrator");
      perms.remove("Administrator");
      expect(perms.has("Administrator")).toBe(false);
    });
  });

  describe("add", () => {
    it("should add permissions", () => {
      const perms = new PermissionsUtil();
      perms.add("Administrator");
      expect(perms.has("Administrator")).toBe(true);
    });
  });

  describe("missing", () => {
    it("should return missing permissions", () => {
      const perms = new PermissionsUtil("Administrator");
      const missing = perms.missing(["KickMembers", "BanMembers"]);
      expect(missing).toContain("KickMembers");
      expect(missing).toContain("BanMembers");
    });
  });

  describe("toArray", () => {
    it("should return array of permission flags", () => {
      const perms = new PermissionsUtil("Administrator");
      const flags = perms.toArray();
      expect(flags).toContain("Administrator");
    });
  });

  describe("all", () => {
    it("should return instance with all permissions", () => {
      const perms = PermissionsUtil.all();
      expect(perms.has("Administrator")).toBe(true);
      expect(perms.toArray()).toEqual(Object.keys(PermissionFlagsBits));
    });
  });
});
