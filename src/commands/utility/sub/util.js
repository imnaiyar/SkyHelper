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
      `Introducing a new command "shards-live". Once configured to a channel, the bot will send a message at time of using the command in specied channel and will update it every 5 minutes with Live Shards updates. For detailed description of this command use \`\\help command:shards-live\`\n\nFor previous/detailed changelogs, checkout the release page on GitHub [here](https://github.com/imnaiyar/SkyHelper/releases).`,
    )
    .setFooter({ text: `v4.3.2` });
  interaction.reply({ embeds: [embed], ephemral: true });
}

module.exports = { getSuggestion, getChangelog };
