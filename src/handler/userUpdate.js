// update user stats after a quiz game

module.exports = async (client, user, winner) => {
  const db = await client.database.getUser(user);
  db.quizGame.gamesPlayed++;
  if (winner) {
  db.quizGame.gamesWon++;
  }
  await db.save();
};
async function getLeaderboard(db) {
  const dab = await db.find({ quizWon: -1});
  
}