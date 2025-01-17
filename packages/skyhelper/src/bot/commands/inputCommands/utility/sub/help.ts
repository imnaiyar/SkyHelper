import type { Category } from "#bot/structures/Category";
import type { SkyHelper } from "#bot/structures/SkyHelper";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  EmbedBuilder,
  type APIApplicationCommandBasicOption,
  type ApplicationCommand,
  type ApplicationCommandOption,
  type ApplicationCommandSubCommand,
  type ApplicationCommandSubGroup,
  type ChatInputCommandInteraction,
} from "discord.js";

export async function handleSingleCmd(
  interaction: ChatInputCommandInteraction,
  t: ReturnType<typeof import("#bot/i18n").getTranslator>,
  commandName: string,
) {
  const commands = interaction.client.application.commands.cache;
  const cmd =
    commands.find((c) => c.name === commandName) ||
    (interaction.inCachedGuild() ? (await interaction.guild.commands.fetch()).find((c) => c.name == commandName) : undefined);
  if (!cmd) {
    await interaction.followUp({
      content: t("errors:COMMAND_NOT_FOUND"),
    });
    return;
  }
  const data = formatCommand(cmd);
  data.setAuthor({
    name: t("commands:HELP.RESPONSES.REQUESTED_BY", {
      USER: interaction.user.username,
    }),
    iconURL: interaction.user.displayAvatarURL(),
  });
  data.setFooter({
    text: t("commands:HELP.RESPONSES.FOOTER_SINGLE"),
    iconURL: interaction.client.user.displayAvatarURL(),
  });
  data.setColor("Random");
  await interaction.followUp({ embeds: [data] });
  return;
}

function formatCommand(command: ApplicationCommand): EmbedBuilder {
  const name = command.name;
  const description = command.description;
  const hasSubcommand = command.options.some((opt) => opt.type === ApplicationCommandOptionType.Subcommand);
  const options = command.options;
  const title = hasSubcommand ? `\`${name}\`` : `</${name}:${command.id}>`;
  let desc = "↪ " + description + "\n";
  if (options.length && hasSubcommand) {
    desc += "\n**Subcommands**\n";
    desc += options
      .map((opt) => {
        let opts: string | undefined = undefined;
        if (opt.type === ApplicationCommandOptionType.Subcommand && opt.options) {
          opts = formatOptions(opt.options);
        }
        return `</${name} ${opt.name}:${command.id}>\n↪ ${opt.description}${opt ? `\n- **Options**:\n${opts}` : ""}`;
      })
      .join("\n\n");
  } else if (options.length) {
    desc += "- **Options**:\n";
    desc += formatOptions(options as APIApplicationCommandBasicOption[]);
  }
  desc += "\n";
  const local_commands = command.client.commands.find((c) => c.name === command.name);
  if (local_commands) {
    if (local_commands.userPermissions) desc += `\n- Required User Permissions: \`${local_commands.userPermissions.join(", ")}\``;
    if (local_commands.botPermissions) desc += `\n- Required Bot Permissions: \`${local_commands.botPermissions.join(", ")}\``;
    if (local_commands.category) desc += `\n- Category: \`${local_commands.category}\``;

    // prettier-ignore
    if (local_commands.category) desc += `\n\n-# You can learn more about this command at our command documentations [here](${command.client.config.DOCS_URL}/commands/${local_commands.category.toLowerCase()}#${command.name})`;
  }
  return new EmbedBuilder().setTitle(title).setDescription(desc);
}

function formatOptions(
  options: readonly Exclude<ApplicationCommandOption, ApplicationCommandSubGroup | ApplicationCommandSubCommand>[],
) {
  return options
    .map((opt) => {
      return `- \`${opt.required ? `<${opt.name}>` : `[${opt.name}]`}\` - ${opt.description}`;
    })
    .join("\n");
}

export function handleCategoryCommands(
  commands: ApplicationCommand[],
  client: SkyHelper,
  category: (typeof Category)[number]["name"],
  t: ReturnType<typeof import("#bot/i18n").getTranslator>,
) {
  const validCommands = commands.filter(
    (c) => client.commands.get(c.name)?.category === category || client.contexts.get(c.name + c.type)?.category === category,
  );
  const totalCommands: string[] = [];

  for (const cmd of validCommands) {
    const data = format(cmd, t);
    if (Array.isArray(data)) {
      totalCommands.push(...data);
      continue;
    }
    totalCommands.push(data);
  }
  return totalCommands;
}

function format(command: ApplicationCommand, t: ReturnType<typeof import("#bot/i18n").getTranslator>) {
  if ([ApplicationCommandType.Message, ApplicationCommandType.User].includes(command.type)) {
    return `</${command.name}:${command.id}>  \`${command.type === 3 ? t("commands:HELP.RESPONSES.MESSAGE_APP_DESC") : t("commands:HELP.RESPONSES.USER_APP_DESC")}\``;
  }
  if (command.options?.some((op) => op.type === 1 || op.type === ApplicationCommandOptionType.SubcommandGroup)) {
    return command.options.map((o) => {
      return `**</${command.name} ${o.name}:${command.id}>** ${
        o.type === 1 && o.options?.length
          ? `${o.options
              ?.map((m) => {
                return m.required ? `\`<${m.name}>\`` : `\`[${m.name}]\``;
              })
              .join(", ")}`
          : ""
      }\n  ↪ ${o.description}`;
    });
  }

  return `</${command.name}:${command.id}> ${
    command.options?.length
      ? `${command.options
          .map((m) => {
            // prettier-ignore
            if (m.type === ApplicationCommandOptionType.Subcommand || m.type === ApplicationCommandOptionType.SubcommandGroup) return;
            return m.required ? `\`<${m.name}>\`` : `\`[${m.name}]\``;
          })
          .join(", ")}`
      : ""
  }\n${command.description}`;
}
