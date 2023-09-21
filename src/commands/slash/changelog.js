const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
module.exports = {
    data: {
      name: 'z-changelog',
      description: 'bot\'s changelog',
      longDesc: 'Learn about all the changes and updates made in the bot.'
    },
    async execute(interaction, client) {
      const embed = new EmbedBuilder()
      .setAuthor({ name: `Changelog`, iconURL: client.user.displayAvatarURL()
      })
      .setColor('Gold')
      .setTitle(`Changelog v4.2.0`)
      .setDescription(`__**Changes**__\n- Added a new command </next-red:1148726546153082920>.\n - check </help:1147244751708491898> for more info.\n- added a suggestion command.\n - You can request a feature or give an opinion on already existing one.\n- updated timestamp command results.\n- /seasonal-guides command is fully updated.\n- added /changelog command.\n- added skygpt prefix command\n - skygpt model has been trained a little in Sky: CoTL (still long way to go)\n - check </help:1147244751708491898> for more info`)
      .setFooter({ text: `v4.1.2`});
      interaction.reply({embeds: [embed], ephemral: true})
    }
}