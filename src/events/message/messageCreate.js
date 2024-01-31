const {
  WebhookClient,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { OWNER } = require('@root/config.js');
const Log = require('@src/logger');
const { parsePerm } = require('@functions');
const Logger = process.env.COMMANDS_USED
  ? new WebhookClient({ url: process.env.COMMANDS_USED })
  : undefined;

module.exports = async (client, message) => {
  if (message.author.bot) return;

  if (message.mentions.has(client.user) && !OWNER.includes(message.author.id)) {
    message.channel.send("That's me...");
  }

  // Check Bot'sprefix
  let prefix;
  if (message.content.startsWith(`<@${client.user.id}>`)) {
    prefix = `<@${client.user.id}>`;
  } else if (message.content.startsWith(`.`)) {
    prefix = '.';
  } else {
    return;
  }

  // Initialize the commands
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift();
  const command = client.prefix.get(commandName);
  // Return if command is not found
  if (!command) {
    return;
  }

  // Check if command is 'OWNER' only.
  if (
    command.data.category &&
    command.data.category === 'OWNER' &&
    !OWNER.includes(message.author.id)
  )
    return;

  // Check if the bot has Send Message permission
  if (
    message.guild &&
    !message.guild.members.me.permissionsIn(message.channel).has('SendMessages')
  ) {
    message.author.send(
      `Hi, It seems you tried to use my command in a channel/server where I don't have ${parsePerm(
        'SendMessages',
      )}. Please ask a server admin to grant me necessary permissions before trying to use my commands.\n\nFrom :-\n- Server: ${
        message.guild.name
      }\n- Channel: ${message.channel}\n- Command Used: \` ${
        command.data.name
      } \``,
    );
    return;
  }

  // Check if the user has permissions to use the command.
  if (
    message.guild &&
    command.data.userPermissions &&
    !message.member.permissions.has(command.data.userPermissions)
  ) {
    return message.reply(
      `You need ${parsePerm(command.data.userPermissions)} to use this command`,
    );
  }

  // Execute the command.
  try {
    await command.execute(message, args, client);

    // Send Logs
    const embed = new EmbedBuilder()
      .setTitle('New command used')
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
          value: `${message.channel?.name} \`[${message.channel?.id}]\``,
        },
      )
      .setColor('Blurple')
      .setTimestamp();
    if (!OWNER.includes(message.author.id)) {
      Logger.send({ username: 'Command Logs', embeds: [embed] }).catch(
        (ex) => {},
      );
    }
  } catch (error) {
    Log.error(error);
    const embed = new EmbedBuilder()
      .setTitle(`ERROR`)
      .setDescription(`An error occurred while executing this command.`);

    const actionRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Report Bug')
        .setCustomId('error_report')
        .setStyle(ButtonStyle.Secondary),
    );
    await message.reply({
      embeds: [embed],
      components: [actionRow],
      ephemeral: true,
    });
  }
};
