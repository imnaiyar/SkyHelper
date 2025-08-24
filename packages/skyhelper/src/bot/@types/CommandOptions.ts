import {
  type APIRole,
  type APIUser,
  type APIAttachment,
  ApplicationCommandOptionType,
  type APIInteractionDataResolvedChannel,
  type APIInteractionDataResolvedGuildMember,
} from "@discordjs/core";

type OptionTypeMap = {
  [ApplicationCommandOptionType.String]: string;
  [ApplicationCommandOptionType.Integer]: number;
  [ApplicationCommandOptionType.Boolean]: boolean;
  [ApplicationCommandOptionType.User]: { user: APIUser; member?: APIInteractionDataResolvedGuildMember };
  [ApplicationCommandOptionType.Channel]: APIInteractionDataResolvedChannel;
  [ApplicationCommandOptionType.Role]: APIRole;
  [ApplicationCommandOptionType.Mentionable]: APIUser | APIRole;
  [ApplicationCommandOptionType.Number]: number;
  [ApplicationCommandOptionType.Attachment]: APIAttachment;
};
type BasicOptionType = { name: string; type: ApplicationCommandOptionType; required?: boolean };
// Extract the TypeScript type for a given option type
type GetOptionType<T extends ApplicationCommandOptionType> = T extends keyof OptionTypeMap ? OptionTypeMap[T] : unknown;

// Transform a single basic option into its typed representation
type TransformBasicOption<T extends BasicOptionType> = T extends {
  name: infer Name;
  type: infer Type;
  required: true;
}
  ? Type extends ApplicationCommandOptionType
    ? { [K in Name & string]: GetOptionType<Type> }
    : never
  : T extends {
        name: infer Name;
        type: infer Type;
        required?: false | undefined;
      }
    ? Type extends ApplicationCommandOptionType
      ? { [K in Name & string]?: GetOptionType<Type> }
      : never
    : never;

// Transform an array of basic options into a single object type
type TransformBasicOptions<T extends readonly BasicOptionType[]> = T extends readonly [infer First, ...infer Rest]
  ? First extends BasicOptionType
    ? Rest extends readonly BasicOptionType[]
      ? TransformBasicOption<First> & TransformBasicOptions<Rest>
      : TransformBasicOption<First>
    : never
  : {};

// Transform a subcommand option into its typed representation
type TransformSubcommandOption<T extends BasicOptionType> = T extends {
  name: infer Name;
  options?: infer Options;
}
  ? Options extends readonly BasicOptionType[]
    ? { [K in Name & string]?: TransformBasicOptions<Options> }
    : { [K in Name & string]?: {} }
  : never;

// Transform a subcommand group option into its typed representation
type TransformSubcommandGroupOption<T extends BasicOptionType> = T extends {
  name: infer Name;
  options?: infer SubOptions;
}
  ? SubOptions extends readonly BasicOptionType[]
    ? {
        [K in Name & string]?: UnionToIntersection<
          {
            [Index in keyof SubOptions]: SubOptions[Index] extends BasicOptionType
              ? TransformSubcommandOption<SubOptions[Index]>
              : never;
          }[number]
        >;
      }
    : { [K in Name & string]?: {} }
  : never;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

// Transform any application command option into its typed representation
type TransformOption<T extends BasicOptionType> = T extends { type: ApplicationCommandOptionType.Subcommand }
  ? TransformSubcommandOption<T>
  : T extends { type: ApplicationCommandOptionType.SubcommandGroup }
    ? TransformSubcommandGroupOption<T>
    : TransformBasicOption<T>;

// Main type that transforms an array of command options into a typed options object
export type CommandOptionsType<T extends readonly BasicOptionType[] | undefined> = T extends readonly [infer First, ...infer Rest]
  ? First extends BasicOptionType
    ? Rest extends readonly BasicOptionType[]
      ? TransformOption<First> & CommandOptionsType<Rest>
      : TransformOption<First>
    : {}
  : {};

// Helper type to extract options from command data
export type ExtractCommandOptions<T> = T extends { options: infer Options }
  ? Options extends readonly { type: ApplicationCommandOptionType; name: string; required?: boolean }[]
    ? CommandOptionsType<Options>
    : {}
  : {};
