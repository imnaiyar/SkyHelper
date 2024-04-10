import { SkyHelper } from "#src/structures";
import {
  EmbedBuilder,
  GuildChannelResolvable,
  Message,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  GuildBasedChannel,
  WebhookClient,
} from "discord.js";
import { Flags } from "#libs/classes/Flags";
import { parsePerms } from "skyhelper-utils";

const Logger = process.env.COMMANDS_USED ? new WebhookClient({ url: process.env.COMMANDS_USED }) : undefined;

/** Message Handler */
export default async (client: SkyHelper, message: Message): Promise<void> => {
  if (message.author.bot) return;
  if (message.content.startsWith(`<@!${client.user.id}>`)) {
    await message.channel.send("That's me...");
    return;
  }
  const prefix = client.config.PREFIX;
  if (!message.content.startsWith(prefix)) return;
  const flags = new Flags(message.content);
  const msg = flags.removeFlags();
  const args = msg.slice(prefix.length).trim().split(/ +/g);
  const commandName = args.shift()!.toLowerCase();
  const command = client.prefix.get(commandName);
  if (!command) return;

  // Check if command is 'OWNER' only.
  if (command.data.category && command.data.category === "OWNER" && !client.config.OWNER.includes(message.author.id)) return;

  // Check send permission(s);
  if (
    message.guild &&
    !message.guild.members.me?.permissionsIn(message.channel as GuildChannelResolvable).has(["SendMessages", "ViewChannel"])
  ) {
    message.author
      .send(
        `Hi, It seems you tried to use my command in a channel/server where I don't have ${parsePerms("SendMessages")}/${parsePerms("ViewChannel")}. Please ask a server admin to grant me necessary permissions before trying to use my commands.\n\nFrom :-\n- Server: ${message.guild.name}\n- Channel: ${message.channel}\n- Command Used: \` ${command.data.name} \``,
      )
      .catch(() => {});
    return;
  }

  // Check if the user has permissions to use the command.
  if (message.guild && command.data.userPermissions && !message.member?.permissions.has(command.data.userPermissions)) {
    await message.reply(`You need ${parsePerms(command.data.userPermissions)} to use this command`);
    return;
  }

  // Check if args are valid
  if (command.data.args && command.data.args.required) {
    if (args.length === 0) {
      await message.reply(`You didn't provide any arguments, ${message.author}!`);
      return;
    }

    if (!command.data.args.args.find((arg) => arg.trigger === args[0])) {
      message.reply({
        content: "Invalid Arguments!",
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
    await command.execute(message, args, client);

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
    client.logger.error(error);
    const embed = new EmbedBuilder().setTitle(`ERROR`).setDescription(`An error occurred while executing this command.`);

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setLabel("Report Bug").setCustomId("error_report").setStyle(ButtonStyle.Secondary),
    );
    await message.reply({
      embeds: [embed],
      components: [actionRow],
    });
  }
};
