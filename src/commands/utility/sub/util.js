const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, WebhookClient } = require('discord.js');
const suggWb = process.env.SUGGESTION ? new WebhookClient({ url: process.env.SUGGESTION }) : undefined;
async function getSuggestion(interaction) {
  const { client } = interaction;
    const modal = new ModalBuilder()
      .setCustomId('suggestionModal')
      .setTitle('Suggestion');

    const fields = {
      title: new TextInputBuilder()
        .setCustomId('title')
        .setLabel('Title')
        .setPlaceholder('Title for the suggestion')
        .setStyle(TextInputStyle.Short),
      suggestion: new TextInputBuilder()
        .setCustomId('suggestion')
        .setLabel('Suggestion')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Explain in brief about your suggestions.'),
    };

    const firstActionRow = new ActionRowBuilder().addComponents(fields.title);
    const secondActionRow = new ActionRowBuilder().addComponents(
      fields.suggestion,
    );

    modal.addComponents(firstActionRow, secondActionRow);

    await interaction.showModal(modal);

    const filter = (interaction) => interaction.customId === 'suggestionModal';
    interaction
      .awaitModalSubmit({ filter, time: 2 * 60000 })
      .then((interaction) => {
        const ti = interaction.fields.getTextInputValue('title');
        const sugg = interaction.fields.getTextInputValue('suggestion');
        const embed = new EmbedBuilder()
          .setAuthor({
            name: `${interaction.user.username} made a suggestion`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .addFields(
            { name: `Title`, value: ti },
            { name: `Suggestion`, value: sugg },
          )
          .setFooter({
            text: `SkyHelper`,
            iconURL: client.user.displayAvatarURL(),
          });

        interaction
          .reply({
            content: `Your suggestion is received. Here's a preview of your suggestion`,
            embeds: [embed],
            ephemeral: true,
          })
          .then(() => {
            embed.addFields({
              name: 'Server',
              value: `${interaction.guild.name} (${interaction.guild.id})`,
            });

            suggWb.send({ embeds: [embed] });
          });
      })
      .catch(console.error);
  }
  
async function getChangelog(interaction) {
    const { client } = interaction;
    const embed = new EmbedBuilder()
      .setAuthor({ name: `Changelog`, iconURL: client.user.displayAvatarURL() })
      .setColor('Gold')
      .setTitle(`Changelog v4.2.0`)
      .setDescription(
        `__**Changes**__\n- Added a new command </next-shards:1154643350184542248>.\n - check </help:1147244751708491898> for more info.\n- added a suggestion command.\n - You can request a feature or give an opinion on already existing one.\n- updated timestamp command results.\n- /seasonal-guides command is fully updated.\n- added /changelog command.\n- added skygpt prefix command\n - skygpt model has been trained a little in Sky: CoTL (still long way to go)\n - check </help:1147244751708491898> for more info`,
      )
      .setFooter({ text: `v4.1.2` });
    interaction.reply({ embeds: [embed], ephemral: true });
  }
  
  module.exports = { getSuggestion, getChangelog };