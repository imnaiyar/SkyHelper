const moment = require("moment-timezone");

/**
 * @type {import('@src/structures').SlashCommands}
 */

module.exports = {
  cooldown: 15,
  data: {
    name: "traveling-spirit",
    description: "get current/upcoming ts details",
    longDesc: "To be decided",
  },

  async execute(interaction, client) {
    const [lastOccurence, value] = client.ts;
    const now = moment().tz(client.timezone);
    const lastDate = moment.tz(lastOccurence, "DD-MM-YYYY", client.timezone).endOf("day");
    const nextDate = lastDate.clone();
    while (now.isAfter(lastDate)) {
      nextDate.add(14, "days");
    }
    const prev = nextDate.clone().subtract(14, "day");
    const stay = prev.clone().add(3, "day");
    if (now.isBetween(prev, stay)) {
      
    }
    let embed;
    if (now.isBetween(prev, stay)) {
      if (name) {
      }
    }
  },
};
