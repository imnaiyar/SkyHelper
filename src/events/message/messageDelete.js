const mongoose = require("mongoose");
module.exports = async (client, message) => {
  /**
   * Message Content Intent is disabled, so we won't get content of the deleted messages, we are only grabing deleted message for the purpose of getting bot's message id and to check if the bot's live updates message is deleted so any associated data can be deleted.
   */
  const model = mongoose.model("autoShard");
  const model2 = mongoose.model("autoTimes");
  const docs = await model.findOne({ messageId: message.id });
  const docs2 = await model2.findOne({
    messageId: message.id,
  });
  try {
    if (docs) {
      await model.deleteOne({ messageId: message.id });
    }
    if (docs2) {
      await model2.deleteOne({ messageId: message.id });
    }
  } catch (err) {
    client.logger.error(er);
  }
};
