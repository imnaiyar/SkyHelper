import { ContextTypes, IntegrationTypes } from "#libs";
import type { SlashCommand } from "#structures";
import {
  type APIApplicationCommandBasicOption,
  ActionRowBuilder,
  ApplicationCommand,
  ApplicationCommandOptionType,
  type ApplicationCommandSubCommandData,
  ApplicationCommandType,
  ButtonBuilder,
  ButtonInteraction,
  EmbedBuilder,
} from "discord.js";

export default {
  data: {
    name: "help",
    description: "help menu",
    options: [
      {
        name: "command",
        description: "help about a specific command",
        type: ApplicationCommandOptionType.String,
        required: false,
        autocomplete: true,
      },
    ],
    integration_types: [IntegrationTypes.Guilds, IntegrationTypes.Users],
    contexts: [ContextTypes.BotDM, ContextTypes.Guild, ContextTypes.PrivateChannels],
  },
  category: "Utility",
  cooldown: 10,
  async execute(interaction, client) {
    const command = interaction.options.getString("command");
    const reply = await interaction.deferReply({ ephemeral: command ? true : false, fetchReply: true });
    const commands = client.application.commands.cache;
    if (command) {
      const cmd = commands.find((c) => c.name === command);
      if (!cmd) {
        await interaction.followUp({
          content: "No such command or outdated command",
        });
        return;
      }
      const data = handleCommand(cmd);
      data.setAuthor({ name: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });
      data.setFooter({ text: "Help command", iconURL: client.user.displayAvatarURL() });
      data.setColor("Random");
      await interaction.followUp({ embeds: [data] });
      return;
    }
    const totalCommands: string[] = [];
    const pageCommands = Array.from(commands.values());

    pageCommands.forEach((cmd) => {
      if (cmd.type === ApplicationCommandType.Message || cmd.type === ApplicationCommandType.User) {
        totalCommands.push(`</${cmd.name}:${cmd.id}>  \`${cmd.type === 3 ? "Message App Command" : "User App Command"}\`\n\n`);
      } else if (cmd.options?.some((op) => op.type === 1 || op.type === ApplicationCommandOptionType.SubcommandGroup)) {
        cmd.options.forEach((o) => {
          totalCommands.push(
            `**</${cmd.name} ${o.name}:${cmd.id}>** ${
              (o as ApplicationCommandSubCommandData).options?.length
                ? `${(o as ApplicationCommandSubCommandData).options
                    ?.map((m) => {
                      return m.required ? `\`<${m.name}>\`` : `\`[${m.name}]\``;
                    })
                    .join(", ")}`
                : ""
            }\n  ↪ ${o.description}\n\n`,
          );
        });
      } else {
        totalCommands.push(
          `</${cmd.name}:${cmd.id}> ${
            cmd.options?.length
              ? `${cmd.options
                  .map((m) => {
                    // prettier-ignore
                    if (m.type === ApplicationCommandOptionType.Subcommand || m.type === ApplicationCommandOptionType.SubcommandGroup) return;
                    return m.required ? `\`<${m.name}>\`` : `\`[${m.name}]\``;
                  })
                  .join(", ")}`
              : ""
          }\n${cmd.description}\n\n`,
        );
      }
    });

    const collector = reply.createMessageComponentCollector({
      filter: (i) => i.message.id === reply.id,
      idle: 2 * 60 * 1000,
    });
    let page = 1;
    const commandsPerPage = 5;
    const totalPages = Math.ceil(totalCommands.length / commandsPerPage);

    const updateSlashMenu = async () => {
      const slashEmbed = new EmbedBuilder()
        .setAuthor({
          name: `Requested by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setColor("Gold")
        .setFooter({
          text: `run /help <command> for details. | Page ${page}/${totalPages}`,
        });

      const startIndex = (page - 1) * commandsPerPage;
      const endIndex = startIndex + commandsPerPage;

      slashEmbed.setDescription(totalCommands.slice(startIndex, endIndex).join(""));
      const hmBtn = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel("Prev")
          .setCustomId("prevBtn")
          .setStyle(2)
          .setDisabled(page === 1),
        new ButtonBuilder().setLabel("🏠").setCustomId("homeBtn").setStyle(3).setDisabled(true),
        new ButtonBuilder()
          .setLabel("Next")
          .setCustomId("nextBtn")
          .setStyle(2)
          .setDisabled(page === totalPages),
      );
      return {
        embeds: [slashEmbed],
        components: [hmBtn],
      };
    };
    await interaction.followUp(await updateSlashMenu());
    collector.on("collect", async (int: ButtonInteraction) => {
      const selectedChoice = int.customId;
      if (selectedChoice === "nextBtn") {
        if (page < totalPages) {
          page++;
          await int.update(await updateSlashMenu());
        }
      } else if (selectedChoice === "prevBtn") {
        if (page > 1) {
          page--;
          await int.update(await updateSlashMenu());
        }
      }
    });
  },

  async autocomplete(interaction, client) {
    const value = interaction.options.getFocused();
    const commands = client.application.commands.cache.map((cmd) => cmd.name);
    const choices = commands
      .filter((cmd) => cmd.includes(value))
      .map((cmd) => ({
        name: cmd,
        value: cmd,
      }));
    await interaction.respond(choices);
  },
} satisfies SlashCommand<true>;

function handleCommand(command: ApplicationCommand): EmbedBuilder {
  const name = command.name;
  const description = command.description;
  const hasSubcommand = command.options?.some((opt) => opt.type === ApplicationCommandOptionType.Subcommand);
  const options = command.options;
  const title = hasSubcommand ? `\`${name}\`` : `</${name}:${command.id}>`;
  let desc = "↪ " + description + "\n";
  if (options.length && hasSubcommand) {
    desc += "\n**Subcommands**\n";
    desc += options
      .map((opt) => {
        let opts: string | undefined = undefined;
        if ((opt as ApplicationCommandSubCommandData).options) {
          opts = (opt as ApplicationCommandSubCommandData).options
            ?.map((o) => {
              return o.required ? ` - \`<${o.name}>\` - ${o.description}` : ` - \`[${o.name}]\` - ${o.description}`;
            })
            .join("\n");
        }
        return opts?.length
          ? `</${name} ${opt.name}:${command.id}>\n↪ ${opt.description}\n- **Options**:\n${opts}`
          : `</${name} ${opt.name}:${command.id}>\n↪ ${opt.description}`;
      })
      .join("\n\n");
  } else if (options.length) {
    desc += "- **Options**:\n";
    desc += options
      ?.map((opt) => {
        return (opt as APIApplicationCommandBasicOption).required
          ? ` - \`<${opt.name}>\` - ${opt.description}`
          : ` - \`[${opt.name}]\` - ${opt.description}`;
      })
      .join("\n");
  }

  return new EmbedBuilder().setTitle(title).setDescription(desc);
}
