import { ApplicationCommandOptionType, time } from 'discord.js';
import moment from 'moment-timezone';
import { skyTimes } from './sub/skyTimes';

export default {
  cooldown: 5,
  data: {
    name: "sky-times",
    description: "Get various times related to the world of Sky",
    options: [
      {
        name: "times",
        description: "Select a specific time you want.",
        type: ApplicationCommandOptionType.String,
        required: false,
        choices: [
          { name: "Geyser Time", value: "geyser" },
          { name: "Grandma Time", value: "grandma" },
          { name: "Turtle Time", value: "turtle" },
          { name: "Reset Time", value: "reset" },
          { name: "Eden Reset Time", value: "eden" },
          { name: "Event (Days of ...)", value: "event" },
        ],
      },
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  async execute(interaction) {
    const { client } = interaction;
    const result = await skyTimes(client);
    const chosenOption = interaction.options.getString("times");
    const buildTimestamps = (offset) => {
      const now = moment().tz(interaction.client.timezone).startOf("day").add(offset, "minutes");
      const clonedTime = now.clone();
      let timeBuilt = `> `;
      while (now.date() === clonedTime.date()) {
        timeBuilt += `${time(clonedTime.toDate(), "t")} 》`;
        clonedTime.add(2, "hours");
      }
      return timeBuilt;
    };
    switch (chosenOption) {
      case "geyser":
        await interaction.reply(`${result.geyserResultStr}\n**__All Geyser Times:__**
${buildTimestamps(0)}`);
        break;

      case "turtle":
        await interaction.reply(`${result.turtleResultStr}\n**__All Turtle Times:__**\n${buildTimestamps(50)}`);
        break;

      case "grandma":
        await interaction.reply(`${result.grandmaResultStr}\n**__All Grandma Times:__**
${buildTimestamps(30)}`);
        break;

      case "reset":
        await interaction.reply(`\`Next reset for you on:\` ${result.resetResultStr}`);
        break;

      case "eden":
        await interaction.reply(`\`Next eden reset for you on:\` ${result.edenResultStr}`);
        break;

      case "event": {
        const evnt = client.skyEvents.get("event");
        if (evnt.eventActive || result.eventDescription !== "No active events.") {
          await interaction.reply(
            `${
              evnt.eventActive
                ? `**Event:** ${evnt.eventName}\n**Start Date:** ${time(
                    evnt.eventStarts.toDate(),
                    "f",
                  )}\n**End Date:** ${time(evnt.eventEnds.toDate(), "f")}\n**Duration:** ${evnt.eventDuration}\n`
                : ""
            }\`\`\`Countdown\`\`\`\n${result.eventDescription}`,
          );
        } else {
          await interaction.reply("No active events right now.");
        }

        break;
      }

      default:
        await interaction.reply(
          `In-game events time:\n> **Geyser(upcoming):** ${result.geyserResultStr}\n\n> **Grandma(upcoming):** ${result.grandmaResultStr}\n\n> **Turtle(upcoming):** ${result.turtleResultStr}\n\n> **Reset(next):** ${result.resetResultStr}\n\n> **Eden(reset):** ${result.edenResultStr}\n\n\`\`\`Event\`\`\`\n${result.eventDescription}\n\n_Check individual options (geyser, grandma, etc.) for more information_`,
        );
        break;
    }
  },
};
