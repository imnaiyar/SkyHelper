import type { SkyHelper } from "@/structures";
import type { IdResolvalble, ParsedCustomId, TimestampStyles } from "@/types/utils";
import type {
  APIGuildMember,
  APIMessage,
  APIModalSubmitInteraction,
  APIModalSubmitTextInputComponent,
  APIUser,
  ModalSubmitComponent,
} from "@discordjs/core";
import { ComponentType } from "@discordjs/core";
import { CDN } from "@discordjs/rest";
import { EmojiRegex, WebhookRegex } from "@sapphire/discord-utilities";
import { CustomId, store } from "../customId-store.js";

export default class {
  /**
   * Schema store of custom IDs
   */
  static store = store;

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

  static parseWebhookURL(url: string): { id: string; token: string } | null {
    const match = url.match(WebhookRegex);
    if (!match) return null;
    return {
      id: match[2]!,
      token: match[3]!,
    };
  }

  /** Encode given object key value pair in string for customId.
   * * The length of resulting string should not exceed 100 characters.
   * * The resulting string should be in the format of `id;key1:value1;key2:value2
   *
   * @param obj The object to encode
   */
  static encodeCustomId(obj: ParsedCustomId): string {
    let customId = obj.id;
    for (const [key, value] of Object.entries(obj)) {
      if (key === "id") continue;
      if (!value) continue;
      customId += `;${key}=${value}`;
    }

    return customId;
  }

  /** Parse encode customId to return an object weth key value pair.
   *
   * @param customId The customId to parse
   */
  static parseCustomId(customId: string): ParsedCustomId {
    const parts = customId.split(";");
    const obj: ParsedCustomId = { id: parts[0]! };
    for (let i = 1; i < parts.length; i++) {
      const [key, value] = parts[i]!.split(":");
      obj[key!] = value!;
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

  static getModalComponent<Type extends ComponentType = ComponentType>(
    int: APIModalSubmitInteraction,
    customId: string,
    type: Type,
    required: true,
  ): Extract<ModalSubmitComponent, { type: Type }>;

  static getModalComponent<Type extends ComponentType = ComponentType>(
    int: APIModalSubmitInteraction,
    customId: string,
    type?: Type,
    required?: boolean,
  ): Extract<ModalSubmitComponent, { type: Type }> | undefined;
  static getModalComponent<Type extends ComponentType = ComponentType>(
    int: APIModalSubmitInteraction,
    customId: string,
    type?: Type,
    required?: boolean,
  ): Extract<ModalSubmitComponent, { type: Type }> | undefined {
    const components = int.data.components.reduce<ModalSubmitComponent[]>((acc, label) => {
      if ("components" in label) return acc.concat(label.components);
      if ("component" in label) return acc.concat(label.component);
      return acc;
    }, []);
    const comp = components.find((component) => component.custom_id === customId);
    if (required && !comp) throw new Error(`Couldn't find the required component with customId '${customId}'`);
    if (type && comp?.type !== type) {
      throw new Error(`Component with customId '${customId}' has type ${comp?.type} but expected type ${type}`);
    }
    return comp as Extract<ModalSubmitComponent, { type: Type }> | undefined;
  }
  static getTextInput(
    interaction: APIModalSubmitInteraction,
    textinput: string,
    required: true,
  ): APIModalSubmitTextInputComponent;
  static getTextInput(
    interaction: APIModalSubmitInteraction,
    textinput: string,
    required?: false,
  ): APIModalSubmitTextInputComponent | undefined;
  static getTextInput(interaction: APIModalSubmitInteraction, textinput: string, required = false) {
    const compo = this.getModalComponent(interaction, textinput, ComponentType.TextInput);
    if (required && !compo) throw new Error("Couldn't find the required text input");
    return compo;
  }
}
