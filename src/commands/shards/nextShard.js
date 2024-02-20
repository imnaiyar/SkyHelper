const { ApplicationCommandOptionType } = require("discord.js");
const moment = require("moment-timezone");
const desc = require("@src/cmdDesc");
const shardType = ["C", "b", "A", "a", "B", "b", "C", "a", "A", "b", "B", "a"];
const shardLocation = [
  "<:Prairie:1150605405408473179> Daylight Prairie",
  "<:Forest:1150605383656800317> Hidden Forest",
  "<:Valley:1150605355777273908> Valley of Triumph",
  "<:Wasteland:1150605333862027314> Golden Wasteland",
  "<:Vault:1150605308364861580> Vault of Knowledge",
];

const dayToSkip = {
  C: [1, 2],
  B: [3, 4],
  A: [2, 3],
  a: [6, 0],
  b: [0, 1],
};
module.exports = {
  cooldown: 10,
  data: {
    name: "next-shards",
    description: "Get date and location of next shards. (default: 5)",
    longDesc: desc.nextShards,
    options: [
      {
        name: "type",
        description: "Select a shard type.",
        type: ApplicationCommandOptionType.String,
        required: false,
        choices: [
          { name: "Red Shards", value: "red" },
          { name: "Black Shards", value: "black" },
        ],
      },
      {
        name: "number",
        description: "Number of next shards date to search for.",
        type: ApplicationCommandOptionType.Integer,
        required: false,
      },
    ],
  },
  async execute(interaction) {
    const input = interaction.options.getInteger("number");
    const type = interaction.options.getString("type");
    if (input && interaction.guild && input > 10) {
      return interaction.reply({
        content: `Max number is 10 to prevent clogging up the channel, you provided \`${input}\`. Run the command in my dm for upto 15 results.`,
        ephemeral: true,
      });
    }
    if (input && input > 15) {
      return interaction.reply({
        content: `Max number is 15. You provided \`${input}\``,
        ephemeral: true,
      });
    }
    const daysNum = input || 5;

    const nextRedEvents = getNextRedEvents(daysNum, type);
    const srd = type === "red" ? "Red Shards" : type === "black" ? "Black Shards" : "Shards";
    let response = `Next ${daysNum} ${srd}:\n`;

    for (const eventInfo of nextRedEvents) {
      response += `- ${eventInfo.shard} on \`${eventInfo.day}\` at <t:${eventInfo.unix}:T> in ${eventInfo.secondEvent}\n`;
    }
    response +=
      "\n_For more information about a shard, use the corresponding date in </shards:1142231977328648364> command_";
    interaction.reply(response);
  },
};

function getNextRedEvents(daysNum, type) {
  const redEvents = [];
  const today = moment().tz("America/Los_Angeles").startOf("day");

  while (redEvents.length < daysNum) {
    const dayCount = today.date() - 1;
    const event = shardType[dayCount % shardType.length];
    const secondEvent = shardLocation[dayCount % shardLocation.length];
    const dayOfWeek = today.day();
    const eventTimes = {
      B: today.clone().startOf("day").add(3, "hours").add(38, "minutes").add(40, "seconds"),
      C: today.clone().startOf("day").add(7, "hours").add(48, "minutes").add(40, "seconds"),
      A: today.clone().startOf("day").add(2, "hours").add(28, "minutes").add(40, "seconds"),
      a: today.clone().startOf("day").add(1, "hours").add(58, "minutes").add(40, "seconds"),
      b: today.clone().startOf("day").add(2, "hours").add(18, "minutes").add(40, "seconds"),
    };
    if (type) {
      if (type === "red") {
        if (["C", "B", "A"].includes(event)) {
          if (!dayToSkip[event].includes(dayOfWeek)) {
            const fallTime = eventTimes[event];
            const unix = Math.floor(fallTime.valueOf() / 1000);
            const shard = "Red Shard";
            const todayDate = today.format("YYYY-MM-DD");
            redEvents.push({ day: todayDate, event, secondEvent, unix, shard });
          }
        }
      } else if (type === "black") {
        if (["a", "b"].includes(event)) {
          if (!dayToSkip[event].includes(dayOfWeek)) {
            const fallTime = eventTimes[event];
            const unix = Math.floor(fallTime.valueOf() / 1000);
            const shard = "Black Shard";
            const todayDate = today.format("YYYY-MM-DD");
            redEvents.push({ day: todayDate, event, secondEvent, unix, shard });
          }
        }
      }
    } else if (!dayToSkip[event].includes(dayOfWeek)) {
      const fallTime = eventTimes[event];
      const unix = Math.floor(fallTime.valueOf() / 1000);
      const shard = event === event.toUpperCase() ? "Red Shard" : "Black Shard";
      const todayDate = today.format("YYYY-MM-DD");
      redEvents.push({ day: todayDate, event, secondEvent, unix, shard });
    }
    today.add(1, "day");
  }

  return redEvents;
}
