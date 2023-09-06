const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { getSettings } = require("@schemas/Guild");

async function helpMenu(interaction, client) {
  const userAvatar = interaction.user.displayAvatarURL({ format: 'png', dynamic: true });
  const userNickname = interaction.user?.nickname || interaction.user.username;
  const botUser = await client.users.fetch(client.user.id);
  const botAvatar = botUser.displayAvatarURL({ format: 'png', dynamic: true });

  const embed = new EmbedBuilder()
    .setAuthor({ name: `Requested by ${userNickname}`, iconURL: `${userAvatar}` })
    .setDescription(`List of all Slash and Prefix commands.`)
    .setTimestamp(Date.now())
    .setColor('#000000')
    .setFooter({ text: 'SkyBot', iconURL: `${botAvatar}` })
    .addFields({ name: '**__Slash Commands__**', value: `</shards:1121541967730450574>, </seasonal-guides:1121541967730450574>, </sky-times:1121541967730450574>, </timestamp:1121541967730450574>`, inline: true })
    .addFields({ name: '**__Prefix Commands__**', value: `\`\`\`credits, skygpt, ping, skytimes, setprefix\`\`\``, inline: false });

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

  // Create a collector to listen for interactions on this message
  const filter = (i) => i.customId === 'commands-help' && i.isStringSelectMenu();
  const collector = interaction.channel.createMessageComponentCollector({ filter, idle: 2 * 60 * 1000 }); // Set a timeout of 60 seconds

  collector.on('collect', async (selectInteraction) => {
    const selectedChoice = selectInteraction.values[0];
    if (selectedChoice === 'slash') {
      const slashEmbed = new EmbedBuilder()
        .setAuthor({ name: `Requested by ${userNickname}`, iconURL: `${userAvatar}` })
        .setDescription(`List of all Slash commands.`)
        .setTimestamp(Date.now())
        .setColor('#000000')
        .setDescription("<:slash:1140102899750420620> **Shards**\n</shards:1121541967730450574>\nGives Information about shards. By default it provides info about today's shard but an additional date can be provided to get shard info for that particular day.\n\n<:slash:1140102899750420620> **Seasonal Guides**\n</seasonal-guides:1121541967730450574>\nVarious guides including Season Quests, Seasonal Spirits Location, Spirits Tree from a particular season. Run the command `!credits` to know whose guides are included in the bot.\n\n<:slash:1140102899750420620> **Sky-Times**\n</sky-times:1121541967730450574>\nProvides upcoming time for Several Sky in-game events such as Grandma, Geyser, Turtle, Daily Reset, Eden Reset. For Social light events, it also tells you if it is currently active, run their individual commands to see more details.\n\n<:slash:1140102899750420620> **Timestamp**\n</timestamp:1121541967730450574>\nConverts time provided by you into Unix timestamp (Format(input): `HH mm ss`). By default, the timezone is set to `America/Los_Angeles` as it is the timezone for TGC. But if you wanna convert for a particular timezone, you can provide one.")
        .setFooter({ text: 'SkyBot', iconURL: `${botAvatar}` });
      await selectInteraction.update({ embeds: [slashEmbed] });
    } else if (selectedChoice === 'prefix') {
      const settings = await getSettings(interaction.guild);
      const prefixEmbed = new EmbedBuilder()
        .setAuthor({ name: `Requested by ${userNickname}`, iconURL: `${userAvatar}` })
        .setDescription(`List of all Prefix commands.`)
        .setTimestamp(Date.now())
        .setColor('#000000')
        .setFooter({ text: 'SkyBot', iconURL: `${botAvatar}` })
        .addFields({ name: '<:prefix:1140103340643078144> **Credits**(everyone)', value: `\`\`\`${settings?.prefix || process.env.PREFIX}credits\`\`\`Credits to all the people whose work is included in the bot. If I forgot to mention anyone, kindly let me know and I'll add them.`, inline: true })
        .addFields({ name: '**<:prefix:1140103340643078144> Sky AI Support** (administrator)', value: `\`\`\`${settings?.prefix || process.env.PREFIX}skygpt set #channelname,  !skygpt stop\`\`\`An AI chatbot based on OpenAI's ChatGPT that provides information related to Sky: Children of the Light. Keep in mind that since ChatGPT doesn't provide real-time data, it is often incorrect. So it's more for fun than actual help. To set up, run the command \`!skygpt set #channelname\` and it'll listen to all messages in that channel and respond to it (so make sure it's a channel dedicated for the bot and not just any text channel). You can stop this anytime by running \`!skygpt stop\``, inline: true })
        .addFields({ name: "<:prefix:1140103340643078144> **Ping** (everyone)", value: `\`\`\`${settings?.prefix || process.env.PREFIX}ping\`\`\`Gives bot's Ping.`, inline: true })
        .addFields({ name: "<:prefix:1140103340643078144> **Set Prefix** (ManageServer)", value: `\`\`\`${settings?.prefix || process.env.PREFIX}setprefix\`\`\`Change the Bot's prefix for this server.`, inline: true });
      await selectInteraction.update({ embeds: [prefixEmbed] });
    }
  });

  collector.on('end', (collected, reason) => {
    const embed = new EmbedBuilder()
    .setAuthor({ name:'Idle Timeout.'})
    .setDescription(`Help menu has expired, run the command </help:1147244751708491898> again.`)
    .setFooter({ text: 'SkyBot', iconURL: `${botAvatar}` })
    reply.edit({ embeds: [embed], components: []})
  });

}

module.exports = {helpMenu}