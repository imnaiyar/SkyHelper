const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  AttachmentBuilder,
} = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const { request } = require('undici');

const questions = require('./questions');
 const gameData = new Map();
module.exports = async (interaction, total) => {
  gameData.set(interaction.id, {
    currentQuestion: 0,
    totalQuestions: 10,
    userPoints: {},
    randomQuestions: [],
  });
  const data = gameData.get(interaction.id);
  if (total) data.totalQuestions = total;
  data.randomQuestions = getRandomQuestions(questions, data.totalQuestions);
  
  await respond(
    interaction,
    data,
  );
};

async function respond(
  interaction, data
) {
  const questionData = data.randomQuestions[data.currentQuestion];
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
    .setTitle(`Question ${data.currentQuestion + 1}`)
    .setColor('Random')
    .setAuthor({
      name: 'Quiz Game',
    })
    .setFooter({
      text: 'type "**stop**" to stop the game',
    })
    .setDescription(
      `${questionData.question}\n\n<a:timer1:1197767726324781157> <a:timer2:1197767745610203218>`,
    );
  let msg;
  if (questionData.image) {
    (attachment = new AttachmentBuilder(
      `src/handler/functions/${questionData.image.url}`,
      { name: `image.${questionData.image.type}` },
    )),
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

  collector.on('collect', (message) => {
    const answer = message.content.toLowerCase();
    if (answer === questionData.answer.toLowerCase()) {
      interaction.channel.send(`${message.author} got it correct!`);
      updateUserPoints(message.author.id, data.userPoints);
      setTimeout(async () => {
        collector.stop();
      }, 2000);
    } else if (answer === 'stop') {
      if (message.author.id !== interaction.user.id) {
        return message.reply(
          'Only the one who started the game can perform this action.',
        );
      }
      data.currentQuestion = data.totalQuestions;
      collector.stop();
    }
  });

  collector.on('end', async (collected) => {
    if (collected.size === 0) {
      interaction.channel.send(
        `Time is up! Correct answer was **"${data.randomQuestions[data.currentQuestion].answer}"**`,
      );
    }

    quesEmbed.setDescription(`${questionData.question}`);
    msg.edit({ embeds: [quesEmbed] });

    data.currentQuestion++;
    if (data.currentQuestion < data.totalQuestions) {
      respond(
        interaction,
        data
      );
    } else {
      await displayResults(interaction, data);
      gameData.delete(interaction.id);
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

async function displayResults(interaction, data) {
  let result = ``;
  const sortedUserPoints = Object.entries(data.userPoints)
    .sort(([, pointsA], [, pointsB]) => pointsB - pointsA)
    .reduce((obj, [userId, points]) => ({ ...obj, [userId]: points }), {});
  const highestScorer = Object.keys(sortedUserPoints)[0];
  const highestScore = sortedUserPoints[highestScorer];

  for (const userId in sortedUserPoints) {
    result += `- <@${userId}> -  ${data.userPoints[userId]} (Accuracy Rate: ${
      (data.userPoints[userId] / data.totalQuestions) * 100
    }%)\n`;
  }
  const winner = interaction.guild.members.cache.get(highestScorer);
  const winnerBnr = await getWinnerImg(winner);
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
  } else {
    resultEmbed.setImage(`attachment://${winnerBnr.name}`);
  }
  const btn = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`play-again_${data.totalQuestions}`)
      .setLabel('Play Again')
      .setStyle(3),
  );
  if (!highestScorer) {
  interaction.channel.send({ embeds: [resultEmbed], components: [btn] }); 
  } else {
    interaction.channel.send({ embeds: [resultEmbed], components: [btn], files: [winnerBnr] }); 
  }
}

function getRandomQuestions(questions, numberOfQuestions) {
  const shuffledQuestions = questions.sort(() => Math.random() - 0.5);
  const selectedQuestions = shuffledQuestions.slice(0, numberOfQuestions);

  return selectedQuestions;
}

const applyText = (canvas, text) => {
  const context = canvas.getContext('2d');

  // Declare a base size of the font
  let fontSize = 70;

  do {
    // Assign the font to the context and decrement it so it can be measured again
    context.font = `${fontSize -= 10}px sans-serif`;
    // Compare pixel width of the text to the canvas minus the approximate avatar size
  } while (context.measureText(text).width > canvas.width - 300);

  // Return the font string
  return context.font;
};
async function getWinnerImg(member) {
  const canvas = Canvas.createCanvas(700, 250);
  const context = canvas.getContext('2d');
  let background;

  // Load avatar image
  const avtr = await request(member.displayAvatarURL({ format: 'jpg', size: 512 }));
  const avatar = await Canvas.loadImage(await avtr.body.arrayBuffer());

  // Check if member has a banner, and load background accordingly
  if (member.banner) {
    const bnr = await request(member.bannerURL({ format: 'jpg', size: 700 }));
    background = await Canvas.loadImage(bnr.body.arrayBuffer());
  } else {
    background = avatar;
  }

  // Draw the blurred background
  context.filter = 'blur(10px)'; // Adjust the blur amount as needed
  context.drawImage(background, 0, 0, canvas.width, canvas.height);
  context.filter = 'none'; // Reset filter for subsequent drawing

  // Draw the circular avatar
  
  // Draw text with black border
context.font = '28px sans-serif';
context.fillStyle = '#000000';

context.fillText(member.user.username, canvas.width / 2.5, canvas.height / 3);

context.font = applyText(canvas, member.displayName);
context.fillStyle = '#ffffff';
context.strokeStyle = '#000000';
context.lineWidth = 1;

context.strokeText(member.displayName, canvas.width / 2.5, canvas.height / 1.8);
context.fillText(member.displayName, canvas.width / 2.5, canvas.height / 1.8);
  
  context.beginPath();
  context.arc(125, 125, 100, 0, Math.PI * 2, true);
  context.closePath();
  context.clip();
  context.drawImage(avatar, 25, 25, 200, 200);


  // Create attachment
  const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'profile-image.png' });
  return attachment;
}
