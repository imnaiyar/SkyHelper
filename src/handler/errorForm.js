const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
/**
 * @param {import('discord.js').Interaction} interaction
 */
async function ErrorForm (interaction) {
    const modal = new ModalBuilder()
        .setCustomId('errorModal')
        .setTitle('Bug Report');

    const commandUsed = new TextInputBuilder()
        .setCustomId('commandUsed')     
        .setLabel("Name of the command.")
        .setPlaceholder('The command that produced the said error.')
        .setStyle(TextInputStyle.Short);

    const server = new TextInputBuilder()
        .setCustomId('server')
        .setLabel("Name of the server where it occured.")
        .setStyle(TextInputStyle.Paragraph);

    const firstActionRow = new ActionRowBuilder().addComponents(commandUsed);
    const secondActionRow = new ActionRowBuilder().addComponents(server);

    modal.addComponents(firstActionRow, secondActionRow);

    await interaction.showModal(modal);
}

module.exports = {ErrorForm}