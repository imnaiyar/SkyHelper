const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, AttachmentBuilder } = require("discord.js");
const path = require("path");
const { QuizWinnerCard } = require("../canvas/quizWinnerCard");
const updateUser  = require("../../handler/updateUser");
const questions = require("./questions");

/**
 * @param {import('discord.js').Interaction} interaction 
 * @param {number} total 
 */
module.exports = async (interaction, total) => {
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

async function respond(interaction, data) {
  const questionData = data.randomQuestions[data.currentQuestion];
  const filter = (response) => !response.author.bot;

  const collector = interaction.channel.createMessageCollector({
    filter,
    time: 16000,
  });

  const quesEmbed = new EmbedBuilder()
    .setTitle(`Question ${data.currentQuestion + 1}`)
    .setColor("Random")
    .setAuthor({
      name: "Quiz Game",
    })
    .setFooter({
      text: 'type "**stop**" to stop the game',
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

  collector.on("collect", (message) => {
    const answer = message.content.toLowerCase();
    if (answer === "stop") {
      if (message.author.id !== interaction.user.id) {
        return message.reply("Only the one who started the game can perform this action.");
      }
      data.currentQuestion = data.totalQuestions;
      collector.stop();
      return;
    }
    updateUserPoints(message.author.id, data.userPoints);
    if (answer === questionData.answer.toLowerCase()) {
      interaction.channel.send(`${message.author} got it correct!`);
      updateUserPoints(message.author.id, data.userPoints, true);
      setTimeout(async () => {
        collector.stop();
      }, 2000);
    }
  });

  collector.on("end", async (collected) => {
    if (collected.size === 0) {
      interaction.channel.send(
        `Time is up! Correct answer was **"${data.randomQuestions[data.currentQuestion].answer}"**`
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
function updateUserPoints(userId, userPoints, won) {
  if (!userPoints[userId]) {
    userPoints[userId] = 0;
  }
  if (won) {
    userPoints[userId]++;
  }
}

async function displayResults(interaction, data) {
  let result = ``;
  const sortedUserPoints = Object.entries(data.userPoints)
    .sort(([, pointsA], [, pointsB]) => pointsB - pointsA)
    .reduce((obj, [userId, points]) => ({ ...obj, [userId]: points }), {});
    const keys = Object.keys(sortedUserPoints)
  const highestScorer = keys[0];
  const highestScore = sortedUserPoints[highestScorer];
  if (highestScorer && keys.length !== 1) { 
  await updateUser(interaction.client, sortedUserPoints, highestScore > 0 ? highestScorer : null);
  }
  for (const userId in sortedUserPoints) {
    result += `- <@${userId}> -  ${data.userPoints[userId]} (Accuracy Rate: ${
      (data.userPoints[userId] / data.totalQuestions) * 100
    }%)\n`;
  }
  const resultEmbed = new EmbedBuilder()
    .setTitle("Result")
    .setDescription(
      `<@${highestScorer}> (${highestScore} points) is the winner <:confettiCousin:1131650251216920656>\n\n**Scoreboard**\n${result}\n\n${keys.length === 1 ? '_Note: Score won\'t be updated on the leaderboard for single player game._' : ''}`
    )
    .setColor("Random")
    .setThumbnail("https://media.discordapp.net/attachments/867638574571323424/1196578824784191488/1705349785289.png")
    .setFooter({
      text: "SkyHelper",
      iconURL: interaction.client.user.displayAvatarURL(),
    })
    .setAuthor({ name: "End of Quiz" });
  const btn = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`play-again_${data.totalQuestions}`).setLabel("Play Again").setStyle(3)
  );
  if (!highestScorer) {
    resultEmbed.setDescription("No one participated in the game");
    interaction.channel.send({ embeds: [resultEmbed], components: [btn] });
  } else if (highestScore === 0) {
    resultEmbed.setDescription("No one got a correct answer");
    interaction.channel.send({ embeds: [resultEmbed], components: [btn] });
  } else {
    const winner = interaction.guild.members.cache.get(highestScorer);
    const card = new QuizWinnerCard(winner, highestScore, data.totalQuestions);

    const cardBuffer = await card.build();
    const winnerBnr = new AttachmentBuilder(cardBuffer, { name: "winner.png" });
    resultEmbed.setImage(`attachment://${winnerBnr.name}`);
    interaction.channel.send({
      embeds: [resultEmbed],
      components: [btn],
      files: [winnerBnr],
    });
  }
}

function getRandomQuestions(questions, numberOfQuestions) {
  const shuffledQuestions = questions.sort(() => Math.random() - 0.5);
  const selectedQuestions = shuffledQuestions.slice(0, numberOfQuestions);

  return selectedQuestions;
}
