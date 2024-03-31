const { WebhookClient, EmbedBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder, Collection } = require("discord.js");
const { parsePerm, btnHandler } = require("@src/handler");
const cLogger = process.env.COMMANDS_USED ? new WebhookClient({ url: process.env.COMMANDS_USED }) : undefined;
const bLogger = process.env.BUG_REPORTS ? new WebhookClient({ url: process.env.BUG_REPORTS }) : undefined;
const errorEmbed = new EmbedBuilder()
  .setTitle(`ERROR`)
  .setDescription(`An error occurred while executing this command.`);
const errorBtn = new ActionRowBuilder().addComponents(
  new ButtonBuilder().setLabel("Report Bug").setCustomId("error-report").setStyle(ButtonStyle.Secondary),
);
/**
 * Intraction event handler
 * @param {import('@src/frameworks').SkyHelper} client
 * @param {import('discord.js').Interaction} interaction
 */
module.exports = async (client, interaction) => {
  if (interaction.isChatInputCommand()) {
    // Chat Input
    if (!interaction.isCommand()) return;

    const commandName = interaction.commandName;
    const command = client.commands.get(commandName);

    if (!command) {
      return await interaction.reply({
        content: "This command is Invalid or doesn`t exist",
        ephemeral: true,
      });
    }
    // If command is owner only.
    if (
      command.data.category &&
      command.data.category === "OWNER" &&
      !client.config.OWNER.includes(interaction.user.id)
    ) {
      return;
    }

    // Check if the user has permissions to use the command.
    if (command.data?.userPermissions && !interaction.member.permissions.has(command.data.userPermissions)) {
      return await interaction.reply({
        content: `You don't have necessary permission(s) (${parsePerm(
          command.data.userPermissions,
        )}) to use this command`,
        ephemeral: true,
      });
    }

    // Check if bot has necessary permissions to execute the command functions
    if (
      interaction.inGuild() &&
      command.data?.botPermissions &&
      !interaction.guild.members.me.permissions.has(command.data.botPermissions)
    ) {
      return await interaction.reply({
        content: `I do not have the required permission(s) (${parsePerm(
          command.data.botPermissions,
        )}) to perform this action. Please run the command again after granting me the necessary permission(s).`,
        ephemeral: true,
      });
    }

    // Check cooldowns
    if (command?.cooldown && !client.config.OWNER.includes(interaction.user.id)) {
      const { cooldowns } = client;

      if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Collection());
      }

      const now = Date.now();
      const timestamps = cooldowns.get(command.data.name);
      const cooldownAmount = command.cooldown * 1000;

      if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime) {
          const expiredTimestamp = Math.round(expirationTime / 1000);
          return await interaction.reply({
            content: `Please wait, you are on a cooldown for </${interaction.commandName}:${interaction.commandId}>. You can use it again <t:${expiredTimestamp}:R>.`,
            ephemeral: true,
          });
        }
      }

      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
    }
    try {
      await command.execute(interaction, client);
      const embed = new EmbedBuilder()
        .setTitle("New command used")
        .addFields(
          { name: `Command`, value: `\`${interaction}\`` },
          {
            name: `User`,
            value: `${interaction.user.username} \`[${interaction.user.id}]\``,
          },
          {
            name: `Server`,
            value: `${interaction.guild?.name} \`[${interaction.guild?.id}]\``,
          },
          {
            name: `Channel`,
            value: `${interaction.channel?.name} \`[${interaction.channel?.id}]\``,
          },
        )
        .setColor("Blurple")
        .setTimestamp();

      // Slash Commands
      if (!client.config.OWNER.includes(interaction.user.id) && process.env.COMMANDS_USED) {
        cLogger.send({ username: "Command Logs", embeds: [embed] }).catch((ex) => {});
      }
    } catch (error) {
      client.logger.error(error);

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          embeds: [errorEmbed],
          components: [errorBtn],
        });
      } else {
        await interaction.reply({
          embeds: [errorEmbed],
          components: [errorBtn],
          ephemeral: true,
        });
      }
    }
  }

  // Autocomplete interaction
  if (interaction.isAutocomplete()) {
    const command = client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.autocomplete(interaction, client);
    } catch (error) {
      console.error(error);
    }
  }
  // Buttons
  if (interaction.isButton()) {
    const button = client.buttons.find((btn) => interaction.customId.startsWith(btn.name));
    if (!button) return;

    try {
      await button.execute(interaction, client);
    } catch (err) {
      client.logger.error(err);

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          embeds: [errorEmbed],
          components: [errorBtn],
        });
      } else {
        await interaction.reply({
          embeds: [errorEmbed],
          components: [errorBtn],
          ephemeral: true,
        });
      }
    }
  }
  // Modals
  if (interaction.isModalSubmit()) {
    if (interaction.customId === "errorModal") {
      await interaction.reply({
        content: "Your submission was received successfully!",
        ephemeral: true,
      });
      const commandUsed = interaction.fields.getTextInputValue("commandUsed");
      const whatHappened = interaction.fields.getTextInputValue("whatHappened");
      const embed = new EmbedBuilder()
        .setTitle("BUG REPORT")
        .addFields(
          { name: `Command Used`, value: `\`${commandUsed}\`` },
          {
            name: `User`,
            value: `${interaction.user.username} \`[${interaction.member.id}]\``,
          },
          {
            name: `Server`,
            value: `${interaction.guild.name} \`[${interaction.guild.id}]\``,
          },
          { name: `What Happened`, value: `${whatHappened}` },
        )
        .setColor("Blurple")
        .setTimestamp();
      bLogger.send({ username: "Bug Report", embeds: [embed] }).catch((ex) => {});
    }
  }
};
