import type { Command } from "#structures";
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import { HELP_DATA } from "#bot/commands/commands-data/utility-commands";
import { handleCategoryCommands, handleSingleCmd } from "./sub/help.js";
import { Category } from "#structures/Category";

export default {
  async interactionRun(interaction, t, client) {
    const commandName = interaction.options.getString("command");
    const reply = await interaction.deferReply({
      ephemeral: commandName ? true : false,
      fetchReply: true,
    });
    const commands = client.application.commands.cache;

    if (commandName) {
      await handleSingleCmd(interaction, t, commandName);
      return;
    }
    let category: (typeof Category)[number] = Category.find((c) => c.name === "Admin")!;

    const collector = reply.createMessageComponentCollector({
      filter: (i) => i.message.id === reply.id,
      idle: 2 * 60 * 1000,
    });
    let page = 1;
    const guildCommands = interaction.inCachedGuild() ? [...(await interaction.guild.commands.fetch()).values()] : [];
    const updateSlashMenu = async () => {
      const totalCommands: string[] = handleCategoryCommands([...commands.values(), ...guildCommands], client, category.name, t);
      const commandsPerPage = 5;
      const totalPages = Math.ceil(totalCommands.length / commandsPerPage);
      const slashEmbed = new EmbedBuilder()
        .setAuthor({
          name: t("commands:HELP.RESPONSES.REQUESTED_BY", {
            USER: interaction.user.username,
          }),
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setColor("Gold")
        .setFooter({
          text: t("commands:HELP.RESPONSES.FOOTER", {
            PAGE: page,
            TOTAL: totalPages,
          }),
        });

      const startIndex = (page - 1) * commandsPerPage;
      const endIndex = startIndex + commandsPerPage;

      slashEmbed.setDescription(totalCommands.length ? totalCommands.slice(startIndex, endIndex).join("\n\n") : "No Commands");
      const hmBtn = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("prevBtn")
          .setLabel(t("commands:HELP.RESPONSES.BTN-PREV"))
          .setStyle(2)
          .setDisabled(page === 1),
        new ButtonBuilder().setLabel("🏠").setCustomId("homeBtn").setStyle(3).setDisabled(true),
        new ButtonBuilder()
          .setLabel(t("commands:HELP.RESPONSES.BTN-NEXT"))
          .setCustomId("nextBtn")
          .setStyle(2)
          .setDisabled(page === totalPages),
      );

      const categoryMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setPlaceholder("Select a category")
          .setCustomId("help_category")
          .addOptions(
            Category.filter((c) => (c.name === "Owner" ? client.config.OWNER.includes(interaction.user.id) : true)).map((c) => ({
              label: c.name,
              value: c.name,
              emoji: c.emoji,
              default: c.name === category.name,
            })),
          ),
      );
      return {
        embeds: [slashEmbed],
        components: [categoryMenu, hmBtn],
      };
    };
    await interaction.followUp(await updateSlashMenu());
    collector.on("collect", async (int) => {
      const selectedChoice = int.customId;
      if (selectedChoice === "nextBtn") {
        page++;
        await int.update(await updateSlashMenu());
      } else if (selectedChoice === "prevBtn") {
        if (page > 1) {
          page--;
          await int.update(await updateSlashMenu());
        }
      }
      if (int.isStringSelectMenu()) {
        category = Category.find((c) => c.name === int.values[0])!;
        page = 1;
        await int.update(await updateSlashMenu());
      }
    });
  },

  async autocomplete(interaction, client) {
    const value = interaction.options.getFocused();
    const commands = client.application.commands.cache.map((c) => c);
    const guildCommands = interaction.inCachedGuild() ? [...(await interaction.guild.commands.fetch()).values()] : [];
    commands.push(...guildCommands);
    const choices = commands
      .filter((cmd) =>
        (client.commands.get(cmd.name) || client.contexts.get(cmd.name + cmd.type))?.category === "Owner"
          ? client.config.OWNER.includes(interaction.user.id)
          : true,
      )
      .filter((cmd) => cmd.name.includes(value))
      .map((cmd) => ({
        name: cmd.name,
        value: cmd.name,
      }));
    await interaction.respond(choices);
  },
  ...HELP_DATA,
} satisfies Command<true>;
