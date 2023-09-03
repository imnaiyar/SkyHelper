const { WebhookClient, EmbedBuilder, Collection, } = require("discord.js");
const {client} = require('@root/main')
const fs = require('fs');
const path = require('path');
const {guideButton} = require('@guides/GuideOption')
const {helpButton} = require('@handler/help')
const Logger = process.env.COMMANDS_USED ? new WebhookClient({ url: process.env.COMMANDS_USED }) : undefined;

client.commands = new Collection();


const commandDirectory = path.join(__dirname, '../../commands/slash');
const commandFiles = fs.readdirSync(commandDirectory).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`@src/commands/slash/${file}`);
  client.commands.set(command.data.name, command);
}
client.on
   ('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;
    
    const commandName = interaction.commandName;
    
    const command = client.commands.get(commandName);

  try {
    const embed = new EmbedBuilder()
    .setTitle("New command used")
    .addFields(
      { name: `Command`, value: `\`${interaction}\`` },
      { name: `User`, value: `${interaction.user.username} \`[${interaction.member.id}]\`` },
      { name: `Server`, value: `${interaction.guild.name} \`[${interaction.guild.id}]\`` },
      { name: `Channel`, value: `${interaction.channel.name} \`[${interaction.channel.id}]\`` }
    )
    .setColor('Blurple')
    .setTimestamp();

  // Slash Commands
  if (interaction.isChatInputCommand()) {
    Logger.send({ username: "Command Logs", embeds: [embed] }).catch((ex) => {});
  }
    await command.execute(interaction, client);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'An error occurred while executing this command.', ephemeral: true });
  }
   }
   )

   client.on
   ('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;
    await guideButton(interaction)
    await helpButton(interaction, client)

   })