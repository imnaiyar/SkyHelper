import type { Event } from "#structures";
import {
  EmbedBuilder,
  type GuildChannelResolvable,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type GuildBasedChannel,
  WebhookClient,
} from "discord.js";
import { Flags } from "#libs/classes/Flags";
import { parsePerms } from "skyhelper-utils";
import updateDailyQuests from "#handlers/updateDailyQuests";

const Logger = process.env.COMMANDS_USED ? new WebhookClient({ url: process.env.COMMANDS_USED }) : undefined;

/** Message Handler */
const messageHandler: Event<"messageCreate"> = async (client, message): Promise<void> => {
  // Handle daily guides parsing
  if (message.channelId === "1261417856889786449") {
    updateDailyQuests(message);
  }

  if (message.author.bot) return;
  const t = await message.t();
  // Check for bot's mention
  if (message.content.startsWith(`<@!${client.user.id}>`)) {
    await message.channel.send(t("common.bot.intro"));
    return;
  }
  // Prefix
  const prefix = client.config.PREFIX;
  if (!message.content.startsWith(prefix)) return;

  // Flags
  const flags = new Flags(message.content);
  const msg = flags.removeFlags();
  const args = msg.slice(prefix.length).trim().split(/ +/g);
  const commandName = args.shift()!.toLowerCase();
  const command = client.prefix.get(commandName);
  if (!command) return;

  // Check if command is 'OWNER' only.
  if (command.data.ownerOnly && !client.config.OWNER.includes(message.author.id)) return;

  // Check send permission(s);
  if (
    message.guild &&
    !message.guild.members.me?.permissionsIn(message.channel as GuildChannelResolvable).has(["SendMessages", "ViewChannel"])
  ) {
    message.author
      .send(
        t("common.errors.MESSAGE_BOT_NO_PERM", {
          PERMISSIONS: `${parsePerms("SendMessages")}/${parsePerms("ViewChannel")}`,
          SERVER: message.guild.name,
          CHANNEL: message.channel,
          COMMAND: command.data.name,
        }),
      )
      .catch(() => {});
    return;
  }

  // Check if the user has permissions to use the command.
  if (message.guild && command.data.userPermissions && !message.member?.permissions.has(command.data.userPermissions)) {
    await message.reply(
      t("common.errors.NO_PERMS_USER", {
        PERMISSIONS: parsePerms(command.data.userPermissions),
      }),
    );
    return;
  }

  // Check if args are valid
  if (command.data.args && command.data.args.required) {
    if (args.length === 0) {
      await message.reply(
        t("common.errors.MESSAGE_NO_ARGS", {
          ARGS: command.data.args.args.map((arg) => `\`${arg}\``).join(", "),
        }),
      );
      return;
    }

    if (!command.data.args.args.find((arg) => arg.trigger === args[0])) {
      message.reply({
        content: t("common.errors.INVALID_ARGS"),
        embeds: [
          new EmbedBuilder()
            .setAuthor({ name: `${command.data.name} Command`, iconURL: client.user.displayAvatarURL() })
            .setTitle(`${command.data.name} Args`)
            .setDescription(command.data.args.args.map((arg) => `**${prefix}${arg.trigger}\n ↪ ${arg.description}`).join("\n"))
            .setColor("Random"),
        ],
      });
      return;
    }
  }

  // Check for validations
  if (command.validations?.length) {
    for (const validation of command.validations) {
      if (!validation.callback(message)) {
        await message.reply(validation.message);
        return;
      }
    }
  }

  // Execute the command.
  try {
    await command.execute({ message, args, flags, client });

    // Send Logs
    const embed = new EmbedBuilder()
      .setTitle("New command used")
      .addFields(
        { name: `Command`, value: `\`${command.data.name}\`` },
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
          value: `${(message.channel as GuildBasedChannel).name} \`[${message.channel?.id}]\``,
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
