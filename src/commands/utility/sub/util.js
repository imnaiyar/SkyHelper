const {
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  WebhookClient,
} = require('discord.js');
const suggWb = process.env.SUGGESTION
  ? new WebhookClient({ url: process.env.SUGGESTION })
  : undefined;
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
    .setTitle(`Changelog v4.3.2`)
    .setDescription(
      `Significant Update: All prefix commands have been removed, and the bot now exclusively supports slash commands.\n\nSeveral commands, namely 'credits,' 'suggestions,' 'changelog,' and 'ping,' have been consolidated into a unified '</util:173839382998227>' command as a subcommand.\n\nAdditionally, the SkyGpt feature has been entirely removed.\n- After careful consideration, it was deemed not to meet the required accuracy standards, therefore misleading and was thus discontinued.`,
    )
    .setFooter({ text: `v4.3.2` });
  interaction.reply({ embeds: [embed], ephemral: true });
}

module.exports = { getSuggestion, getChangelog };
