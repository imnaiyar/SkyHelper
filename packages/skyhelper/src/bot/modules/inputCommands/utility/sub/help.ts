import type { Category, SkyHelper } from "@/structures";
import type { InteractionHelper } from "@/utils/classes/InteractionUtil";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  type APIApplicationCommand,
  type APIApplicationCommandBasicOption,
  type APIEmbed,
} from "@discordjs/core";
import { resolveColor } from "@skyhelperbot/utils";

// TODO: Refactor, lot's of code duplication here
export async function handleSingleCmd(helper: InteractionHelper, commandName: string) {
  const { client, t } = helper;
  const commands = client.applicationCommands;
  const guild = client.guilds.get(helper.int.guild_id || "");
  const cmd =
    commands.find((c) => c.name === commandName) ||
    (guild
      ? (await client.api.applicationCommands.getGuildCommands(client.user.id, guild.id)).find((c) => c.name === commandName)
      : undefined);
  if (!cmd) {
    await helper.followUp({
      content: t("errors:COMMAND_NOT_FOUND"),
    });
    return;
  }
  const data = formatCommand(cmd, client);
  data.author = {
    name: t("commands:HELP.RESPONSES.REQUESTED_BY", {
      USER: helper.user.username,
    }),
    icon_url: client.utils.getUserAvatar(client.user),
  };
  data.footer = {
    text: t("commands:HELP.RESPONSES.FOOTER_SINGLE"),
    icon_url: client.utils.getUserAvatar(client.user),
  };
  data.color = resolveColor("Random");
  await helper.followUp({ embeds: [data] });
  return;
}

function formatCommand(command: APIApplicationCommand, client: SkyHelper): APIEmbed {
  const name = command.name;
  const description = command.description;
  const hasSubcommand = command.options?.some((opt) => [1, 2].includes(opt.type));
  const options = command.options;
  const title = hasSubcommand ? `\`${name}\`` : `</${name}:${command.id}>`;
  let desc = "↪ " + description + "\n";
  if (options?.length && hasSubcommand) {
    desc += "\n**Subcommands**\n";
    const hasGroups = options.some((opt) => opt.type === ApplicationCommandOptionType.SubcommandGroup);
    if (hasGroups) {
      for (const _opts of options) {
        if (_opts.type !== ApplicationCommandOptionType.SubcommandGroup) continue;
        desc += _opts.options
          ?.map((opt) => {
            let opts: string | undefined = undefined;
            if (opt.type === ApplicationCommandOptionType.Subcommand && opt.options) {
              opts = formatOptions(opt.options);
            }
            return `</${name} ${_opts.name} ${opt.name}:${command.id}>\n↪ ${opt.description}${opt ? `\n- **Options**:\n${opts}` : ""}`;
          })
          .join("\n\n");
      }
    } else {
      desc += options
        .map((opt) => {
          let opts: string | undefined = undefined;
          if (opt.type === ApplicationCommandOptionType.Subcommand && opt.options) {
            opts = formatOptions(opt.options);
          }
          return `</${name} ${opt.name}:${command.id}>\n↪ ${opt.description}${opt ? `\n- **Options**:\n${opts}` : ""}`;
        })
        .join("\n\n");
    }
  } else if (options?.length) {
    desc += "- **Options**:\n";
    desc += formatOptions(options as APIApplicationCommandBasicOption[]);
  }
  desc += "\n";
  const local_commands = client.commands.find((c) => c.name === command.name);
  if (local_commands) {
    desc += "**Additional Info**\n";
    // prettier-ignore
    if (local_commands.userPermissions) desc += `\n- Required User Permissions: \`${(local_commands.userPermissions as []).join(", ")}\``;
    // prettier-ignore
    if (local_commands.botPermissions) desc += `\n- Required Bot Permissions: \`${(local_commands.botPermissions as []).join(", ")}\``;
    if (local_commands.category) desc += `\n- Category: \`${local_commands.category}\``;

    // prettier-ignore
    if (local_commands.category) desc += `\n\n-# You can learn more about this command at our command documentations [here](${client.config.DOCS_URL}/commands/${local_commands.category.toLowerCase()}#${command.name})`;
  }
  return {
    title,
    description: desc,
  };
}

function formatOptions(options: APIApplicationCommandBasicOption[]) {
  return options
    .map((opt) => {
      return ` - \`${opt.required ? `<${opt.name}>` : `[${opt.name}]`}\` - ${opt.description}`;
    })
    .join("\n");
}

export function handleCategoryCommands(
  commands: APIApplicationCommand[],
  client: SkyHelper,
  category: (typeof Category)[number]["name"],
  t: ReturnType<typeof import("@/i18n").getTranslator>,
) {
  const validCommands = commands.filter(
    (c) => client.commands.get(c.name)?.category === category || client.contexts.get(c.name + c.type)?.category === category,
  );
  const totalCommands: string[] = [];

  for (const cmd of validCommands) {
    const data = format(cmd, t);
    if (Array.isArray(data)) {
      for (const d of data) {
        if (Array.isArray(d)) {
          totalCommands.push(...d);
          continue;
        }
        totalCommands.push(d);
      }
      continue;
    }
    totalCommands.push(data);
  }
  return totalCommands;
}

function format(command: APIApplicationCommand, t: ReturnType<typeof import("@/i18n").getTranslator>) {
  if ([ApplicationCommandType.Message, ApplicationCommandType.User].includes(command.type)) {
    return `</${command.name}:${command.id}>  \`${command.type === 3 ? t("commands:HELP.RESPONSES.MESSAGE_APP_DESC") : t("commands:HELP.RESPONSES.USER_APP_DESC")}\``;
  }
  if (command.options?.some((op) => op.type === 1 || op.type === ApplicationCommandOptionType.SubcommandGroup)) {
    return command.options.map((o) => {
      if (o.type === ApplicationCommandOptionType.SubcommandGroup) {
        const formatted = [];
        for (const sub of o.options || []) {
          formatted.push(
            `**</${command.name} ${o.name} ${sub.name}:${command.id}>**  ${
              sub.type === 1 && sub.options?.length
                ? `${sub.options
                    ?.map((m) => {
                      return m.required ? `\`<${m.name}>\`` : `\`[${m.name}]\``;
                    })
                    .join(", ")}`
                : ""
            }\n  ↪ ${sub.description}`,
          );
        }
        return formatted;
      }
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
