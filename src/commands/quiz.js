const { askQuestion, QuizLeaderboardCard } = require("@functions/index");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ApplicationCommandOptionType,
  AttachmentBuilder,
} = require("discord.js");
module.exports = {
  data: {
    name: "quiz",
    description: "test your Sky CoTL knowledge against others with this quiz game",
    options: [
      {
        name: "start",
        description: "Amount of questions in a round.",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "questions",
            description: "Amount of questions in a round.",
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
              { name: "15", value: "15" },
              { name: "20", value: "20" },
              { name: "30", value: "30" },
            ],
          },
        ],
      },
      {
        name: "leaderboard",
        description: "get quiz game leaderboard",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "type",
            description: "type of leaderboard to get",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
              { name: "Global", value: "global" },
              { name: "Server", value: "server" },
            ],
          },
        ],
      },
    ],
    longDesc: "Guessing Game",
  },
  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    if (sub === "start") {
      if (!interaction.channel.permissionsFor(interaction.guild.members.me).has(["SendMessages", "ViewChannel"])) {
        return interaction.reply({
          content: "I need `View Channel/Send Message` permissions in this channel for the command to work",
          ephemeral: true,
        });
      }

      if (client.gameData.get(interaction.channel.id)) {
        return interaction.reply({
          content: "There's already a game in progress in this channel",
          ephemeral: true,
        });
      }
      const questions = interaction.options.getString("questions");
      let total;
      if (questions) {
        total = parseInt(questions);
      } else {
        total = 10;
      }
      const embed = new EmbedBuilder()
        .setTitle("Start Quiz!")
        .setDescription(
          "**Rules**\n- You will be presented with questions, and your answers should be typed in the channel.\n- You have 15 seconds to answer correctly.\n- The first correct answer earns a point; if no one answers correctly, the quiz moves to the next question.\n- The default number of questions in a round is 15, but you can choose the quantity when running the command."
        )
        .setColor("Random")
        .setTimestamp()
        .setFooter({
          text: "SkyHelper",
          iconURL: client.user.displayAvatarURL(),
        })
        .setAuthor({
          name: "Quiz Game",
        });

      const btn = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("start-quiz").setLabel("Start").setStyle(3)
      );
      const reply = await interaction.reply({
        embeds: [embed],
        components: [btn],
        fetchReply: true,
      });

      const filter = (i) => {
        if (i.user.id !== interaction.user.id) {
          i.reply({
            content: `Only the one who ran the command can perform this action`,
            ephemeral: true,
          });
          return false;
        }
        return true;
      };

      reply
        .awaitMessageComponent({
          filter,
          time: 2 * 60 * 1000,
        })
        .then(async (int) => {
          await int.deferUpdate();
          interaction.editReply({
            content: "Starting...",
            components: [],
            embeds: [],
          });
          if (int.customId === "start-quiz") {
            setTimeout(async () => {
              await askQuestion(interaction, total);
            }, 2000);
          }
        })
        .catch(async (error) => {
          if (error.code === "InteractionCollectorError") {
            const newRow = new ActionRowBuilder().addComponents(
              new ButtonBuilder().setLabel("Timed Out").setStyle(1).setCustomId("lol").setDisabled(true)
            );

            await reply.edit({
              components: [newRow],
            });
          } else {
            client.logger.error(error);
          }
        });
    }

    if (sub === "leaderboard") {
      await interaction.deferReply();
      const opt = interaction.options.getString("type");
      const { getAll } = client.database.quizData;
      const embed = new EmbedBuilder()
        .setAuthor({ name: "Sky CoTL Quiz Leaderboard" })
        .setTitle(opt === "global" ? "Global Leaderboard" : `${interaction.guild.name} Leaderboard`)
      if (opt === "global") {
        const globUser = await getAll();
        if (globUser) {
          const top = await getAllUser(globUser, client);
          const attachment = new AttachmentBuilder(top, { name: "quiz.png" });
          embed.setImage(`attachment://quiz.png`);
          interaction.editReply({ embeds: [embed], files: [attachment] });
        } else {
          interaction.editReply({
            content: `Oops! Looks like it's all empty. Be the first one to cement your name on the leaderboard. Try the quiz game by running </${interaction.commandName}:${interaction.commandId}`,
            ephemeral: true,
          });
        }
      } else if (opt === "server") {
        const serverUser = await getAll(interaction.guild);
        if (serverUser) {
          const top = await getAllUser(serverUser, client);
          const attachment = new AttachmentBuilder(top, { name: "quiz.png" });
          embed.setImage(`attachment://quiz.png`);
          embed.setFooter({ text: 'Game stats here displayed are over all the servers, and not just this one.'})
          interaction.editReply({ embeds: [embed], files: [attachment] });
        } else {
          interaction.editReply({
            content: `Oops! Looks like it's all empty. Be the first one to cement your name on the leaderboard. Try the quiz game by running </${interaction.commandName}:${interaction.commandId}`,
            ephemeral: true,
          });
        }
      }
    }
  },
};

async function getAllUser(data, client) {
  const lbData = [];
  for (const docs of data) {
    const user = await client.getUser(docs.data.username, docs._id);
    lbData.push({
      top: lbData.length + 1,
      avatar: user.displayAvatarURL(),
      tag: user.username,
      score: docs.quizData.quizWon,
      games: docs.quizData.quizPlayed,
    });
  }

  const top = await new QuizLeaderboardCard()
    .setOpacity(0.6)
    .setScoreMessage("Wins:") //(Preferred Option)
    .setabbreviateNumber(false) //(Preferred Option)
    .setColors({
      box: "#212121",
      username: "#ffffff",
      score: "#ffffff",
      firstRank: "#f7c716",
      secondRank: "#9e9e9e",
      thirdRank: "#94610f",
    }) //(Preferred Option)
    .setUsersData(lbData.slice(0, 10))
    .build();
  return top;
}
