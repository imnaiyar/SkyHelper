const { WebhookClient, EmbedBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder } = require("discord.js");
const {shardInfos} = require('@shards/aboutShards')
const {shardLocation} = require('@shards/shardsLocation')
const {shardTimeline} = require('@shards/shardsTimeline')
const {parsePerm} = require('@handler/functions/parsePerm')
const config = require('@root/config')
const Log = require('@src/logger');
const cLogger = process.env.COMMANDS_USED ? new WebhookClient({ url: process.env.COMMANDS_USED }) : undefined;
const bLogger = process.env.BUG_REPORTS ? new WebhookClient({ url: process.env.BUG_REPORTS }) : undefined;
const {ErrorForm} = require('@handler/functions/errorForm')
const { nextPrev } = require('@shards/sub/scrollFunc')

/**
 * @param {import('discord.js').Interaction} interaction
 */


module.exports = async (client, interaction) => {
  if (interaction.isChatInputCommand()){
    // Chat Input
    if (!interaction.isCommand()) return;
    
    const commandName = interaction.commandName;
    const command = client.commands.get(commandName);

    // If command is owner only.
    if (command.data.category && command.data.category === 'OWNER' && !OWNER.includes(message.author.id)) return;

    // Check if the user has permissions to use the command.
    if (command.data?.userPermissions && !interaction.member.permissions.has(command.data.userPermissions)) {
     return interaction.reply({content: `You need ${parsePerm(command.data.userPermissions)} to use this command`, ephemeral: true})
    }
  try {
    await command.execute(interaction, client);
    const embed = new EmbedBuilder()
    .setTitle("New command used")
    .addFields(
      { name: `Command`, value: `\`${interaction}\`` },
      { name: `User`, value: `${interaction.user.username} \`[${interaction.user.id}]\`` },
      { name: `Server`, value: `${interaction.guild?.name} \`[${interaction.guild?.id}]\`` },
      { name: `Channel`, value: `${interaction.channel?.name} \`[${interaction.channel?.id}]\`` }
    )
    .setColor('Blurple')
    .setTimestamp();

  // Slash Commands
  if (interaction.isChatInputCommand() && !interaction.user.id.includes(config.OWNER)) {
    cLogger.send({ username: "Command Logs", embeds: [embed] }).catch((ex) => {});
  }
  } catch (error) {
    Log.error(error);
    const embed = new EmbedBuilder()
    .setTitle(`ERROR`)
    .setDescription(`An error occurred while executing this command.`);
    
    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel('Report Bug')
                .setCustomId('error_report')
                .setStyle(ButtonStyle.Secondary));
    await interaction.reply({ embeds: [embed], components: [actionRow], ephemeral: true });
  }}
   // Select Menus

  // Buttons
  if (interaction.isButton()) {
    const Art = await client.users.fetch('504605855539265537');
    const Zhii = await client.users.fetch('650487047160725508');
    const Gale = await client.users.fetch('473761854175576075');
    const Clement = await client.users.fetch('693802004018888714');
    const Christian = await client.users.fetch('594485678625128466');

    
  if (interaction.customId === 'error_report') {
    await ErrorForm(interaction)
  }
    if (interaction.customId === 'next' || interaction.customId === 'prev') {
    const value = interaction.customId
    await nextPrev(interaction, value)
  }
if (interaction.customId === 'shard_timeline' || 'shard_left' || 'shard_right' || 'shard_original') {
  shardTimeline(interaction, Zhii, Christian);
}
if (interaction.customId === 'shard_location' || 'shard_leftL' || 'shard_rightL' || 'shard_originalL') {
  shardLocation(interaction, Gale, Clement);
}
if (interaction.customId === 'about_shard' || 'left_about' || 'right_about' || 'original_about') {
  shardInfos(interaction, Art);
}
}
// Modals
if (interaction.isModalSubmit()) {
  if (interaction.customId === 'errorModal') {
    await interaction.reply({ content: 'Your submission was received successfully!', ephemeral: true});
    const commandUsed = interaction.fields.getTextInputValue('commandUsed');
    const whatHappened = interaction.fields.getTextInputValue('whatHappened');
    const embed = new EmbedBuilder()
    .setTitle("BUG REPORT")
    .addFields(
      { name: `Command Used`, value: `\`${commandUsed}\`` },
      { name: `User`, value: `${interaction.user.username} \`[${interaction.member.id}]\`` },
      { name: `Server`, value: `${interaction.guild.name} \`[${interaction.guild.id}]\`` },
      { name: `What Happened`, value: `${whatHappened}` }
    )
    .setColor('Blurple')
    .setTimestamp();
    bLogger.send({ username: "Bug Report", embeds: [embed] }).catch((ex) => {});
  }
}
}