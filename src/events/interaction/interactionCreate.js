const { WebhookClient, EmbedBuilder, Collection, } = require("discord.js");
const fs = require('fs');
const path = require('path');
const {guideButton} = require('@guides/GuideOption')
const {helpButton} = require('@handler/help')
const Logger = process.env.COMMANDS_USED ? new WebhookClient({ url: process.env.COMMANDS_USED }) : undefined;

slash = new Collection();


const commandDirectory = path.join(__dirname, '../../commands/slash');
const commandFiles = fs.readdirSync(commandDirectory).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`../../commands/slash/${file}`);
  slash.set(command.data.name, command);
}
/**
 * @param {import('@root/main')} client
 * @param {import('discord.js').Interaction} interaction
 */
module.exports = async (client, interaction) => {
  if (interaction.isChatInputCommand()){
    if (!interaction.isCommand()) return;
    
    const commandName = interaction.commandName;
    
    const command = slash.get(commandName);

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
  }}
   
    if (!interaction.isStringSelectMenu()) return;
    await guideButton(interaction)
    await helpButton(interaction, client)

   }