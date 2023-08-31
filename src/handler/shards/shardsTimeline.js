const fs = require('fs');
const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const moment = require('moment-timezone');
const eventSequence = ['C', 'b', 'A', 'a', 'B', 'b', 'C', 'a', 'A', 'b', 'B', 'a'];; // Remove the repeating part
const secondEventSequence = ['prairie', 'forest', 'valley', 'wasteland', 'vault'];

const shardData = {
    'C': [
        { title: '1st Shard',
         earlySky:'Sky colour of all the realm changes once the shard nears landing. These changes happen **7 hours**, **07 minutes** and **50 seconds** after reset\nYour time: <t:1672582070:T>',
         gateShard:'Shard crystals on realm doors indicating their location. They appear **7 hours** and **40 minutes** after reset.\nYour time: <t:1672584000:t>',
         shardLand: '1st shard lands **7 hours**, **48 minutes** and **40 seconds** after reset\nYour Time: <t:1672584520:T>',
         shardEnd: '1st shard ends **11 hours** and **40 minutes** after reset.\n Your time: <t:1672598400:t>',
         shardMusic: '\'**Lights Afar**\' Music will play during this shard.'
        },
        { title: '2nd Shard',
         earlySky: 'Sky color of all the realm changes once the shard nears landing. These changes happen **13 hours**, **07 minutes** and **50 seconds** after reset.\nYour Time: <t:1672603670:T>',
         gateShard: 'Shard crystals on realm doors indicating their location. They appear **13 hours** and **40 minutes** after reset\nYour time: <t:1672605600:t>',
         shardLand: '2nd shard lands **13 hours**, **48 minutes** and **40 seconds** after reset.\nYour time:<t:1672606120:T>',
         shardEnd: '2nd Shard ends **17 hours** and **40 minutes** after reset. \nYour time:<t:1672620000:t>',
         shardMusic: '\'Lights Afar\' Music will play during this shard.'
        },
        { title: '3rd Shard',
          earlySky: 'Sky color of all the realm changes once the shard nears landing. These changes happen **19 hours**, **07 minutes** and **50 seconds** after reset.\nYour Time: <t:1672625270:T>',
          gateShard: 'Shard crystals on realm doors indicating their location. They appear **19 hours** and **40 minutes** after reset.\nYour time: <t:1672627200:t>',
          shardLand: '3rd shard lands **19 hours**, **48 minutes** and **40 seconds** after reset.\nYour Time: <t:1672627720:T>',
          shardEnd: 'All shards ends **23 hours** and **40 minutes** after reset\nYour time: <t:1672641600:t>',
          shardMusic: '\'Lights Afar\' Music will play during this shard.'
        },
    ],
    'b': [
        { title: '1st Shard',
          earlySky: 'Sky colour of all the realm changes once the shard nears landing. These changes happen **1 hours**, **37 minutes** and **50 seconds** after reset\nYour time: <t:1686127070:T>',
          gateShard: 'Shard crystals on realm doors indicating their location. They appear **2 hours** and **10 minutes** after reset.\nYour time: <t:1686129000:t>',
          shardLand: '1st shard lands **2 hours**, **18 minutes** and **40 seconds** after reset\nYour Time: <t:1686129520:T>',
          shardEnd: '1st Shard ends **6 hours** and **10 minutes** after reset  \nYour time:<t:1686143400:t>',
          shardMusic: '\'**An Abrupt Premonition**\' Music will play during this shard.'
         },
        { title: '2nd Shard ', 
          earlySky: 'Sky colour of all the realm changes once the shard nears landing. These changes happen **9 hours**, **37 minutes** and **50 seconds** after reset\nYour time: <t:1686155870:T>',
          gateShard:'Shard crystals on realm doors indicating their location. They appear **10 hours** and **10 minutes** after reset.\nYour time: <t:1686157800:t>',
          shardLand: '2nd shard lands **10 hours**, **18 minutes** and **40 seconds** after reset\nYour Time: <t:1686158320:T>',
          shardEnd: '2nd Shard ends **14 hours** and **10 minutes** after reset.\nYour time:<t:1686172200:t>',
          shardMusic: '\'**An Abrupt Premonition**\' Music will play during this shard.'
         },
        { title: '3rd Shard',
          earlySky: 'Sky colour of all the realm changes once the shard nears landing. These changes happen **17 hours**, **37 minutes** and **50 seconds** after reset\nYour time: <t:1686184670:T>',
          gateShard: 'Shard crystals on realm doors indicating their location. They appear **18 hours** and **10 minutes** after reset.\nYour time: <t:1686186600:t>',
          shardLand: '3rd shard lands **18 hours**, **18 minutes** and **40 seconds** after reset\nYour Time: <t:1686187120:T>',
          shardEnd: '3rd Shard ends **22 hours** and **10 minutes** after reset.\nYour time:<t:1686201000:t>',
          shardMusic: '\'**An Abrupt Premonition**\' Music will play during this shard.'
         },
    ],
    'A': [
        { title: '1st Shard',
          earlySky: 'Sky colour of all the realm changes once the shard nears landing. These changes happen **1 hours**, **47 minutes** and **50 seconds** after reset\nYour time: <t:1686127670:T>',
          gateShard: 'Shard crystals on realm doors indicating their location. They appear **2 hours** and **20 minutes** after reset.\nYour time: <t:1686129600:t>',
          shardLand: '1st shard lands **2 hours**, **28 minutes** and **40 seconds** after reset\nYour Time: <t:1686130120:T>',
          shardEnd: '1st Shard ends **6 hours** and **20 minutes** after reset.\nYour time:<t:1686144000:t>',
          shardMusic: '\'**Lights Afar**\' Music will play during this shard.'
         },
        { title: '2nd Shard',
          earlySky: 'Sky colour of all the realm changes once the shard nears landing. These changes happen **7 hours**, **47 minutes** and **50 seconds** after reset\nYour time: <t:1686149270:T>',
          gateShard: 'Shard crystals on realm doors indicating their location. They appear **8 hours** and **20 minutes** after reset.\nYour time: <t:1686151200:t>',
          shardLand: '2nd shard lands **8 hours**, **28 minutes** and **40 seconds** after reset\nYour Time: <t:1686151720:T>',
          shardEnd: '2nd Shard ends **12 hours** and **20 minutes** after reset.\nYour time:<t:1686165600:t>',
          shardMusic: '\'**Lights Afar**\' Music will play during this shard.'
         },
        { title: '3rd Shard',
          earlySky: 'Sky colour of all the realm changes once the shard nears landing. These changes happen **13 hours**, **47 minutes** and **50 seconds** after reset\nYour time: <t:1686170870:T>',
          gateShard: 'Shard crystals on realm doors indicating their location. They appear **14 hours** and **20 minutes** after reset.\nYour time: <t:1686172800:t>',
          shardLand: '3rd shard lands **14 hours**, **28 minutes** and **40 seconds** after reset\nYour Time: <t:1686173320:T>',
          shardEnd: '3rd Shard ends **18 hours** and **20 minutes** after reset.\nYour time:<t:1686187200:t>',
          shardMusic: '\'**Lights Afar**\' Music will play during this shard.'
         },
    ],
    'a': [
        { title: '1st Shard ',
          earlySky: 'Sky colour of all the realm changes once the shard nears landing. These changes happen **1 hours**, **17 minutes** and **50 seconds** after reset\nYour time: <t:1686125870:T>',
          gateShard: 'Shard crystals on realm doors indicating their location. They appear **1 hours** and **50 minutes** after reset.\nYour time: <t:1686127800:t>',
          shardLand: '1st shard lands **1 hours**, **58 minutes** and **40 seconds** after reset\nYour Time: <t:1686128320:T>',
          shardEnd: '1st Shard ends **5 hours** and **50 minutes** after reset.\nYour time:<t:1686142200:t>',
          shardMusic: '\'**An Abrupt Premonition**\' Music will play during this shard.'
        },
        { title: '2nd Shard ',
          earlySky: 'Sky colour of all the realm changes once the shard nears landing. These changes happen **9 hours**, **17 minutes** and **50 seconds** after reset\nYour time: <t:1686154670:T>',
          gateShard: 'Shard crystals on realm doors indicating their location. They appear **9 hours** and **50 minutes** after reset.\nYour time: <t:1686156600:t>',
          shardLand: '2nd shard lands **9 hours**, **58 minutes** and **40 seconds** after reset\nYour Time: <t:1686157120:T>',
          shardEnd: '2nd Shard ends **13 hours** and **50 minutes** after reset.\nYour time:<t:1686171000:t>',
          shardMusic: '\'**An Abrupt Premonition**\' Music will play during this shard.'
        },
        { title: '3rd Shard ',
          earlySky: 'Sky colour of all the realm changes once the shard nears landing. These changes happen **17 hours**, **17 minutes** and **50 seconds** after reset\nYour time: <t:1686183470:T>',
          gateShard: 'Shard crystals on realm doors indicating their location. They appear **17 hours** and **50 minutes** after reset.\nYour time: <t:1686185400:t>',
          shardLand: '3rd shard lands **17 hours**, **58 minutes** and **40 seconds** after reset\nYour Time: <t:1686185920:T>',
          shardEnd: '3rd Shard ends **21 hours** and **50 minutes** after reset. \nYour time:<t:1686199800:t>',
          shardMusic: '\'**An Abrupt Premonition**\' Music will play during this shard.'
        },
    ],
    'B': [
        { title: '1st Shard ', 
          earlySky: 'Sky colour of all the realm changes once the shard nears landing. These changes happen **2 hours**, **57 minutes** and **50 seconds** after reset\nYour time: <t:1686131870:T>',
          gateShard: 'Shard crystals on realm doors indicating their location. They appear **3 hours** and **30 minutes** after reset.\nYour time: <t:1686133800:t>',
          shardLand: '1st shard lands **3 hours**, **38 minutes** and **40 seconds** after reset\nYour Time: <t:1686134320:T>',
          shardEnd: '1st Shard ends **7 hours** and **30 minutes**.\nYour time:<t:1686148200:t>',
          shardMusic: '\'**Of The Essence**\' Music will play during this shard.'
         },
        { title: '2nd Shard ',
          earlySky: 'Sky colour of all the realm changes once the shard nears landing. These changes happen **8 hours**, **57 minutes** and **50 seconds** after reset\nYour time: <t:1686153470:T>',
          gateShard: 'Shard crystals on realm doors indicating their location. They appear **9 hours** and **30 minutes** after reset.\nYour time: <t:1686155400:t>',
          shardLand: '1st shard lands **9 hours**, **38 minutes** and **40 seconds** after reset\nYour Time: <t:1686155920:T>',
          shardEnd: '2nd Shard ends **13 hours** and **30 minutes** after reset.\nYour time:<t:1686169800:t>',
          shardMusic: '\'**Of The Essence**\' Music will play during this shard.'
         },
        { title: '3rd Shard ',
          earlySky: 'Sky colour of all the realm changes once the shard nears landing. These changes happen **14 hours**, **57 minutes** and **50 seconds** after reset\nYour time: <t:1686175070:T>',
          gateShard: 'Shard crystals on realm doors indicating their location. They appear **15 hours** and **30 minutes** after reset.\nYour time: <t:1686177000:t>',
          shardLand: '3rd shard lands **15 hours**, **38 minutes** and **40 seconds** after reset\nYour Time: <t:1686177520:T>',
          shardEnd: '3rd Shard ends **19 hours** and **30 minutes** after reset.\nYour time:<t:1686191400:t>',
          shardMusic: '\'**Of The Essence**\' Music will play during this shard.'
         },
    ],
};

const MAX_SHARD_INDEX = 2; // 3 results for each event, so the max shard index is 2
let currentShardIndex = 0;
let originalEmbedData = null;
let originalActionRow = null;
let buttonDisableTimeout = null;

const timezone = 'America/Los_Angeles';

// Map to store interactions and their corresponding shard embeds

async function shardTimeline(interaction, Zhii, Christian) {
  if (!interaction.isButton()) return;

  const messageId = interaction.message.id; // Get the messageId of the current interaction
  const currentDate = getCurrentDate(interaction, messageId); 
  if (!currentDate) return;
  const dayOfMonth = currentDate.date();
  const sequenceIndex = (dayOfMonth - 1) % eventSequence.length;
  const currentEvent = eventSequence[sequenceIndex];

  clearTimeout(buttonDisableTimeout);

  if (interaction.customId === 'shard_timeline') {
    currentShardIndex = 0;
    originalEmbedData = interaction.message.embeds[0];
    originalActionRow = interaction.message.components?.[0];
    await saveOriginalData(messageId, originalEmbedData, originalActionRow);
    await showShard(interaction, shardData[currentEvent][currentShardIndex], Zhii, Christian);
  } else if (interaction.customId === 'shard_left') {
    currentShardIndex = Math.max(currentShardIndex - 1, 0);
    await showShard(interaction, shardData[currentEvent][currentShardIndex], Zhii, Christian);
  } else if (interaction.customId === 'shard_right') {
    currentShardIndex = Math.min(currentShardIndex + 1, MAX_SHARD_INDEX);
    await showShard(interaction, shardData[currentEvent][currentShardIndex], Zhii, Christian);
  } else if (interaction.customId === 'shard_original') {
    const restoredData = restoreOriginalData(interaction.message.id);
      if (restoredData) {
          await interaction.update({ embeds: [restoredData.originalEmbedData], components: [restoredData.originalActionRow] });
      
    }
  }
}


    
  function getCurrentDate(interaction, messageId) {
  const filePath = 'messageData.json';

  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const messageData = JSON.parse(data);
    const message = messageData.find((data) => data.messageId === messageId);

    if (!message) {
      interaction.reply({ content: 'No dates found for this message. The interaction might be expired, please run the command again', ephemeral: true});
      return false;
    }

    const dateOption = message.time;

    let currentDate;
    if (dateOption) {
      currentDate = moment.tz(dateOption, 'Y-MM-DD', timezone).startOf('day');
      if (!currentDate.isValid()) {
        console.log(`${dateOption} does not exist, please provide a valid date.`);
        return null;
      }
    } else {
      currentDate = moment.tz(timezone).startOf('day');
    }

    return currentDate;
  } catch (error) {
    console.error('Error reading messageData.json:', error);
  }
}
async function showShard(interaction, shard, Zhii, Christian) {
  const avatarURL1 = Zhii.avatarURL({ format: 'png', size: 2048 });
  const avatarURL2 = Christian.avatarURL({ format: 'png', size: 2048 });
    const shardEmbed = {
        title: shard.title,
        description: shard.description,
        color: parseInt('00ff00', 16),
        footer: { text: `Sky changes and Shard music by Christian(${Christian.username}) | Page ${currentShardIndex + 1} of ${MAX_SHARD_INDEX + 1}`, icon_url: `${avatarURL2}` },
        fields: [
            {
                name: 'Early Sky Change',
                value: shard.earlySky,
            },            
            {
                name: 'Gate Shard',
                value: shard.gateShard,
            },           
            {
                name: 'Shard Landing',
                value: shard.shardLand,
            },
            {
                name: 'End of Shard',
                value: shard.shardEnd,
            },          
            {
                name: 'Shard Music',
                value: shard.shardMusic,
            },
        ],
        author: {
            name: `Shards Timestamp by Zhii(${Zhii.username})`,
            icon_url: `${avatarURL1}`,
        },
    };

    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel('⬅️')
                .setCustomId('shard_left')
                .setStyle('1'),
            new ButtonBuilder()
                .setLabel('➡️')
                .setCustomId('shard_right')
                .setStyle('1'),
            new ButtonBuilder()
                .setLabel('🔙')
                .setCustomId('shard_original')
                .setStyle(3)
                .setDisabled(false),
        );
if (currentShardIndex === 0) {
        actionRow.components[0].setDisabled(true);
    }
    if (currentShardIndex === MAX_SHARD_INDEX) {
        actionRow.components[1].setDisabled(true);
    }
    await interaction.update({ embeds: [shardEmbed], components: [actionRow] });
}
function saveOriginalData(messageId, originalEmbedData, originalActionRow) {
  try {
      const filePath = 'embedData.json';
      const data = fs.readFileSync(filePath, 'utf8');
      const embedData = JSON.parse(data);

      if (!embedData[messageId]) {
          embedData[messageId] = {
              originalEmbedData,
              originalActionRow
          };

          fs.writeFileSync(filePath, JSON.stringify(embedData, null, 2), 'utf8');
      }
  } catch (error) {
      console.error('Error saving original data:', error);
  }
}
function restoreOriginalData(messageId) {
  try {
      const filePath = 'embedData.json';
      const data = fs.readFileSync(filePath, 'utf8');
      const embedData = JSON.parse(data);

      if (embedData[messageId]) {
          return embedData[messageId];
      }
  } catch (error) {
      console.error('Error restoring original data:', error);
  }
  
  return null;
}
module.exports = {
    shardTimeline,
};
