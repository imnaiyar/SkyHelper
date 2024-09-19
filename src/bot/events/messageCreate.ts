import type { Event } from "#structures";
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, WebhookClient, resolveColor, Collection } from "discord.js";
import { Flags } from "#libs/classes/Flags";
import { parsePerms, type Permission } from "skyhelper-utils";
import updateDailyQuests from "#handlers/updateDailyQuests";

const Logger = process.env.COMMANDS_USED ? new WebhookClient({ url: process.env.COMMANDS_USED }) : undefined;

/** Message Handler */
const messageHandler: Event<"messageCreate"> = async (client, message): Promise<void> => {
  // Handle daily guides parsing
  if (message.channelId === client.config.QUEST_UPDATE_CHANNEL.CHANNEL_ID) {
    updateDailyQuests(message);
  }

  if (message.author.bot) return;
  const t = await message.t();
  // Check for bot's mention
  if (message.content.startsWith(`<@!${client.user.id}>`)) {
    await message.channel.send(t("common.bot.intro"));
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

  // Check if command is 'OWNER' only.
  if (command.ownerOnly && !client.config.OWNER.includes(message.author.id)) return;

  // Check send permission(s);
  if (message.inGuild() && !message.guild.members.me?.permissionsIn(message.channel).has(["SendMessages", "ViewChannel"])) {
    message.author
      .send(
        t("common.errors.MESSAGE_BOT_NO_PERM", {
          PERMISSIONS: `${parsePerms("SendMessages")}/${parsePerms("ViewChannel")}`,
          SERVER: message.guild.name,
          CHANNEL: message.channel,
          COMMAND: command.name,
        }),
      )
      .catch(() => {});
    return;
  }
  if (command.prefix?.guildOnly && !message.inGuild()) return;

  // Check if the user has permissions to use the command.
  if (message.guild && command.userPermissions && !message.member?.permissions.has(command.userPermissions)) {
    await message.reply(
      t("common.errors.NO_PERMS_USER", {
        PERMISSIONS: parsePerms(command.userPermissions as Permission[]),
      }),
    );
    return;
  }
  // Check if args are valid
  if (
    (command.prefix?.minimumArgs && args.length < command.prefix.minimumArgs) ||
    (command.prefix?.subcommands && args[0] && !command.prefix.subcommands.find((sub) => sub.trigger.startsWith(args[0])))
  ) {
    await message.reply({
      ...(args.length < (command.prefix.minimumArgs || 0) && {
        content: t("common.errors.MINIMUM_ARGS", { LIMIT: command.prefix.minimumArgs }),
      }),

      embeds: [
        {
          title: t("common.errors.INVALID_USAGE"),
          description:
            (command.prefix.usage ? `Usage:\n**\`${prefix}${command.name} ${command.prefix.usage}\`**\n\n` : "") +
            (command.prefix.subcommands
              ? "**Subcommands:**\n" +
                command.prefix.subcommands
                  .map((sub) => `**\`${prefix}${command.name} ${sub.trigger}\`**\n ↪ ${sub.description}`)
                  .join("\n")
              : ""),
          author: {
            name: `${command.name} Command`,
            icon_url: client.user.displayAvatarURL(),
          },
          color: resolveColor("Random"),
        },
      ],
    });
    return;
  }

  // Check for validations
  if (command.validations?.length) {
    for (const validation of command.validations) {
      if (!validation.callback(message, { args, flags, commandName: command.name })) {
        await message.reply(validation.message);
        return;
      }
    }
  }

  // Check cooldowns
  if (command?.cooldown && !client.config.OWNER.includes(message.author.id)) {
    const { cooldowns } = client;

    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = command.cooldown * 1000;

    if (timestamps?.has(message.author.id)) {
      const expirationTime = (timestamps.get(message.author.id) as number) + cooldownAmount;

      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1000);
        await message.reply({
          content: t("common.errors.COOLDOWN", {
            COMMAND: command.name,
            TIME: `<t:${expiredTimestamp}:R>`,
          }),
        });
        return;
      }
    }

    timestamps?.set(message.author.id, now);
    setTimeout(() => timestamps?.delete(message.author.id), cooldownAmount);
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
    const id = client.logger.error(error);
    const content = { content: t("common.errors.ERROR_ID", { ID: id }) };
    const embed = new EmbedBuilder()
      .setTitle(t("common.errors.EMBED_TITLE"))
      .setDescription(t("common.errors.EMBED_DESCRIPTION"));

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel(t("common.errors.BUTTON_LABEL"))
        .setCustomId(`error-report_${id}`)
        .setStyle(ButtonStyle.Secondary),
    );
    await message.reply({
      ...content,
      embeds: [embed],
      components: [actionRow],
    });
  }
};

export default messageHandler;
