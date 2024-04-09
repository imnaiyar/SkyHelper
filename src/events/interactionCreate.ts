import {
  Interaction,
  Collection,
  EmbedBuilder,
  WebhookClient,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { SkyHelper } from "#structures";
import { parsePerms } from "skyhelper-utils";
import { Permission } from "skyhelper-utils/dist/utils/parsePerms";
import config from "#src/config";

const cLogger = process.env.COMMANDS_USED ? new WebhookClient({ url: process.env.COMMANDS_USED }) : undefined;
const bLogger = process.env.BUG_REPORTS ? new WebhookClient({ url: process.env.BUG_REPORTS }) : undefined;
const errorEmbed = new EmbedBuilder()
  .setTitle(`ERROR`)
  .setDescription(`An error occurred while executing this command.`);
const errorBtn = new ActionRowBuilder<ButtonBuilder>().addComponents(
  new ButtonBuilder().setLabel("Report Bug").setCustomId("error-report").setStyle(ButtonStyle.Secondary),
);

export default async (client: SkyHelper, interaction: Interaction) => {
  if (interaction.isChatInputCommand()) {
    const cmd = client.commands.get(interaction.commandName);
    if (!cmd) return await interaction.reply({ content: "No such command or outdated command", ephemeral: true });
    if (cmd.category && cmd.category === "Owner" && !config.OWNER.includes(interaction.user.id)) {
      return await interaction.reply({
        content: "This command is for owner(s) only.",
        ephemeral: true,
      });
    }
    if (
      cmd.data.userPermissions &&
      interaction.inCachedGuild() &&
      !interaction.member?.permissions.has(cmd.data.userPermissions)
    ) {
      return await interaction.reply({
        content: `You don't have necessary permission(s) (${parsePerms([cmd.data.userPermissions as unknown as Permission])}) to use this command`,
        ephemeral: true,
      });
    }
    if (
      cmd.data.botPermissions &&
      interaction.inGuild() &&
      !interaction.guild?.members.me?.permissions.has(cmd.data.botPermissions)
    ) {
      return await interaction.reply({
        content: `I do not have the required permission(s) (${parsePerms(cmd.data.botPermissions as unknown as Permission)}) to perform this action. Please run the command again after granting me the necessary permission(s).`,
        ephemeral: true,
      });
    }

    // Check cooldowns
    if (cmd?.cooldown && !client.config.OWNER.includes(interaction.user.id)) {
      const { cooldowns } = client;

      if (!cooldowns.has(cmd.data.name)) {
        cooldowns.set(cmd.data.name, new Collection());
      }

      const now = Date.now();
      const timestamps = cooldowns.get(cmd.data.name);
      const cooldownAmount = cmd.cooldown * 1000;

      if (timestamps?.has(interaction.user.id)) {
        const expirationTime = (timestamps.get(interaction.user.id) as number) + cooldownAmount;

        if (now < expirationTime) {
          const expiredTimestamp = Math.round(expirationTime / 1000);
          return await interaction.reply({
            content: `Please wait, you are on a cooldown for </${interaction.commandName}:${interaction.commandId}>. You can use it again <t:${expiredTimestamp}:R>.`,
            ephemeral: true,
          });
        }
      }

      timestamps?.set(interaction.user.id, now);
      setTimeout(() => timestamps?.delete(interaction.user.id), cooldownAmount);
    }

    try {
      await cmd.execute(interaction, client);
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
            value: `${interaction.inGuild() ? interaction.guild?.name || "Possibly as an User App" : "In DMs"} \`[${interaction.guild?.id}]\``,
          },
          {
            name: `Channel`,
            value: `${interaction.inGuild() ? interaction.channel?.name || "Possibly as an User App" : "In DMs"} \`[${interaction.channel?.id}]\``,
          },
        )
        .setColor("Blurple")
        .setTimestamp();

      // Slash Commands
      if (cLogger && !client.config.OWNER.includes(interaction.user.id) && process.env.COMMANDS_USED) {
        cLogger.send({ username: "Command Logs", embeds: [embed] }).catch(() => {});
      }
    } catch (err) {
      client.logger.error(err);
      if (interaction.replied || interaction.deferred) {
        return await interaction.followUp({
          embeds: [errorEmbed],
          components: [errorBtn],
        });
      } else {
        return await interaction.reply({
          embeds: [errorEmbed],
          components: [errorBtn],
          ephemeral: true,
        });
      }
    }
  }
};
