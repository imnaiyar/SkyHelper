const { askQuestion } = require('@functions');
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ApplicationCommandOptionType,
} = require('discord.js');
module.exports = {
  data: {
    name: 'guess',
    description: 'guess',
    options: [
      {
        name: 'questions',
        description: 'Amount of questions in a round.',
        type: ApplicationCommandOptionType.String,
        required: false,
        choices: [
          { name: '15', value: '15' },
          { name: '20', value: '20' },
          { name: '30', value: '30' },
        ],
      },
    ],
    longDesc: 'Guessing Game',
  },
  async execute(interaction, client) {
    if (!interaction.channel.permissionsFor(interaction.guild.members.me).has('ViewChannel') || !interaction.channel.permissionsFor(interaction.guild.members.me).has('SendMessages')) {
      return interaction.reply({
        content: 'I need `View Channel/Send Message` permissions in this channel for the command to work',
        ephemeral: true
      });
    }
    const questions = interaction.options.getString('questions');
    let total;
    if (questions) {
      total = parseInt(questions);
    } else {
      total = 10;
    }
    const embed = new EmbedBuilder()
      .setTitle('Start Quiz!')
      .setDescription(
        '**Rules**\n- You will be presented with questions, and your answers should be typed in the channel.\n- You have 15 seconds to answer correctly.\n- The first correct answer earns a point; if no one answers correctly, the quiz moves to the next question.\n- The default number of questions in a round is 15, but you can choose the quantity when running the command.',
      )
      .setColor('Random')
      .setTimestamp()
      .setFooter({
        text: 'SkyHelper',
        iconURL: client.user.displayAvatarURL(),
      })
      .setAuthor({
        name: 'Quiz Game',
      });

    const btn = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('start-quiz')
        .setLabel('Start')
        .setStyle(3),
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
          content: 'Starting...',
          components: [],
          embeds: []
        });
        if (int.customId === 'start-quiz') {setTimeout(async () => {
        await askQuestion(interaction, total);
      }, 2000);
          
        }
      })
      .catch(async (error) => {
        if (error.code === 'InteractionCollectorError') {
          const newRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setLabel('Timed Out')
              .setStyle(1)
              .setCustomId('lol')
              .setDisabled(true),
          );

          await reply.edit({
            components: [newRow],
          });
        } else {
          client.logger.error(error);
        }
      });
  },
};
