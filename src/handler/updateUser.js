/**
 * Update user's Quiz stats on database
 * @param {import('@src/structures').SkyHelper} client
 * @param {Object} userPoints - Object containing ID's of participant of the Quiz game'
 * @param {string} winnerId - The ID of the winner of the quiz.
 */
module.exports = async (client, userPoints, winnerId) => {
  const { getUser } = client.database.quizData;
  for (const userId in userPoints) {
    const user = client.users.cache.get(userId);
    const userData = await getUser(user);
    userData.quizData.quizPlayed++;
    if (userId === winnerId) userData.quizData.quizWon++;
    await userData.save();
  }
};
