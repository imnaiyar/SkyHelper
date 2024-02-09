/**
 * Deletes a schema based on guild id provided
 * @param {string} model - the model name
 * @param {string} guildId - the guildId to search for
 */
module.exports = async (model, guildId) => {
  const mongoose = require("mongoose");

  const guildData = mongoose.model(model);
  await guildData.findOneAndDelete({ _id: guildId });
};
