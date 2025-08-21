import type { SkyHelper } from "@/structures";
import type { IdResolvalble, ParsedCustomId, TimestampStyles } from "@/types/utils";
import type { APIGuildMember, APIMessage, APIModalSubmitInteraction, APIUser, ModalSubmitComponent } from "@discordjs/core";
import { CDN } from "@discordjs/rest";
import { EmojiRegex, WebhookRegex } from "@sapphire/discord-utilities";
import { CustomId, store } from "../customId-store.js";

export default class {
  /**
   * Schema store of custom IDs with UTF-8 safety wrapper
   */
  static store = {
    /**
     * Serialize data to a custom ID string with UTF-8 validation
     * @param id The schema ID
     * @param data The data to serialize
     * @returns A UTF-8 safe serialized string
     */
    serialize(id: number, data: any): string {
      try {
        const serialized = (store as any).serialize(id, data);

        // Validate UTF-8 integrity
        const buffer = Buffer.from(serialized, "utf8");
        const backToString = buffer.toString("utf8");

        if (serialized !== backToString) {
          throw new Error("UTF-8 corruption detected in serialized string");
        }

        // Check Discord's custom ID limit
        if (serialized.length > 100) {
          throw new Error(`Serialized string exceeds Discord's 100 character limit: ${serialized.length} characters`);
        }

        return serialized;
      } catch (error) {
        // Add context to the error for debugging
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Handle specific string-store buffer overflow error
        if (errorMessage.includes("The buffer is full")) {
          throw new Error(
            `String-store buffer overflow: Data is too large to serialize. Consider reducing the size of the data. Data: ${JSON.stringify(data)}`,
          );
        }

        throw new Error(`String-store serialization failed: ${errorMessage}. Data: ${JSON.stringify(data)}`);
      }
    },

    /**
     * Deserialize a custom ID string with UTF-8 validation
     * @param customId The serialized custom ID string
     * @returns The deserialized data
     */
    deserialize(customId: string): ReturnType<typeof store.deserialize> {
      try {
        // Validate input is valid UTF-8
        const buffer = Buffer.from(customId, "utf8");
        const backToString = buffer.toString("utf8");

        if (customId !== backToString) {
          throw new Error("Invalid UTF-8 characters in custom ID string");
        }

        return (store as any).deserialize(customId);
      } catch (error) {
        // Add context to the error for debugging
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`String-store deserialization failed: ${errorMessage}. Custom ID: ${JSON.stringify(customId)}`);
      }
    },
  };

  /**
   * Enum of Custom IDs used in schema store
   */
  static customId = CustomId;

  /**
   * Returns the creation date of the given ID.
   *
   * @param id - The ID to resolve.
   * @returns The creation date of the ID.
   */
  static createdAt<T extends IdResolvalble>(id: T): Date {
    const relovedId = this.resolveId(id);
    return new Date(this.getTimestampFromSnowflake(relovedId));
  }

  /**
   * Returns the creation timestamp of the given ID.
   *
   * @param id - The ID to resolve.
   * @returns The creation timestamp of the ID.
   */
  static createdTimeStamp<T extends IdResolvalble>(id: T): number {
    const relovedId = this.resolveId(id);
    return this.getTimestampFromSnowflake(relovedId);
  }

  /**
   * Resolves the given ID to a string.
   *
   * @param id - The ID to resolve.
   * @returns The resolved ID as a string.
   */
  static resolveId<T extends IdResolvalble>(id: T): string {
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

  static parseWebhookURL(url: string): { id: string; token: string } | null {
    const match = url.match(WebhookRegex);
    if (!match) return null;
    return {
      id: match[2],
      token: match[3],
    };
  }

  /** Encode given object key value pair in string for customId.
   * * The length of resulting string should not exceed 100 characters.
   * * The resulting string should be in the format of `id;key1:value1;key2:value2
   *
   * @param obj The object to encode
   */
  static encodeCustomId(obj: ParsedCustomId): string {
    let customId = obj["id"];
    for (const [key, value] of Object.entries(obj)) {
      if (key === "id") continue;
      customId += `;${key}:${value}`;
    }
    if (customId.length > 100) {
      throw new RangeError("The resulting string exceeded 100 characters. Value: " + `"${customId}"`);
    }
    return customId;
  }

  /** Parse encode customId to return an object weth key value pair.
   *
   * @param customId The customId to parse
   */
  static parseCustomId(customId: string): ParsedCustomId {
    const parts = customId.split(";");
    const obj: ParsedCustomId = { id: parts[0] };
    for (let i = 1; i < parts.length; i++) {
      const [key, value] = parts[i].split(":");
      obj[key] = value;
    }
    return obj;
  }

  static time(date: Date | number): `<t:${number}>`;
  /**
   * Formats given Date or timestamp to Discord timestamp format.
   *
   * @param date The date to format
   * @param style The style to use
   */
  static time<T extends TimestampStyles>(date: Date | number, style: T): `t:${number}:${T}>`;

  static time(date: Date | number, style?: string) {
    return `<t:${Math.floor(date instanceof Date ? date.getTime() / 1_000 : date)}${style ? `:${style}` : ""}>`;
  }

  /**
   *  Parse a custom or no-custom emoji and return api compatible data
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

  static messageUrl<T extends APIMessage, Guild extends string = "@me">(
    message: T,
    guildId: Guild = "@me" as Guild,
  ): `https://discord.com/channels/${Guild}/${T["channel_id"]}/${T["id"]}` {
    return `https://discord.com/channels/${guildId}/${message.channel_id}/${message.id}`;
  }

  static mentionCommand(client: SkyHelper, command: string, sub?: string) {
    const comd = client.applicationCommands.find((cmd) => cmd.name === command);
    if (!comd) throw new Error(`Command ${command} not found`);
    return `</${command}${sub ? ` ${sub}` : ""}:${comd.id}>`;
  }

  static getTextInput(interaction: APIModalSubmitInteraction, textinput: string, required: true): ModalSubmitComponent;
  static getTextInput(
    interaction: APIModalSubmitInteraction,
    textinput: string,
    required?: false,
  ): ModalSubmitComponent | undefined;
  static getTextInput(interaction: APIModalSubmitInteraction, textinput: string, required: boolean = false) {
    const components = interaction.data.components.map((row) => row.components[0]); // Can only be one component per row
    const comp = components.find((component) => component.custom_id === textinput);
    if (required && !comp) throw new Error("Couldn't find the required text input");
    return comp;
  }
}
