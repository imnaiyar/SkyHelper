const mongoose = require('mongoose');
const Schema = new mongoose.Schema({
  _id: String,
  data: {
    username: String,
    createdAt: Date,
  },
  quizData: {
    quizPlayed: {
      type: Number,
      default: 0
    },
    quizWon: {
      type: Number,
      default: 0
    }
  },
});

const Model = mongoose.model('quizData', Schema);

module.exports = {
  getUser: async (user) => {
    if (!user) throw new Error('User is undefined');
    if (!user.id) throw new Error('User Id is undefined');

    let userData = await Model.findById(user.id);
    if (!userData) {
      // create a new guild model
      userData = new Model({
        _id: user.id,
        data: {
          username: user.username,
          createdAt: user.createdAt,
        },
      });

      await userData.save();
    }
    return userData;
  },
  getAll: async (guild) => {
    try {
      let allUsers;
      if (guild) {
        const guildMemberIds = guild.members.map((member) => member.user.id);
        allUsers = await Model.find({ _id: { $in: guildMemberIds } }).sort({
          'quizData.quizWon': -1,
        });
      } else {
        allUsers = await Model.find({}).sort({ 'quizData.quizWon': -1 });
      }
      return allUsers;
    } catch (err) {
      throw err;
    }
  },
};
