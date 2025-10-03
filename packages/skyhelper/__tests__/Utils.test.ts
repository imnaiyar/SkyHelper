import type { APIGuildMember, APIUser, APIModalSubmitInteraction, APIMessage } from "@discordjs/core";
import { describe, expect, it } from "vitest";
import Utils from "../src/bot/utils/classes/Utils";

describe("Utils", () => {
  describe("createdAt", () => {
    it("should return the correct creation date", () => {
      const id = "123456789012345678";
      const date = Utils.createdAt(id);
      expect(date).toBeInstanceOf(Date);
    });
  });

  describe("createdTimeStamp", () => {
    it("should return the correct creation timestamp", () => {
      const id = "123456789012345678";
      const timestamp = Utils.createdTimeStamp(id);
      expect(typeof timestamp).toBe("number");
      expect(timestamp).toBe(1449504792216);
    });
  });

  describe("resolveId", () => {
    it("should resolve string ID", () => {
      const id = "123456789012345678";
      expect(Utils.resolveId(id)).toBe(id);
    });

    it("should resolve object with ID", () => {
      const obj = { id: "123456789012345678" };
      expect(Utils.resolveId(obj)).toBe(obj.id);
    });

    it("should resolve user object with ID", () => {
      const user = { user: { id: "123456789012345678" } };
      expect(Utils.resolveId(user)).toBe(user.user.id);
    });
  });

  describe("getTimestampFromSnowflake", () => {
    it("should extract the correct timestamp", () => {
      const snowflake = "123456789012345678";
      const timestamp = Utils.getTimestampFromSnowflake(snowflake);
      expect(typeof timestamp).toBe("number");
      expect(timestamp).toBe(1449504792216);
    });
  });

  describe("getUserAvatar", () => {
    it("should return the correct avatar URL for a user", () => {
      const user: APIUser = { id: "123456789012345678", avatar: "avatarHash" } as APIUser;
      const url = Utils.getUserAvatar(user);
      expect(url).toContain("avatarHash");
    });

    it("should return the correct avatar URL for a guild member", () => {
      const member: APIGuildMember = { user: { id: "123456789012345678" }, avatar: "avatarHash" } as APIGuildMember;
      const url = Utils.getUserAvatar(member, "guildId");
      expect(url).toContain("avatarHash");
    });
  });

  describe("parseWebhookURL", () => {
    it("should parse a valid webhook URL", () => {
      const url = "https://discord.com/api/webhooks/123456789012345678/token";
      const result = Utils.parseWebhookURL(url);
      expect(result).toEqual({ id: "123456789012345678", token: "token" });
    });

    it("should return null for an invalid webhook URL", () => {
      const url = "https://invalid.url";
      const result = Utils.parseWebhookURL(url);
      expect(result).toBeNull();
    });
  });

  describe("encodeCustomId", () => {
    it("should encode a custom ID correctly", () => {
      const obj = { id: "123", key1: "value1", key2: "value2" };
      const encoded = Utils.encodeCustomId(obj);
      expect(encoded).toBe("123;key1:value1;key2:value2");
    });

    it("should throw an error if the resulting string exceeds 100 characters", () => {
      const obj = { id: "1", key: "a".repeat(100) };
      expect(() => {
        Utils.encodeCustomId(obj);
      }).toThrow(RangeError);
    });
  });

  describe("parseCustomId", () => {
    it("should parse an encoded custom ID correctly", () => {
      const customId = "123;key1:value1;key2:value2";
      const parsed = Utils.parseCustomId(customId);
      expect(parsed).toEqual({ id: "123", key1: "value1", key2: "value2" });
    });
  });

  describe("time", () => {
    it("should format a date correctly", () => {
      const date = new Date();
      const formatted = Utils.time(date);
      expect(formatted).toMatch(/<t:\d+>/);
    });

    it("should format a date with style correctly", () => {
      const date = new Date();
      const formatted = Utils.time(date, "R");
      expect(formatted).toMatch(/<t:\d+:R>/);
    });
  });

  describe("parseEmoji", () => {
    it("should parse a custom emoji correctly", () => {
      const emoji = "<:name:123456789012345678>";
      const parsed = Utils.parseEmoji(emoji);
      expect(parsed).toEqual({ animated: false, name: "name", id: "123456789012345678" });
    });

    it("should return null for an invalid emoji", () => {
      const emoji = "invalid";
      const parsed = Utils.parseEmoji(emoji);
      expect(parsed).toBeNull();
    });
  });

  describe("messageUrl", () => {
    it("should return the correct message URL", () => {
      const message = { id: "123", channel_id: "456" };
      const url = Utils.messageUrl(message as APIMessage);
      expect(url).toBe("https://discord.com/channels/@me/456/123");
    });

    it("should return the correct message URL with guild ID", () => {
      const message = { id: "123", channel_id: "456" };
      const url = Utils.messageUrl(message as APIMessage, "789");
      expect(url).toBe("https://discord.com/channels/789/456/123");
    });
  });

  describe("mentionCommand", () => {
    it("should return the correct command mention", () => {
      const client = { applicationCommands: [{ name: "command", id: "123" }] } as any;
      const mention = Utils.mentionCommand(client, "command");
      expect(mention).toBe("</command:123>");
    });

    it("should throw an error if the command is not found", () => {
      const client = { applicationCommands: [] } as any;
      expect(() => {
        Utils.mentionCommand(client, "command");
      }).toThrow(Error);
    });
  });

  describe("getTextInput", () => {
    it("should return the correct text input component", () => {
      const interaction = {
        data: {
          components: [{ components: [{ custom_id: "textinput", value: "value", type: 4 }] }],
        },
      } as APIModalSubmitInteraction;
      const component = Utils.getTextInput(interaction, "textinput", true);
      expect(component).toEqual({ custom_id: "textinput", value: "value", type: 4 });
    });

    it("should throw an error if the required text input is not found", () => {
      const interaction = {
        data: {
          components: [{ components: [{ custom_id: "otherinput", value: "value" }] }],
        },
      } as APIModalSubmitInteraction;
      expect(() => {
        Utils.getTextInput(interaction, "textinput", true);
      }).toThrow(Error);
    });
  });
});
