const {QuizWinnerCard} = require('./canvas/quizWinnerCard');
const {QuizLeaderboardCard} = require('./canvas/leaderboard');

module.exports = {
    shardsUpdate: require('./shardsUpdate'),
    timesUpdate: require('./timesUpdate'),
    deleteSchema: require('./deleteSchema'),
    askQuestion: require('./quiz/guessing'),
    QuizLeaderboardCard,
    QuizWinnerCard,
    topggAutopost: require('./topgg-autopost'),
};