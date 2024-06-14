import { Guild, User } from "discord.js";
import mongoose from "mongoose";
const Schema = new mongoose.Schema({
  _id: String,
  data: {
    username: String,
    createdAt: Date,
  },
  quizData: {
    quizPlayed: {
      type: Number,
      default: 0,
    },
    quizWon: {
      type: Number,
      default: 0,
    },
  },
});

const Model = mongoose.model("quizData", Schema);

/**
 * Gets or creates a quiz document for user on MongoDb
 * @param user User for which to get or create a quiz document
 */
export async function getUserQuizData(user: User): Promise<mongoose.Document> {
  if (!user) throw new Error("User is undefined");
  if (!user.id) throw new Error("User Id is undefined");

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
}

/**
 * Returns all the document in quizData model or only for guild members if guild is provided as a parameter
 * @param guild Guild for which members result to be returned
 */
export async function getAll(guild: Guild): Promise<mongoose.Document[] | null> {
  let allUsers;
  if (guild) {
    await guild.members.fetch();
    const guildMemberIds = guild.members.cache.map((member) => member.user.id);
    allUsers = await Model.find({ _id: { $in: guildMemberIds } })
      .sort({
        "quizData.quizWon": -1,
      })
      .catch((err) => {
        throw new Error(err);
      });
  } else {
    allUsers = await Model.find({})
      .sort({ "quizData.quizWon": -1 })
      .catch((err) => {
        throw new Error(err);
      });
  }
  return allUsers ? allUsers : null;
}
