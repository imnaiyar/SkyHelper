
const {  AttachmentBuilder } = require('discord.js');
const {quizWinnerCard} = require('../../functions/canvas/quizWinnerCard')
module.exports = {
  data: {
    name: 'test',
    description: 'Set a new prefix for this server',
  },
  async execute(message, args) {
    const card =  new quizWinnerCard(message.member, '5', '10')

       
    const cardBuffer = await card.build();
    const attachment = new AttachmentBuilder(cardBuffer, { name: 'winner.png'})
    message.reply({ files: [attachment] });
  },
};
