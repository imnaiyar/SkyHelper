import { supportedLang } from "@skyhelperbot/constants";
import type { Command } from "@/structures/Command";
import { ApplicationCommandOptionType, ApplicationIntegrationType, InteractionContextType } from "@discordjs/core";

// #region Help
export const HELP_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "help",
  description: "help menu",
  data: {
    name_localizations: "commands:HELP.name",
    description_localizations: "commands:HELP.description",
    options: [
      {
        name: "command",
        name_localizations: "commands:HELP.options.COMMAND.name",
        description: "help about a specific command",
        description_localizations: "commands:HELP.options.COMMAND.description",
        type: ApplicationCommandOptionType.String,
        required: false,
        autocomplete: true,
      },
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  category: "Utility",
  cooldown: 10,
};

// #region Language
export const LANGUAGE_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "language",
  description: "manage preferred language for the bot's response",
  data: {
    name_localizations: "commands:LANGUAGE.name",
    description_localizations: "commands:LANGUAGE.description",
    options: [
      {
        name: "set",
        name_localizations: "commands:LANGUAGE.options.SUB.SET.name",
        description: "set your/server language for the bot",
        description_localizations: "commands:LANGUAGE.options.SUB.SET.description",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "category",
            name_localizations: "commands:LANGUAGE.options.CATEGORY.name",
            description: "select a category to set the laguage for",
            description_localizations: "commands:LANGUAGE.options.CATEGORY.description",
            type: ApplicationCommandOptionType.String,
            choices: [
              {
                name: "Server",
                name_localizations: "commands:LANGUAGE.options.CATEGORY.choices.GUILD",
                value: "server",
              },
              {
                name: "User",
                name_localizations: "commands:LANGUAGE.options.CATEGORY.choices.USER",
                value: "user",
              },
            ],
            required: true,
          },
          {
            name: "languages",
            name_localizations: "commands:LANGUAGE.options.LANGUAGES.name",
            description: "select a language",
            description_localizations: "commands:LANGUAGE.options.LANGUAGES.description",
            type: ApplicationCommandOptionType.String,
            choices: supportedLang.map((lang) => ({
              name: `${lang.flag} ${lang.name}`,
              value: lang.value,
            })),
            required: true,
          },
        ],
      },
      {
        name: "remove",
        name_localizations: "commands:LANGUAGE.options.SUB.REMOVE.name",
        description: "remove a set language",
        description_localizations: "commands:LANGUAGE.options.SUB.REMOVE.description",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "category",
            name_localizations: "commands:LANGUAGE.options.CATEGORY.name",
            description: "select a category type to remove",
            description_localizations: "commands:LANGUAGE.options.SUB.REMOVE.options.description",
            type: ApplicationCommandOptionType.String,
            choices: [
              {
                name: "Server",
                name_localizations: "commands:LANGUAGE.options.CATEGORY.choices.GUILD",
                value: "server",
              },
              {
                name: "User",
                name_localizations: "commands:LANGUAGE.options.CATEGORY.choices.USER",
                value: "user",
              },
            ],
            required: true,
          },
        ],
      },
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  category: "Utility",
};

// #region Utils
export const UTILS_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "utils",
  description: "Utilities",
  data: {
    name_localizations: "commands:UTILS.name",
    description_localizations: "commands:UTILS.description",
    integration_types: [0, 1],
    contexts: [0, 1, 2],
    options: [
      {
        name: "timestamp",
        name_localizations: "commands:UTILS.options.TIMESTAMP.name",
        description: "get unix timestamp for the given date",
        description_localizations: "commands:UTILS.options.TIMESTAMP.description",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "time",
            name_localizations: "commands:UTILS.options.TIMESTAMP.options.TIME.name",
            description: "The time to convert (format: HH mm ss)",
            description_localizations: "commands:UTILS.options.TIMESTAMP.options.TIME.description",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "timezone",
            name_localizations: "commands:UTILS.options.TIMESTAMP.options.TIMEZONE.name",
            description: "Your timezone in the format: Continent/City",
            description_localizations: "commands:UTILS.options.TIMESTAMP.options.TIMEZONE.description",
            type: ApplicationCommandOptionType.String,
            required: false,
            autocomplete: true,
          },
          {
            name: "date",
            name_localizations: "commands:UTILS.options.TIMESTAMP.options.DATE.name",
            description: "The date to convert (format: DD)",
            description_localizations: "commands:UTILS.options.TIMESTAMP.options.DATE.description",
            type: ApplicationCommandOptionType.Integer,
            required: false,
          },
          {
            name: "month",
            name_localizations: "commands:UTILS.options.TIMESTAMP.options.MONTH.name",
            description: "The month to convert (format: MM)",
            description_localizations: "commands:UTILS.options.TIMESTAMP.options.MONTH.description",
            type: ApplicationCommandOptionType.Integer,
            required: false,
          },
          {
            name: "year",
            name_localizations: "commands:UTILS.options.TIMESTAMP.options.YEAR.name",
            description: "The year to convert (format: YYYY)",
            description_localizations: "commands:UTILS.options.TIMESTAMP.options.YEAR.description",
            type: ApplicationCommandOptionType.Integer,
            required: false,
          },
        ],
      },
      {
        name: "changelog",
        name_localizations: "commands:UTILS.options.CHANGELOG.name",
        description: "bot's changelog",
        description_localizations: "commands:UTILS.options.CHANGELOG.description",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "contact-us",
        name_localizations: "commands:UTILS.options.CONTACT-US.name",
        description: "for suggestions/bug reports/contacting us or just anything",
        description_localizations: "commands:UTILS.options.CONTACT-US.description",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },
  category: "Utility",
};

// #region LinkedRole

export const LINKED_ROLE_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "linked-role",
  description: "Link your sky profile with the bot",
  data: {
    integration_types: [ApplicationIntegrationType.GuildInstall],
    contexts: [InteractionContextType.Guild],
    options: [
      {
        name: "hide",
        description: "Hide the response",
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
    ],
  },
  cooldown: 40,
  category: "Utility",
};

// #region bot
export const BOT_COMMAND_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "bot",
  description: "Bot related commands",
  data: {
    name_localizations: "commands:BOT.name",
    description_localizations: "commands:BOT.description",
    options: [
      {
        name: "info",
        name_localizations: "commands:BOT.options.INFO.name",
        description_localizations: "commands:BOT.options.INFO.description",
        description: "Get bot information",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "manage",
        name_localizations: "commands:BOT.options.MANAGE.name",
        description_localizations: "commands:BOT.options.MANAGE.description",
        description: "Manage the bot settings for the server",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "personalize",
        name_localizations: "commands:BOT.options.PERSONALIZE.name",
        description_localizations: "commands:BOT.options.PERSONALIZE.description",
        description: "Personalize the bot for this server",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
    integration_types: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
    contexts: [InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel],
  },
  category: "Utility",
  validations: [
    {
      type: "interaction",
      callback: ({ options, helper, t }) => {
        const sub = options.getSubcommand();
        if (sub === "personalize" && !helper.int.guild_id) return { status: false, message: t("errors:NOT_A_SERVER") };
        return { status: true };
      },
    },
  ],
};

// #region planner
export const PLANNER_DATA: Omit<Command, "interactionRun" | "messageRun"> = {
  name: "planner",
  description: "track and plan your sky progress",
  data: {
    // TODO: change this once stable
    integration_types: [ApplicationIntegrationType.GuildInstall],
    contexts: [InteractionContextType.Guild],
    name_localizations: "commands:PLANNER.name",
    description_localizations: "commands:PLANNER.description",
    options: [
      {
        name: "home",
        name_localizations: "commands:PLANNER.options.home.name",
        description_localizations: "commands:PLANNER.options.home.description",
        description: "track and plan your sky progress",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "stats",
        description: "view your sky planner statistics and progress",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "search",
        name_localizations: "commands:PLANNER.options.search.name",
        description_localizations: "commands:PLANNER.options.search.description",
        description: "search and directly go to items/seasons/events/wls/etc... in the planner",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "query",
            name_localizations: "commands:PLANNER.options.query.name",
            description_localizations: "commands:PLANNER.options.query.description",
            description: "the query to search for",
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
          },
        ],
      },
      {
        name: "data",
        name_localizations: "commands:PLANNER.options.data.name",
        description_localizations: "commands:PLANNER.options.data.description",
        description: "manage planner's data",
        type: ApplicationCommandOptionType.SubcommandGroup,
        options: [
          {
            name: "import",
            name_localizations: "commands:PLANNER.options.import.name",
            description_localizations: "commands:PLANNER.options.import.description",
            description: "import data from sky-planner website or saved .json file",
            type: ApplicationCommandOptionType.Subcommand,
          },
          {
            name: "export",
            name_localizations: "commands:PLANNER.options.export.name",
            description_localizations: "commands:PLANNER.options.export.description",
            description: "export your current data to a .json file",
            type: ApplicationCommandOptionType.Subcommand,
          },
        ],
      },
    ],
  },
  beta: true,
  cooldown: 15,
  category: "Utility",
};
