const { WebhookClient, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { OWNER } = require("@root/config.js");
const Log = require("@src/logger");
const { parsePerm } = require("@functions");
const Logger = process.env.COMMANDS_USED ? new WebhookClient({ url: process.env.COMMANDS_USED }) : undefined;

/**
 * messageCreate event handler
 * @param {import('@src/structures').SkyHelper} client
 * @param {import('discord.js').msg} msg
 */
module.exports = async (client, msg) => {
  if (msg.author.bot) return;

  if (msg.mentions.has(client.user) && msg.channel.permissionsFor(client.user.id).has("SendMessages")) {
    msg.channel.send("That's me...");
  }

  // Check Bot'sprefix
  const prefix = ",";
  if (!msg.content.startsWith(prefix)) return;

  // Initialize the commands
  const flagRegex = /--([a-zA-Z0-9_-]+)/g;
  const flags = [];
  let match;
  while ((match = flagRegex.exec(msg.content)) !== null) {
    flags.push(match[1]);
  }

  // Remove flags from the msg content
  const message = msg.content.replace(flagRegex, "").trim();
  const args = message.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift();
  const command = client.prefix.get(commandName);
  // Return if command is not found
  if (!command) {
    return;
  }

  // Check if command is 'OWNER' only.
  if (command.data.category && command.data.category === "OWNER" && !OWNER.includes(msg.author.id)) return;

  // Check if the bot has Send msg permission
  if (msg.guild && !msg.guild.members.me.permissionsIn(msg.channel).has("SendMessages")) {
    msg.author.send(
      `Hi, It seems you tried to use my command in a channel/server where I don't have ${parsePerm(
        "SendMessages",
      )}. Please ask a server admin to grant me necessary permissions before trying to use my commands.\n\nFrom :-\n- Server: ${
        msg.guild.name
      }\n- Channel: ${msg.channel}\n- Command Used: \` ${command.data.name} \``,
    );
    return;
  }

  // Check if the user has permissions to use the command.
  if (msg.guild && command.data.userPermissions && !msg.member.permissions.has(command.data.userPermissions)) {
    return msg.reply(`You need ${parsePerm(command.data.userPermissions)} to use this command`);
  }

  // Check if args are valid
  if (command.data.args && command.data.args.required) {
    if (args.length === 0) {
      return msg.reply(`You didn't provide any arguments, ${msg.author}!`);
    }
    if (!command.data.args.args.include(args[0])) {
      return msg.reply(
        `Invalid arguments, Valid args are ${command.data.args.args.map((arg) => `\`${arg}\``).join(", ")}!`,
      );
    }
  }

  // Check if command has flags defined and flags were provided
  if (command.data.flags && flags.length > 0) {
    const invalidFlags = flags.filter((flag) => !command.data.flags.includes(flag));

    if (invalidFlags.length > 0) {
      return msg.reply(
        `[${invalidFlags
          .map((flag) => `\`${flag}\``)
          .join(", ")}] Flag(s) is Invalid. Valid flags are [${command.data.flags
          .map((flag) => `\`${flag}\``)
          .join(", ")}]`,
      );
    }
  }

  // ...

  // Execute the command.
  try {
    await command.execute(msg, args, client, flags);

    // Send Logs
    const embed = new EmbedBuilder()
      .setTitle("New command used")
      .addFields(
        { name: `Command`, value: `\`${command.data.name}\`` },
        {
          name: `User`,
          value: `${msg.author.username} \`[${msg.author.id}]\``,
        },
        {
          name: `Server`,
          value: `${msg.guild?.name} \`[${msg.guild?.id}]\``,
        },
        {
          name: `Channel`,
          value: `${msg.channel?.name} \`[${msg.channel?.id}]\``,
        },
      )
      .setColor("Blurple")
      .setTimestamp();
    if (!OWNER.includes(msg.author.id) && Logger) {
      Logger.send({ username: "Command Logs", embeds: [embed] }).catch((ex) => {});
    }
  } catch (error) {
    Log.error(error);
    const embed = new EmbedBuilder()
      .setTitle(`ERROR`)
      .setDescription(`An error occurred while executing this command.`);

    const actionRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel("Report Bug").setCustomId("error_report").setStyle(ButtonStyle.Secondary),
    );
    await msg.reply({
      embeds: [embed],
      components: [actionRow],
      ephemeral: true,
    });
  }
};
