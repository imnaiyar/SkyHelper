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
