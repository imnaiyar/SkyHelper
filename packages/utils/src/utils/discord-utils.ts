import { CDN } from "@discordjs/rest";
import type { APIUser, APIGuildMember, APIMessage, Snowflake } from "discord-api-types/v10";
import { EmojiRegex, WebhookRegex } from "@sapphire/discord-utilities";

export type IdResolvalble = Snowflake | { id: Snowflake } | { user: { id: Snowflake } };

export type TimestampStyles = "t" | "T" | "d" | "D" | "f" | "F" | "R";

/**
 * Discord utility functions
 */
export class DiscordUtils {
  /**
   * Capitalizes first letter (or all spaced ones) and returns it
   */
  static capitalize(text: string, includeSpaced = false): string {
    if (includeSpaced) {
      return text.replace(/\b\w/g, (char) => char.toUpperCase());
    }
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  /**
   * Returns the creation date of the given ID.
   *
   * @param id - The ID to resolve.
   * @returns The creation date of the ID.
   */
  static createdAt(id: IdResolvalble): Date {
    const relovedId = this.resolveId(id);
    return new Date(this.getTimestampFromSnowflake(relovedId));
  }

  /**
   * Returns the creation timestamp of the given ID.
   *
   * @param id - The ID to resolve.
   * @returns The creation timestamp of the ID.
   */
  static createdTimeStamp(id: IdResolvalble): number {
    const relovedId = this.resolveId(id);
    return this.getTimestampFromSnowflake(relovedId);
  }

  /**
   * Resolves the given ID to a string.
   *
   * @param id - The ID to resolve.
   * @returns The resolved ID as a string.
   */
  static resolveId(id: IdResolvalble): string {
    let resolvedId;
    if (typeof id === "string") resolvedId = id;
    else if (typeof id === "object" && "id" in id) resolvedId = id.id;
    else resolvedId = id.user.id;
    return resolvedId;
  }

  /**
   * Extracts the timestamp from a Snowflake ID.
   *
   * @param snowflake - The Snowflake ID.
   * @returns The extracted timestamp.
   */
  static getTimestampFromSnowflake(snowflake: string): number {
    return Number(BigInt(snowflake) >> BigInt(22)) + 1420070400000;
  }

  /**
   * Returns user avatar if it exists or the default avatar
   *
   * @param member The member to get the avatar for
   * @param guildId The guild ID
   * @returns The avatar URL
   */
  static getUserAvatar(user: APIGuildMember, guildId: string): string;
  /**
   * Returns user avatar if it exists or the default avatar
   *
   * @param user The user to get the avatar for
   * @returns The avatar URL
   */
  static getUserAvatar(user: APIUser): string;
  static getUserAvatar(user: APIUser | APIGuildMember, guildId?: string): string {
    const cdn = new CDN();
    const baseUser = "user" in user ? user.user : user;
    if ("user" in user && user.avatar) return cdn.guildMemberAvatar(guildId!, user.user.id, user.avatar);
    return baseUser.avatar
      ? cdn.avatar(baseUser.id, baseUser.avatar, { forceStatic: true })
      : cdn.defaultAvatar(Number((BigInt(baseUser.id) >> 22n) % 5n));
  }

  /**
   * Parse a webhook URL to extract ID and token
   * @param url The webhook URL
   * @returns Object with id and token, or null if invalid
   */
  static parseWebhookURL(url: string): { id: string; token: string } | null {
    const match = url.match(WebhookRegex);
    if (!match) return null;
    return {
      id: match[2]!,
      token: match[3]!,
    };
  }

  /**
   * Formats given Date or timestamp to Discord timestamp format.
   *
   * @param date The date to format
   * @param style The style to use
   */
  static time(date: Date | number): `<t:${number}>`;
  static time<T extends TimestampStyles>(date: Date | number, style: T): `<t:${number}:${T}>`;
  static time(date: Date | number, style?: string) {
    return `<t:${Math.floor(date instanceof Date ? date.getTime() / 1_000 : date)}${style ? `:${style}` : ""}>`;
  }

  /**
   * Parse a custom or no-custom emoji and return api compatible data
   *
   * @param emoji The emoji to parse
   */
  static parseEmoji(emoji: string) {
    const match = emoji.match(EmojiRegex);
    if (!match) return null;
    return {
      animated: Boolean(match[1]),
      name: match[2],
      id: match[3],
    };
  }

  /**
   * Generate a message URL
   * @param message The message
   * @param guildId The guild ID (defaults to @me for DMs)
   */
  static messageUrl<T extends APIMessage, Guild extends string = "@me">(
    message: T,
    guildId: Guild = "@me" as Guild,
  ): `https://discord.com/channels/${Guild}/${T["channel_id"]}/${T["id"]}` {
    return `https://discord.com/channels/${guildId}/${message.channel_id}/${message.id}`;
  }

  /**
   * Formats an emoji id to discord's emoji markdown
   * @param id The emoji ID
   * @param name The emoji name
   * @param animated Whether the emoji is animated
   */
  static formatEmoji(id?: string, name?: string, animated = false) {
    if (!id) return "";
    if (/^<a?:\w+:\d{17,19}>$/.test(id)) return id;
    return `<${animated ? "a" : ""}:${name ? name.replaceAll(/[^\w]+/g, "") : "_"}:${id}>`;
  }
}
