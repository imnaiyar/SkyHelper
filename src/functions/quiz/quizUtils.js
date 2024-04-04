import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, AttachmentBuilder } from 'discord.js';
import updateUser from '../../handler/updateUser';
import { QuizWinnerCard } from '../canvas/quizWinnerCard';

/**
 * Utilities for quiz function
 */
export default class quizUtils {
  /**
   * Updates user points of those participating in the game
   * @param {string} userId - Id of the user to update
   * @param {object} userPoints - object containing all the user points during a game instance
   * @param {boolean} correct - the answer by user was correct or not
   */
  static updateUserPoints(userId, userPoints, correct) {
    if (!userPoints[userId]) {
      userPoints[userId] = 0;
    }
    if (correct) {
      userPoints[userId]++;
    }
  }

  /**
   * Sends the result in the interaction channel on game end
   * @param {import('discord.js').Interaction} interaction - The interaction that initiated the game
   * @param {import('@src/frameworks').SkyHelper.data} data - object containing a game data
   */
  static async displayResults(interaction, data) {
    try {
      let result = ``;
      const sortedUserPoints = Object.entries(data.userPoints)
        .sort(([, pointsA], [, pointsB]) => pointsB - pointsA)
        .reduce((obj, [userId, points]) => ({ ...obj, [userId]: points }), {});
      const keys = Object.keys(sortedUserPoints);
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
          `<@${highestScorer}> (${highestScore} points) is the winner <:confettiCousin:1131650251216920656>\n\n**Scoreboard**\n${result}\n\n${
            keys.length === 1 ? "_Note: Score won't be updated on the leaderboard for single player game._" : ""
          }`,
        )
        .setColor("Random")
        .setThumbnail(
          "https://media.discordapp.net/attachments/867638574571323424/1196578824784191488/1705349785289.png",
        )
        .setFooter({
          text: "SkyHelper",
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setAuthor({ name: "End of Quiz" });
      const btn = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`play-again_${data.totalQuestions}`).setLabel("Play Again").setStyle(3),
      );
      if (!highestScorer) {
        resultEmbed.setDescription("No one participated in the game");
        interaction.channel.send({ embeds: [resultEmbed], components: [btn] });
      } else if (highestScore === 0) {
        resultEmbed.setDescription("No one got a correct answer");
        interaction.channel.send({ embeds: [resultEmbed], components: [btn] });
      } else {
        const winner =
          interaction?.guild?.members.cache.get(highestScorer) || interaction.client.users.cache.get(highestScorer);

        const card = new QuizWinnerCard(winner, highestScore, data.totalQuestions, interaction.client);

        const cardBuffer = await card.build();

        const winnerBnr = new AttachmentBuilder(cardBuffer, { name: "winner.png" });
        resultEmbed.setImage(`attachment://${winnerBnr.name}`);
        interaction.channel.send({
          embeds: [resultEmbed],
          components: [btn],
          files: [winnerBnr],
        });
      }
    } catch (err) {
      interaction.client.logger.error(err);
    }
  }

  /**
   * Gets the questions to be asked during the game and arrange them randomly
   * @param {import('./questions.js')} questions - The questions to sort
   * @param {number} numberOfQuestions - total number of questions to return
   * @returns {Array} An array containing a random selection of questions
   */
  static getRandomQuestions(questions, numberOfQuestions) {
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffledQuestions.slice(0, numberOfQuestions);

    return selectedQuestions;
  }
};
