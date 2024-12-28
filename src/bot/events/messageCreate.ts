import type { Event } from "#structures";
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, WebhookClient, ChannelType } from "discord.js";
import { Flags } from "#libs/classes/Flags";
import updateDailyQuests from "#handlers/updateDailyQuests";
import * as Sentry from "@sentry/node";
import { validateMessage } from "#bot/utils/validators";
import moment from "moment-timezone";

const Logger = process.env.COMMANDS_USED ? new WebhookClient({ url: process.env.COMMANDS_USED }) : undefined;

/** Message Handler */
const messageHandler: Event<"messageCreate"> = async (client, message): Promise<void> => {
  const scope = new Sentry.Scope();
  scope.setUser({ id: message.author.id, username: message.author.username });
  const context = {
    guild: message.guild ? { id: message.guildId, name: message.guild.name, owner: message.guild.ownerId } : message.guildId,
    channel: message.channel
      ? {
          id: message.channelId,
          type: ChannelType[message.channel.type],
          name: "name" in message.channel ? message.channel.name : null,
        }
      : message.channelId,
    message: {
      id: message.id,
      content: message.content,
      command: "", // To be added later
    },
    author: {
      id: message.author.id,
      username: message.author.username,
      displayName: message.author.displayName,
    },
    occurenceTime: moment.tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
  };
  // Add some contexts
  // Handle daily guides parsing
  if (message.channelId === client.config.QUEST_UPDATE_CHANNEL.CHANNEL_ID) {
    updateDailyQuests(message);
  }

  if (message.author.bot) return;
  const t = await message.t();
  // Check for bot's mention
  if (message.content.startsWith(`<@!${client.user.id}>`)) {
    await message.channel.send(t("common:bot.intro"));
    return;
  }
  const settings = message.inGuild() ? await client.database.getSettings(message.guild) : null;
  // Prefix
  const prefix = (settings ? settings.prefix || null : null) || client.config.PREFIX;
  if (!message.content.startsWith(prefix)) return;

  // Flags
  const flags = new Flags(message.content);
  const msg = flags.removeFlags();
  const args = msg.slice(prefix.length).trim().split(/ +/g);
  const commandName = args.shift()!.toLowerCase();
  const command = client.commands.get(commandName) || client.commands.find((cmd) => cmd.prefix?.aliases?.includes(commandName));
  if (!command || !command.messageRun) return;

  context["message"]["command"] = command.name;

  scope.setExtra("command", command.name);
  // Check if command is 'OWNER' only.
  if (command.ownerOnly && !client.config.OWNER.includes(message.author.id)) return;

  const validation = validateMessage(command, message, args, prefix, flags, t);
  if (!validation.status) {
    if (validation.message) {
      await message.reply(validation.message);
    }
    return;
  }

  // Execute the command.
  try {
    await command.messageRun({ message, args, flags, client, t });

    // Send Logs
    const embed = new EmbedBuilder()
      .setTitle("New command used")
      .addFields(
        { name: `Command`, value: `\`${command.name}\`` },
        {
          name: `User`,
          value: `${message.author.username} \`[${message.author.id}]\``,
        },
        {
          name: `Server`,
          value: `${message.guild?.name} \`[${message.guild?.id}]\``,
        },
        {
          name: `Channel`,
          value: `${message.inGuild() ? message.channel.name : "In DMS"} \`[${message.channel.id}]\``,
        },
      )
      .setColor("Blurple")
      .setTimestamp();
    if (!client.config.OWNER.includes(message.author.id) && Logger) {
      Logger.send({ username: "Command Logs", embeds: [embed] }).catch(() => {});
    }
  } catch (error) {
    scope.setContext("Metadata", context);

    const id = client.logger.error(error, scope);
    const content = { content: t("errors:ERROR_ID", { ID: id }) };
    const embed = new EmbedBuilder().setTitle(t("errors:EMBED_TITLE")).setDescription(t("errors:EMBED_DESCRIPTION"));

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setLabel(t("errors:BUTTON_LABEL")).setCustomId(`error-report_${id}`).setStyle(ButtonStyle.Secondary),
    );
    await message.reply({
      ...content,
      embeds: [embed],
      components: [actionRow],
    });
  }
};

export default messageHandler;
