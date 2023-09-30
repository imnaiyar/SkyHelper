const { GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder } = require('discord.js');
const { getSettings } = require("@schemas/Guild");
const config = require('@root/config');

async function helpMenu(interaction, client) {
    const slash = client.commands;
    const prefix = client.prefix;
    
    const settings = await getSettings(interaction.guild);
    const guildPrefix = settings?.prefix || process.env.BOT_PREFIX;
    
    const input = interaction.options.getString('command');
    const Command = slash?.get(input) || prefix?.get(input);
    const appCommands = await client.application.commands.fetch();
if (input && !Command) {
  return interaction.reply({ content: 'No such commands are found', ephemeral: true});
} else if (input) {
  if ( Command.data.category && Command.data.category === 'OWNER') {
    return interaction.reply({ content: `No such commands are found`, ephemeral: true});
  }
  const appC = await appCommands.find( c => c.name === input);
  let cName;
  if (appC) {
    cName = `</${appC.name}:${appC.id}>`;
  } else {
    cName = `${guildPrefix}${Command.data.name}`;
  }
  const embed = new EmbedBuilder()
   .setAuthor({ name: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
   .setFooter({ text: 'SkyHelper', iconURL: client.user.displayAvatarURL()
   })
     .setDescription(Command.data.description)
     .setTitle(cName);
     
     if (Command.data?.longDesc) {
       embed.addFields({
         name: 'Description',
         value: Command.data.longDesc
       });
     }
     
   const reply = await interaction.reply({ embeds: [embed], ephemeral: true});
     
     return;
}
  const embed = new EmbedBuilder()
    .setAuthor({ name: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
    .setTimestamp(Date.now())
    .setColor('Gold')
    .setFooter({ text: 'SkyHelper', iconURL: client.user.displayAvatarURL() })
    .setDescription(`SkyHelper is a versatile Discord bot designed to enhance the [Sky: Children of the Light](https://thatskygame.com) gaming experience. It provides a wide range of useful information to help players navigate the enchanting world of Sky. \n\n To learn about all the commands, use the select menu.\n\n**Useful Links**\n[TopGG](https://top.gg/bot/1121541967730450574) • [Our Website](${config.WEB_URL}) • [SkyWiki](https://sky-children-of-the-light.fandom.com/wiki/Sky:_Children_of_the_Light_Wiki) • [Sky Shards Tracker](https://sky-shards.pages.dev) • [Sky official server](http://discord.gg/thatskygame)`);

  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('commands-help')
      .setPlaceholder('Select for details')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('Slash Commands')
          .setDescription('Details about all available slash commands.')
          .setValue('slash')
          .setEmoji('<:slash:1140102899750420620>'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Prefix Commands')
          .setDescription('Details about all the Prefix commands in the bot.')
          .setValue('prefix')
          .setEmoji('<:prefix:1140103340643078144>'),
      )
  );
const hmBtn = new ActionRowBuilder()
       .addComponents(
         new ButtonBuilder()
         .setLabel('🏠')
         .setCustomId('homeBtn')
         .setStyle(4)
         );

  const reply = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });


  const filter = (i) => i.message.id === reply.id;
  const collector = reply.createMessageComponentCollector({ filter, idle: 60 * 1000 });

  collector.on('collect', async (selectInteraction) => {
    let selectedChoice;
    if (selectInteraction?.values) {
    selectedChoice = selectInteraction.values[0];
    } else {
      selectedChoice = selectInteraction.customId;
    }
    if (selectedChoice === 'slash') {
      const slashEmbed = new EmbedBuilder()
        .setAuthor({ name: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
        .setDescription(`List of all Slash commands.`)
        .setColor('Gold')
        .setFooter({ text: 'run /help <command> for details.', iconURL:client.user.displayAvatarURL()});
        let description = '';

        appCommands.forEach((command) => {
      description += `</${command.name}:${command.id}>\n${command.description}\n\n`;
        });

  slashEmbed.setDescription(description);
      await selectInteraction.update({ embeds: [slashEmbed], components: [row, hmBtn] });
    } else if (selectedChoice === 'prefix') {
      const prefixEmbed = new EmbedBuilder()
        .setAuthor({ name: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
        .setDescription(`List of all Prefix commands.`)
        .setColor('Gold')
        .setFooter({ text: 'run /help <command> for details.', iconURL: client.user.displayAvatarURL() });
        let description = '';
        prefix.forEach((command) => {
      if (command.data.category !== 'OWNER') {
      description += `**${guildPrefix}${command.data.name}**\n${command.data.description}\n\n`;
      }
     });
     prefixEmbed.setDescription(description);
      await selectInteraction.update({ embeds: [prefixEmbed], components: [row, hmBtn] });
    } else if (selectedChoice === 'homeBtn') {
      await selectInteraction.update({ embeds: [embed], components: [row]});
    }

  });

  collector.on('end', (collected, reason) => {
    const embed = new EmbedBuilder()
    .setAuthor({ name:'Idle Timeout.'})
    .setDescription(`Help menu has expired, run the command </help:1147244751708491898> again.`)
    .setFooter({ text: 'SkyHelper', iconURL: client.user.displayAvatarURL() });
    reply.edit({ embeds: [embed], components: []});
  });

}

module.exports = {helpMenu};