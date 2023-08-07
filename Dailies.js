const { Client, GatewayIntentBits, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const fs = require('fs');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
const config = require('./config.json');

// Specify the ID of the channel you want to track
const channelIdToTrack = '867638574571323425';

// Data structure to store messages and attachments for each day
const messagesByDay = new Map();

// Function to save a message and its attachments to the data structure
function saveMessage(message) {
  const today = new Date().toISOString().slice(0, 10); // Get current date in YYYY-MM-DD format
  const messages = messagesByDay.get(today) || [];
  messages.push(message);
  messagesByDay.set(today, messages);
}

client.on('messageCreate', message => {
  // Ignore messages from bots and messages sent in channels other than the specified one
  if (message.author.bot || message.channel.id !== channelIdToTrack) return;

  // Save the message and its attachments to the data structure
  saveMessage({
    content: message.content,
    attachments: message.attachments.map(attachment => attachment.url),
    timestamp: message.createdTimestamp,
  });
  console.log('Message:', messagesByDay)
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  // Check if the command is the one you want to trigger the response
  if (interaction.commandName === 'test') {
    const today = new Date().toISOString().slice(0, 10); // Get current date in YYYY-MM-DD format
    const messages = messagesByDay.get(today) || [];

    // Create select menu options for each message
    const dropdownOptions = [];
    let numDailyQuests = 0;

    messages.forEach((msg, index) => {
      const firstSentence = msg.content.replace(/(https?:\/\/[^\s]+)|<:[^>]+>/g, ''); // Remove URLs and emojis
      const firstPeriodIndex = firstSentence.indexOf('.');
      const label = firstPeriodIndex !== -1 ? firstSentence.slice(0, firstPeriodIndex + 1) : firstSentence;

      if (index === 0) {
        // The first message will be labeled as "Daily Quests"
        dropdownOptions.push({
          label: 'Daily Quests',
          value: index.toString(),
        });
      } else {
        // Subsequent messages will be labeled as "Daily Quest [Number]"
        numDailyQuests++;
        dropdownOptions.push({
          label: `Daily Quest ${numDailyQuests}`,
          value: index.toString(),
        });
      }
    });

    // The last option will be labeled as "Shattering Shard Summary"
    dropdownOptions.push({
      label: 'Shattering Shard Summary',
      value: 'summary',
    });

    // Create the select menu with the options
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('selectMessage')
      .setPlaceholder('Select a message:')
      .addOptions(dropdownOptions);

    // Create the ActionRow that contains the select menu
    const row = new ActionRowBuilder().addComponents(selectMenu);

    // Send the initial response with the select menu
    await interaction.reply({
      content: 'Choose a message:',
      components: [row],
    });
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isStringSelectMenu()) return;

  // Check if the select menu is the one you created
  if (interaction.customId === 'selectMessage') {
    const today = new Date().toISOString().slice(0, 10); // Get current date in YYYY-MM-DD format
    const messages = messagesByDay.get(today) || [];
    const selectedValue = interaction.values[0];

    if (selectedValue === 'summary') {
      // The user selected "Shattering Shard Summary"
      await interaction.reply({
        content: 'Summary will be provided here.', // Replace with the actual summary content
        ephemeral: true,
      });
      return;
    }

    const selectedMessageIndex = parseInt(selectedValue);

    // Check if the selected index is valid
    if (selectedMessageIndex < 0 || selectedMessageIndex >= messages.length) {
      await interaction.reply('Invalid selection.');
      return;
    }

    // Get the selected message and send it as the final response
    const selectedMessage = messages[selectedMessageIndex];
    await interaction.reply({
      content: `Selected message:\nContent: ${selectedMessage.content}\nAttachments: ${selectedMessage.attachments.join(', ')}`,
      ephemeral: true,
    });
  }
});

const token = config.token;
client.login(token);
