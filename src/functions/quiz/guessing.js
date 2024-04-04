import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { updateUserPoints, displayResults, getRandomQuestions } from './quizUtils.js';
import path from 'path';
import questions from './questions';

/**
 * Initiate a quiz game
 * @param {import('discord.js').Interaction} interaction
 * @param {number} total
 */
export default async (interaction, total) => {
  const gameData = interaction.client.gameData;
  gameData.set(interaction.channel.id, {
    currentQuestion: 0,
    totalQuestions: 10,
    userPoints: {},
    randomQuestions: [],
  });
  const data = gameData.get(interaction.channel.id);
  if (total) data.totalQuestions = total;
  data.randomQuestions = getRandomQuestions(questions, data.totalQuestions);

  await respond(interaction, data);
};

/**
 * Responds with a question in the channel
 * @param {import('discord.js').Interaction} interaction - Interaction that initiated the game
 * @param {import('#src/frameworks').Skyhelper.gameData} data - Object containing game data
 */
async function respond(interaction, data) {
  const questionData = data.randomQuestions[data.currentQuestion];

  const quesEmbed = new EmbedBuilder()
    .setTitle(`Question ${data.currentQuestion + 1}`)
    .setColor("Random")
    .setAuthor({
      name: "Quiz Game",
    })
    .setFooter({
      text: 'type "stop" to stop the game',
    })
    .setDescription(`${questionData.question}\n\n<a:timer1:1197767726324781157> <a:timer2:1197767745610203218>`);
  let msg;
  if (questionData.image) {
    const attachment = new AttachmentBuilder(path.join(__dirname, questionData.image.url), {
      name: `image.${questionData.image.type}`,
    });
    quesEmbed.setImage(`attachment://${attachment.name}`);
    msg = await interaction.channel.send({
      embeds: [quesEmbed],
      files: [attachment],
      fetchReply: true,
    });
  } else {
    msg = await interaction.channel.send({
      embeds: [quesEmbed],
      fetchReply: true,
    });
  }

  const filter = (response) => !response.author.bot;
  const collector = interaction.channel.createMessageCollector({
    filter,
    time: 16000,
  });

  collector.on("collect", (message) => {
    const answer = message.content.toLowerCase().trim();
    if (answer === "stop") {
      if (message.author.id !== interaction.user.id) {
        return message.reply("Only the one who started the game can perform this action.");
      }
      data.currentQuestion = data.totalQuestions;
      collector.stop("stopped");
      return;
    }
    updateUserPoints(message.author.id, data.userPoints);
    if (answer === questionData.answer.toLowerCase()) {
      interaction.channel.send(`${message.author} got it correct!`);
      updateUserPoints(message.author.id, data.userPoints, true);
      setTimeout(async () => {
        collector.stop("correct");
      }, 2000);
    }
  });

  collector.on("end", async (collected, reason) => {
    if (reason !== "correct" && reason !== "stopped") {
      interaction.channel.send(
        `Time is up! Correct answer was **"${data.randomQuestions[data.currentQuestion].answer}"**`,
      );
    }

    quesEmbed.setDescription(`${questionData.question}`);
    msg.edit({ embeds: [quesEmbed] });

    data.currentQuestion++;
    if (data.currentQuestion < data.totalQuestions) {
      respond(interaction, data);
    } else {
      await displayResults(interaction, data);
      interaction.client.gameData.delete(interaction.channel.id);
    }
  });
}
