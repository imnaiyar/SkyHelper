const { GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { getSettings } = require("@schemas/Guild");

async function helpMenu(interaction, client) {
    const slash = client.commands
    const prefix = client.prefix
  
    const input = interaction.options.getString('command');
    const slashCommands = client.commands.get(input)
    const appCommands = await client.application.commands.fetch()
if (input && !slashCommands) {
  return interaction.reply({ content: 'No such commands are found', ephemeral: true})
} else if (input) {
  const appC = await appCommands.find( c => c.name === input)
  const embed = new EmbedBuilder()
   .setAuthor({ name: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
   .setFooter({ text: 'SkyBot', iconURL: client.user.displayAvatarURL()
   })
     .setDescription(slashCommands.data.description)
     .setTitle(`</${appC.name}:${appC.id}>`);
     
     if (slashCommands.data?.longDesc) {
       embed.addFields({
         name: 'Description',
         value: slashCommands.data.longDesc
       })
     }
     const { options } = appC
     if (options && options.length > 0) {
    const optionNames = options.map(option => {

      const optionLabel = option.required ? `\`<${option.name}>\`` : `\`[${option.name}]\``;
      return optionLabel;
    });

    embed.addFields({
      name: 'Options',
      value:`${optionNames.join(', ')}\n\n`})
    }
   const reply = await interaction.reply({ embeds: [embed]})
     
     setTimeout(() => {
  reply.delete().catch(console.error);
}, 3000);

     return;
}
  const embed = new EmbedBuilder()
    .setAuthor({ name: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
    .setTimestamp(Date.now())
    .setColor('#000000')
    .setFooter({ text: 'SkyBot', iconURL: client.user.displayAvatarURL() })
    .setDescription(`SkyBot is a discord bot for the game [Sky: Children of the Light](https://www.thatskygame.com/).\n It is designed to provide you easy access to in-game information. \n\n To learn about all the commands, use the select menu.\n\n**Useful Links**\n[TopGG](https://top.gg/bot/1121541967730450574) • [Our Website](http://130.61.174.212:8519/) • [SkyWiki](https://sky-children-of-the-light.fandom.com/wiki/Sky:_Children_of_the_Light_Wiki) • [Sky Shards Tracker](https://sky-shards.pages.dev) • [Sky official server](http://discord.gg/thatskygame)`);

  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('commands-help')
      .setPlaceholder('Select for details')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Slash Commands')
          .setDescription('Details about all the slash commands available.')
          .setValue('slash')
          .setEmoji('<:slash:1140102899750420620>'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Prefix Commands')
          .setDescription('Details about all the Prefix commands in the bot.')
          .setValue('prefix')
          .setEmoji('<:prefix:1140103340643078144>'),
      )
  );

  const reply = await interaction.reply({ embeds: [embed], components: [row] });


  const filter = (i) => i.customId === 'commands-help' && i.isStringSelectMenu();
  const collector = interaction.channel.createMessageComponentCollector({ filter, idle: 60 * 1000 });

  collector.on('collect', async (selectInteraction) => {
    const selectedChoice = selectInteraction.values[0];
    if (selectedChoice === 'slash') {
      const slashEmbed = new EmbedBuilder()
        .setAuthor({ name: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
        .setDescription(`List of all Slash commands.`)
        .setColor('#000000')
        .setFooter({ text: 'run /help <command> for details.', iconURL:client.user.displayAvatarURL()});
        let description = '';

        appCommands.forEach((command) => {
    if (!command.name.startsWith('z-')) {
      description += `</${command.name}:${command.id}>\n${command.description}\n\n`;
        }
     });

  slashEmbed.setDescription(description);
      await selectInteraction.update({ embeds: [slashEmbed] });
    } else if (selectedChoice === 'prefix') {
      const settings = await getSettings(interaction.guild);
      const prefixEmbed = new EmbedBuilder()
        .setAuthor({ name: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
        .setDescription(`List of all Prefix commands.`)
        .setColor('#000000')
        .setFooter({ text: 'SkyBot', iconURL: client.user.displayAvatarURL() });
        let description = '';
        prefix.forEach((command) => {
      if (command.category !== 'OWNER') {
      description += `${command.name}\n${command.description}\n\n`;
      }
     });
     prefixEmbed.setDescription(description);
      await selectInteraction.update({ embeds: [prefixEmbed] });
    }
  });

  collector.on('end', (collected, reason) => {
    const embed = new EmbedBuilder()
    .setAuthor({ name:'Idle Timeout.'})
    .setDescription(`Help menu has expired, run the command </help:1147244751708491898> again.`)
    .setFooter({ text: 'SkyBot', iconURL: client.user.displayAvatarURL() })
    reply.edit({ embeds: [embed], components: []})
  });

}

module.exports = {helpMenu}