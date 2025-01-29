import { MessageFlags } from "../src/bot/utils/classes/MessageFlags.js";

describe("Flags", () => {
  it("should correctly parse flags from the content string", () => {
    const content = "--flag1=value1 --flag2=value2";
    const flags = new MessageFlags(content);
    expect(flags.getFlags()).toEqual(["flag1=value1", "flag2=value2"]);
  });

  it("should return the value of a specific flag", () => {
    const content = "--flag1=value1 --flag2=value2";
    const flags = new MessageFlags(content);
    expect(flags.getFlag("flag1")).toBe("flag1=value1");
    expect(flags.getFlag("flag2")).toBe("flag2=value2");
    expect(flags.getFlag("flag3")).toBeNull();
  });

  it("should check if the content string has a specific flag", () => {
    const content = "--flag1=value1 --flag2=value2";
    const flags = new MessageFlags(content);
    expect(flags.has("flag1")).toBe(true);
    expect(flags.has("flag3")).toBe(false);
  });

  it("should check if the content string has any of the flags in the supplied array", () => {
    const content = "--flag1=value1 --flag2=value2";
    const flags = new MessageFlags(content);
    expect(flags.hasAny(["flag1", "flag3"])).toBe(true);
    expect(flags.hasAny(["flag3", "flag4"])).toBe(false);
  });

  it("should return all the invalid flags in the content string", () => {
    const content = "--flag1=value1 --flag2=value2";
    const flags = new MessageFlags(content);
    expect(flags.invalidFlags(["flag1", "flag3"])).toEqual(["flag3"]);
    expect(flags.invalidFlags(["flag1", "flag2"])).toBeNull();
  });

  it("should return the message content without flags", () => {
    const content = "This is a message --flag1=value1 with flags --flag2=value2";
    const flags = new MessageFlags(content);
    expect(flags.removeFlags()).toBe("This is a message  with flags");
  });
});
