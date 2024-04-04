import { QuizWinnerCard } from './canvas/quizWinnerCard';
import { QuizLeaderboardCard } from './canvas/leaderboard';

export default {
  shardsUpdate: require("./shardsUpdate"),
  timesUpdate: require("./timesUpdate"),
  askQuestion: require("./quiz/guessing"),
  QuizLeaderboardCard,
  QuizWinnerCard,
  topggAutopost: require("./topgg-autopost"),
  dblStats: require("./dblStats.js"),
};
