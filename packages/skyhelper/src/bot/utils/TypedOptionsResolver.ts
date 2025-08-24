import type { InteractionOptionResolver } from "@sapphire/discord-utilities";
import {
  ApplicationCommandOptionType,
  type APIApplicationCommandOption,
  type APIApplicationCommandBasicOption,
  type APIApplicationCommandSubcommandOption,
  type APIApplicationCommandSubcommandGroupOption,
} from "@discordjs/core";
import type { CommandOptionsType } from "../@types/CommandOptions.js";

/**
 * Transforms InteractionOptionResolver into a typed options object
 * based on the command's option definitions.
 */
export class TypedOptionsResolver<TOptions extends readonly APIApplicationCommandOption[] | undefined = undefined> {
  constructor(
    private resolver: InteractionOptionResolver,
    private commandOptions?: TOptions,
  ) {}

  /**
   * Get the typed options object based on the command structure
   */
  getTypedOptions(): CommandOptionsType<TOptions> {
    if (!this.commandOptions) {
      return {} as CommandOptionsType<TOptions>;
    }

    return this.transformOptions(this.commandOptions) as CommandOptionsType<TOptions>;
  }

  private transformOptions(options: readonly APIApplicationCommandOption[]): Record<string, any> {
    const result: Record<string, any> = {};

    for (const option of options) {
      switch (option.type) {
        case ApplicationCommandOptionType.Subcommand:
          result[option.name] = this.transformSubcommand(option);
          break;
        case ApplicationCommandOptionType.SubcommandGroup:
          result[option.name] = this.transformSubcommandGroup(option);
          break;
        default: {
          // For basic options at the root level, get their values directly
          const value = this.getBasicOptionValue(option as APIApplicationCommandBasicOption);
          if (value !== null && value !== undefined) {
            result[option.name] = value;
          }
          break;
        }
      }
    }

    return result;
  }

  private transformSubcommand(subcommand: APIApplicationCommandSubcommandOption): Record<string, any> {
    // Check if this subcommand is the active one
    const activeSubcommand = this.resolver.getSubcommand(false);
    if (activeSubcommand !== subcommand.name) {
      return {};
    }

    const result: Record<string, any> = {};

    if (subcommand.options) {
      for (const option of subcommand.options) {
        const value = this.getBasicOptionValue(option);
        if (value !== null && value !== undefined) {
          result[option.name] = value;
        }
      }
    }

    return result;
  }

  private transformSubcommandGroup(group: APIApplicationCommandSubcommandGroupOption): Record<string, any> {
    // Check if this subcommand group is the active one
    const activeGroup = this.resolver.getSubcommandGroup(false);
    if (activeGroup !== group.name) {
      return {};
    }

    const result: Record<string, any> = {};

    if (group.options) {
      for (const subcommand of group.options) {
        const subResult = this.transformSubcommand(subcommand);
        if (Object.keys(subResult).length > 0) {
          result[subcommand.name] = subResult;
          break; // Only one subcommand can be active at a time
        }
      }
    }

    return result;
  }

  private getBasicOptionValue(option: APIApplicationCommandBasicOption): any {
    switch (option.type) {
      case ApplicationCommandOptionType.String:
        return this.resolver.getString(option.name, option.required);
      case ApplicationCommandOptionType.Integer:
        return this.resolver.getInteger(option.name, option.required);
      case ApplicationCommandOptionType.Number:
        return this.resolver.getNumber(option.name, option.required);
      case ApplicationCommandOptionType.Boolean:
        return this.resolver.getBoolean(option.name, option.required);
      case ApplicationCommandOptionType.User:
        return {
          user: this.resolver.getUser(option.name, option.required),
          member: this.resolver.getMember(option.name),
        };
      case ApplicationCommandOptionType.Channel:
        return this.resolver.getChannel(option.name, option.required);
      case ApplicationCommandOptionType.Role:
        return this.resolver.getRole(option.name, option.required);
      case ApplicationCommandOptionType.Mentionable:
        return this.resolver.getMentionable(option.name, option.required);
      case ApplicationCommandOptionType.Attachment:
        return this.resolver.getAttachment(option.name, option.required);
      default:
        return null;
    }
  }
}

/**
 * Helper function to create a typed options resolver
 */
export function createTypedOptionsResolver<TOptions extends readonly APIApplicationCommandOption[] | undefined>(
  resolver: InteractionOptionResolver,
  commandOptions?: TOptions,
): TypedOptionsResolver<TOptions> {
  return new TypedOptionsResolver(resolver, commandOptions);
}

/**
 * Simple helper function to transform InteractionOptionResolver to typed options
 */
export function getTypedOptions<TOptions extends readonly APIApplicationCommandOption[] | undefined>(
  resolver: InteractionOptionResolver,
  commandOptions?: TOptions,
): CommandOptionsType<TOptions> {
  return new TypedOptionsResolver(resolver, commandOptions).getTypedOptions();
}
