module.exports = async (type, guild) => {
  const mongoose = require('mongoose');

  const guildData = mongoose.model(type);
  await guildData.findOneAndDelete({ _id: guild });
};
