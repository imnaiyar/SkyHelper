const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, AttachmentBuilder } = require('discord.js');
const questions = require('./questions');


module.exports = async (interaction, total) => {
  let currentQuestion = 0;
  let totalQuestions = 10;
  let userPoints = {};
  let randomQuestions = [];
  if (total) totalQuestions = total;
  randomQuestions = getRandomQuestions(questions, totalQuestions);
  await respond(interaction, currentQuestion, totalQuestions, userPoints, randomQuestions);
};

async function respond(interaction, currentQuestion, totalQuestions, userPoints, randomQuestions) {
  const questionData = randomQuestions[currentQuestion];
  const filter = (response) => {
    if (!response.author.bot) {
      const answer = response.content.toLowerCase();
      return answer === questionData.answer.toLowerCase() || answer === 'stop';
    }
    return false;
  };
  const collector = interaction.channel.createMessageCollector({
    filter,
    time: 16000,
  });

  const quesEmbed = new EmbedBuilder()
    .setTitle(`Question ${currentQuestion + 1}`)
    .setColor('Random')
    .setAuthor({
      name: 'Quiz Game',
    })
    .setFooter({
      text: 'type "**stop**" to stop the game',
    })
    .setDescription(`${questionData.question}\n\n<a:timer1:1197767726324781157> <a:timer2:1197767745610203218>`);
    let msg;
  if (questionData.image) {
     attachment = new AttachmentBuilder(`src/handler/functions/${questionData.image}`, { name: 'image.jpg'});
     console.log(attachment);
    quesEmbed.setImage(`attachment://${attachment.name}`);
 msg =  await interaction.channel.send({ embeds: [quesEmbed], files: [attachment], fetchReply: true });
  } else {
    msg =  await interaction.channel.send({ embeds: [quesEmbed], fetchReply: true });
  }


  collector.on('collect', (message) => {
    const answer = message.content.toLowerCase();
    if (answer === questionData.answer.toLowerCase()) {
      interaction.channel.send(`${message.author} got it correct!`);
      updateUserPoints(message.author.id, userPoints);
      setTimeout(async () => {
        collector.stop();
      }, 2000);
    } else if (answer === 'stop') {
      if (message.author.id !== interaction.user.id) {
        return message.reply(
          'Only the one who started the game can perform this action.',
        );
      }
      currentQuestion = totalQuestions;
      collector.stop();
    }
  });

  collector.on('end', (collected) => {
    if (collected.size === 0) {
      interaction.channel.send(
        `Time is up! Correct answer was **"${randomQuestions[currentQuestion].answer}"**`,
      );
    }
    
    quesEmbed.setDescription(`${questionData.question}`);
    msg.edit({ embeds: [quesEmbed] });
    
    currentQuestion++;
    if (currentQuestion < totalQuestions) {
      respond(interaction, currentQuestion, totalQuestions, userPoints, randomQuestions);
    } else {
      displayResults(interaction, userPoints, totalQuestions);
      resetQuiz(currentQuestion, userPoints, randomQuestions);
    }
  });
}
function updateUserPoints(userId, userPoints) {
  if (!userPoints[userId]) {
    userPoints[userId] = 1;
  } else {
    userPoints[userId]++;
  }
}

function displayResults(interaction, userPoints, totalQuestions) {
  let result = ``;
  const sortedUserPoints = Object.entries(userPoints)
    .sort(([, pointsA], [, pointsB]) => pointsB - pointsA)
    .reduce((obj, [userId, points]) => ({ ...obj, [userId]: points }), {});
  const highestScorer = Object.keys(sortedUserPoints)[0];
  const highestScore = sortedUserPoints[highestScorer];

  for (const userId in sortedUserPoints) {
    result += `- <@${userId}> -  ${userPoints[userId]} (Accuracy Rate: ${
      (userPoints[userId] / totalQuestions) * 100
    }%)\n`;
  }
  const resultEmbed = new EmbedBuilder()
    .setTitle('Result')
    .setDescription(
      `<@${highestScorer}> (${highestScore} points) is the winner <:confettiCousin:1131650251216920656>\n\n**Scoreboard**\n${result}`,
    )
    .setColor('Random')
    .setThumbnail(
      'https://media.discordapp.net/attachments/867638574571323424/1196578824784191488/1705349785289.png',
    )
    .setFooter({
      text: 'SkyHelper',
      iconURL: interaction.client.user.displayAvatarURL(),
    })
    .setAuthor({ name: 'End of Quiz' });
    if (!highestScorer) {
      resultEmbed.setDescription('No one participated in the game');
    }
  const btn = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`play-again_${totalQuestions}`)
      .setLabel('Play Again')
      .setStyle(3),
  );
  interaction.channel.send({ embeds: [resultEmbed], components: [btn] });
}

function resetQuiz(currentQuestion, userPoints, randomQuestions) {
  currentQuestion = 0;
  userPoints = {};
  randomQuestions = [];
}

function getRandomQuestions(questions, numberOfQuestions) {
  const shuffledQuestions = questions.sort(() => Math.random() - 0.5);
  const selectedQuestions = shuffledQuestions.slice(0, numberOfQuestions);

  return selectedQuestions;
}

