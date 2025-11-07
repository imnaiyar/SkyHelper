import type { SkyHelper } from "@/structures";
import type { ParsedCustomId } from "@/types/utils";
import type { APIModalSubmitInteraction, APIModalSubmitTextInputComponent, ModalSubmitComponent } from "@discordjs/core";
import { ComponentType } from "@discordjs/core";
import { CustomId, store } from "../customId-store.js";
import { DiscordUtils } from "@skyhelperbot/utils";

/**
 * Bot-specific utility class that extends the shared DiscordUtils
 */
export default class Utils extends DiscordUtils {
  /**
   * Schema store of custom IDs
   */
  static store = store;

  /**
   * Enum of Custom IDs used in schema store
   */
  static customId = CustomId;

  /** Encode given object key value pair in string for customId.
   * * The length of resulting string should not exceed 100 characters.
   * * The resulting string should be in the format of `id;key1:value1;key2:value2
   *
   * @param obj The object to encode
   */
  static encodeCustomId(obj: ParsedCustomId): string {
    let customId = `${obj.id ?? ""}`;
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
    const obj: ParsedCustomId = {};
    for (let i = 1; i < parts.length; i++) {
      const [key, value] = parts[i]!.split("=");
      obj[key!] = value!;
    }
    return obj;
  }

  /**
   * Mention a command by name
   * @param client The SkyHelper client
   * @param command The command name
   * @param sub The subcommand name (optional)
   */
  static mentionCommand(client: SkyHelper, command: string, sub?: string) {
    const comd = client.applicationCommands.find((cmd) => cmd.name === command);
    if (!comd) throw new Error(`Command ${command} not found`);
    return `</${command}${sub ? ` ${sub}` : ""}:${comd.id}>`;
  }

  static getModalComponent<Type extends ComponentType = ComponentType>(
    int: APIModalSubmitInteraction,
    customId: string | ((id: string) => boolean),
    type: Type,
    required: true,
  ): Extract<ModalSubmitComponent, { type: Type }>;

  static getModalComponent<Type extends ComponentType = ComponentType>(
    int: APIModalSubmitInteraction,
    customId: string | ((id: string) => boolean),
    type?: Type,
    required?: boolean,
  ): Extract<ModalSubmitComponent, { type: Type }> | undefined;
  static getModalComponent<Type extends ComponentType = ComponentType>(
    int: APIModalSubmitInteraction,
    customId: string | ((id: string) => boolean),
    type?: Type,
    required?: boolean,
  ): Extract<ModalSubmitComponent, { type: Type }> | undefined {
    const components = int.data.components.reduce<ModalSubmitComponent[]>((acc, label) => {
      if ("components" in label) return acc.concat(label.components);
      if ("component" in label) return acc.concat(label.component);
      return acc;
    }, []);
    const comp = components.find((component) =>
      typeof customId === "function" ? customId(component.custom_id) : component.custom_id === customId,
    );
    if (required && !comp) throw new Error(`Couldn't find the required component with customId '${customId}'`);
    if (type && comp && comp.type !== type) {
      throw new Error(`Component with customId '${customId}' has type ${comp.type} but expected type ${type}`);
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
