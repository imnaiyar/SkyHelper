const { Client, StringSelectMenuBuilder, ActionRowBuilder, GatewayIntentBits } = require('discord.js');
const choiceResponses = require('./GuideResponse.js');

const config = require('../../config.json');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
  ],
});
function clearEphemeralChoice(messageId) {
  ephemeralChoice.delete(messageId);
}
const messageChoices = new Map();
const ephemeralChoice = new Map();
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand() || interaction.commandName !== 'seasonal_guides') return;
  const ephemeralOption = interaction.options.getString('ephemeral');
  const ephemeral = ephemeralOption === 'false' ? false : true;

  console.log('ephemeralOption:', ephemeralOption);
console.log('ephemeral:', ephemeral);


  const { firstChoices } = require('./SeasonalChoices.js');

  const dropdownOptions = firstChoices.map(choice => ({
    label: choice.label,
    value: choice.value,
    emoji: choice.emoji,
  }));

  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('firstChoice')
      .setPlaceholder('Choose a Season')
      .addOptions(dropdownOptions)
  );
  
  

 const reply = await interaction.reply({
    content: 'Please select a season:',
    components: [row],
    ephemeral: true,
    fetchReply: true
  });
  if (ephemeralOption) {
  ephemeralChoice.set(reply.id, {
    ephemeral: ephemeral,
    timer: setTimeout(() => {
      clearEphemeralChoice(reply.id);
    }, 10 * 60 * 1000) // 20 minutes in milliseconds
  });
  }
  console.log('ephemeralChoice:', ephemeralChoice)
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isStringSelectMenu()) return;

  const { firstChoices, secondChoices, thirdChoices } = require('./SeasonalChoices.js');
  const messageChoice = messageChoices.get(interaction.message.id);
  function getLabelFromValue(choices, value) {
    const selectedChoice = choices.find(choice => choice.value === value);
    return selectedChoice ? selectedChoice.label : 'Unknown';
  }
  if (interaction.customId === 'firstChoice') {
    messageChoices.set(interaction.message.id, {
      firstChoice: interaction.values[0],
      secondChoice: null,
    });

    const selectedChoice = interaction.values[0];

    if (!secondChoices[selectedChoice]) {
      interaction.reply('Invalid choice selected.');
      return;
    }

    const secondChoiceOptions = secondChoices[selectedChoice].map(choice => ({
      label: choice.label,
      value: choice.value,
      emoji: getEmoji(choice.label),
    }));
    function getEmoji(label) {
  switch (label) {
    case 'Seasonal Quests':
      return '<:quests:1131171487877963886>';
    case 'Spirit Locations':
      return '<:location:1131173266883612722>';
    case 'Spirits Tree':
      return '<:tree:1131279758907424870>';
      case 'Seasonal Price Tree':
      return '<:tree:1131279758907424870>';
    default:
      return '';
  }
}

    secondChoiceOptions.push({
      label: 'Back',
      value: 'back',
      emoji: '⬅️',
    });

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('secondChoice')
        .setPlaceholder(`${getLabelFromValue(firstChoices, selectedChoice)}`)
        .addOptions(secondChoiceOptions)
    );

    await interaction.update({
      content: `Guides for ___${getLabelFromValue(firstChoices, selectedChoice)}___`,
      components: [row],
    });
  } else if (interaction.customId === 'secondChoice') {
    const selectedChoice = interaction.values[0];
    if (selectedChoice === 'back') {
      const dropdownOptions = firstChoices.map(choice => ({
        label: choice.label,
        value: choice.value,
        emoji: choice.emoji,
      }));

      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('firstChoice')
          .setPlaceholder('Choose a Season')
          .addOptions(dropdownOptions)
      );

      await interaction.update({
        content: 'Please select a season:',
        components: [row],
      });
      messageChoices.delete(interaction.message.id);
    } else if (selectedChoice === 'shattering_q') { 
      const response = choiceResponses.getResponse(selectedChoice);
        if (response) {
          const interactionEphemeral = ephemeralChoice.get(interaction.message.id);
          const isEphemeral = interactionEphemeral ? interactionEphemeral.ephemeral : true;
          console.log('isEphemeral:', isEphemeral);

          await interaction.deferReply({ ephemeral: isEphemeral });
      await interaction.editReply(response);
        }
          } else if (selectedChoice === 'dreams_q') { 
      const response = choiceResponses.getResponse(selectedChoice);
        if (response) {
          const interactionEphemeral = ephemeralChoice.get(interaction.message.id);
          const isEphemeral = interactionEphemeral ? interactionEphemeral.ephemeral : true;
          console.log('isEphemeral:', isEphemeral);

          await interaction.deferReply({ ephemeral: isEphemeral });
      await interaction.editReply(response);
        }
          } else {
      const thirdChoiceOptions = thirdChoices[selectedChoice].map(choice => ({
        label: choice.label,
        value: choice.value,
        emoji: choice.emoji
      }));
       
      thirdChoiceOptions.push({
        label: 'Back',
        value: 'back',
        emoji: '⬅️',
      });
     if (!messageChoice) {
          interaction.update({
            content: 'Interaction has expired, bot may have restarted. Please run the command again.',
            components: [],
          });
          return;
        }
      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('thirdChoice')
          .setPlaceholder(`${getLabelFromValue(firstChoices, messageChoice.firstChoice)} - ${getLabelFromValue(secondChoices[messageChoice.firstChoice], selectedChoice)}`)
          .addOptions(thirdChoiceOptions)
      );
      await interaction.update({
        content: `${getLabelFromValue(secondChoices[messageChoice.firstChoice], selectedChoice)} of ___${getLabelFromValue(firstChoices, messageChoice.firstChoice)}___`,
        components: [row],
      });
    }
  } else if (interaction.customId === 'thirdChoice') {
    const selectedChoice = interaction.values[0];

    let response = '';

    switch (selectedChoice) {
      case 'back': {
        if (!messageChoice) {
          interaction.update({
            content: 'Interaction has expired, bot may have restarted. Please run the command again.',
            components: [],
          });
          return;
        }

        const secondChoiceOptions = secondChoices[messageChoice.firstChoice].map(choice => ({
          label: choice.label,
          value: choice.value,
          emoji: getEmoji(choice.label),
        }));
          function getEmoji(label) {
           switch (label) {
    case 'Seasonal Quests':
      return '<:quests:1131171487877963886>';
    case 'Spirit Locations':
      return '<:location:1131173266883612722>';
    case 'Spirits Tree':
      return '<:tree:1131279758907424870>';
      case 'Seasonal Price Tree':
      return '<:tree:1131279758907424870>';
    default:
      return '';
  }
}
        secondChoiceOptions.push({
          label: 'Back',
          value: 'back',
          emoji: '⬅️',
        });

        const row = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('secondChoice')
            .setPlaceholder(`${getLabelFromValue(firstChoices, messageChoice.firstChoice)}`)
            .addOptions(secondChoiceOptions)
        );

        response = {
          content: `Guides for ___${getLabelFromValue(firstChoices, messageChoice.firstChoice)}___`,
          components: [row],
          files: [],
        };
        await interaction.update(response);

        messageChoice.secondChoice = null;
        break;
      }
      default: {
        const response = choiceResponses.getResponse(selectedChoice);
        if (response) {
          const interactionEphemeral = ephemeralChoice.get(interaction.message.id);
          const isEphemeral = interactionEphemeral ? interactionEphemeral.ephemeral : true;
          console.log('isEphemeral:', isEphemeral);

          await interaction.deferReply({ ephemeral: isEphemeral });
      await interaction.editReply(response);
        } else {
          await interaction.update('*__Under development... Thank you for your patience.__*');
        }
        break;
      }
    }
  }
});

const token = config.token;
client.login(token);