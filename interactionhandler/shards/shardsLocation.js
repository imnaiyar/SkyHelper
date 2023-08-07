const fs = require('fs');
const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const moment = require('moment-timezone');
const eventSequence = ['C', 'b', 'A', 'a', 'B', 'b', 'C', 'a', 'A', 'b', 'B', 'a'];
const secondEventSequence = ['prairie', 'forest', 'valley', 'wasteland', 'vault'];

const shardData = {
    prairie: {
        C: [
          { description: '**Shard Location: Prairie Caves, Daylight Prarie**', 
              image: 'https://media.discordapp.net/attachments/575827924343848960/1124597919178313749/01_Daylight_Prairie_-_Prairie_Caves.png' }, 
          { 
            description: '**Shard Data: Prairie Caves, Daylight Prarie**', 
            image: 'https://media.discordapp.net/attachments/1123347180988661902/1126113425286766702/dp-r_Caves.jpg' 
          }
               ],
        B: [
          { 
            description: '**Shard Location: Sanctuary Island, Daylight Prarie**', 
           image: 'https://media.discordapp.net/attachments/575827924343848960/1117348946390564934/IMG_4458.png' 
            
          }, 
         { 
           description: '**Shard Data: Sanctuary Island, Daylight Prarie**',
           image: 'https://media.discordapp.net/attachments/575827924343848960/1051464559065583637/dp-r_Sanctuary_Islands.png' 
         }
          ],
        b: [
          { 
            description: '**Shard Location: Village Island/Koi Pond, Daylight Prarie**', 
            image: 'https://media.discordapp.net/attachments/575827924343848960/1115536957875945604/01_Daylight_Prairie_-_Village_Islands_and_Koi_Pond.png' 
          }, 
         { 
           description: '**Shard Data: Village Island/Koi Pomd, Daylight Prarie**', 
          image: 'https://media.discordapp.net/attachments/575827924343848960/1049635543421550652/dp-b_Village-Koi.png' 
          }
         ],
        A: [
          {
            description: '**Shard Location: Bird\'s Nest, Daylight Prarie**', 
            image: 'https://media.discordapp.net/attachments/575827924343848960/1109738791268257812/01_Daylight_Prairie_-_Birds_Nest.png' 
          }, 
          { 
              description: '**Shard Data: Bird\'s Nest, Daylight Prarie**', 
              image: 'https://media.discordapp.net/attachments/575827924343848960/1044197796577824839/dp-r_Bird_Nest.png' 
          }
            ],
        a: [
          {
            description: '**Shard Location: Butterfly Fields, Daylight Prarie**', 
            image: 'https://media.discordapp.net/attachments/575827924343848960/1119162577126178846/01_Daylight_Prairie_-_Butterfly_Field.png' 
          }, 
          {
            description: '**Shard Data: Butterfly Fields, Daylight Prarie**', 
            image: 'https://media.discordapp.net/attachments/575827924343848960/1053249686422687784/dp-b_Butterfly_Field.png' 
          }
          ],
    },
    forest: {
        C: [
          { description: '**Shard Location: Forest End, Hidden Forest**', 
              image: 'https://media.discordapp.net/attachments/575827924343848960/1115899669847998526/02_Hidden_Forest_-_Forest_End.png' }, 
          { 
            description: '**Shard Data: Forest End, Hidden Forest**', 
            image: 'https://media.discordapp.net/attachments/575827924343848960/1050078656015376496/hf-r_Forest_End.png' 
          }
               ],
        B: [
          { 
            description: '**Shard Location: Elevated Clearing(Sunny Forest), Hidden Forest**', 
           image: 'https://media.discordapp.net/attachments/575827924343848960/1119522919983349780/02_Hidden_Forest_-_Elevated_Clearing.png' 
            
          }, 
         { 
           description: '**Shard Data: Elevated Clearing(Sunny Forest), Hidden Forest**',
           image: 'https://media.discordapp.net/attachments/575827924343848960/1053645676870897724/hf-r_Elevated_Clearing.png' 
         }
          ],
        b: [
          { 
            description: '**Shard Location: Broken Bridge/Boneyard, Hidden Forest**', 
            image: 'https://media.discordapp.net/attachments/575827924343848960/1121336759633059890/02_Hidden_Forest_-_Broken_Bridge.png' 
          }, 
         { 
           description: '**Shard Data: Broken Bridge/Boneyard, Hidden Forest**', 
          image: 'https://media.discordapp.net/attachments/575827924343848960/1048189111145603072/hf-b_Boneyard.png' 
          }
         ],
        A: [
          {
            description: '**Shard Location: Treehouse, Hidden Forest**', 
            image: 'https://media.discordapp.net/attachments/575827924343848960/1111912764420665394/02_Hidden_Forest_-_Assembly_Treehouse.png' 
          }, { 
              description: '**Shard Data: Treehouse, Hidden Forest**', 
              image: 'https://media.discordapp.net/attachments/575827924343848960/1046371999586451597/png_20221027_180854_0000.png' 
          }
            ],
        a: [
          {
            description: '**Shard Location: Forest Brook, Hidden Forest**', 
            image: 'https://media.discordapp.net/attachments/575827924343848960/1117712849217781871/IMG_3543.png' 
          }, 
          {
            description: '**Shard Data: Forest Brook, Hidden Forest**', 
            image: 'https://media.discordapp.net/attachments/575827924343848960/1051802895634399242/hf-b_Forest_Brook.png' 
          }
          ],
    },
    valley: {
        C: [
          { description: '**Shard Location: Village of Dreams, Valley of Triumph**', 
              image: 'https://media.discordapp.net/attachments/575827924343848960/1114449712070799360/03_Valley_of_Triumph_-_Village_of_Dreams.png' }, 
          { 
            description: '**Shard Data: Village of Dreams, Valley of Triumph**', 
            image: 'https://media.discordapp.net/attachments/575827924343848960/1048546903702384721/vt-r_Village_of_Dreams.png' 
          }
               ],
        B: [
          { 
            description: '**Shard Location: Hermits Valley, Valley of Triumph**', 
           image: 'https://media.discordapp.net/attachments/575827924343848960/1110464646911115314/03_Valley_of_Triumph_-_Hermit_Valley.png' 
            
          }, 
         { 
           description: '**Shard Data: Hermits Valley, Valley of Triumph**',
           image: 'https://media.discordapp.net/attachments/575827924343848960/1055814361026936952/vt-r_Hermit_Valley.png' 
         }
          ],
        b: [
          { 
            description: '**Shard Location: Ice Rink, Valley of Triumph**', 
            image: 'https://media.discordapp.net/attachments/575827924343848960/1116263531101306940/03_Valley_of_Triumph_-_Ice_Rink.png' 
          }, 
         { 
           description: '**Shard Data: Ice Rink, Valley of Triumph**', 
          image: 'https://media.discordapp.net/attachments/575827924343848960/1050351219383730186/vt-b_Ice_Rink.png' 
          }
         ],
        A: [
          {
            description: '**Shard Location: Village of Dreams, Valley of Triumph**', 
            image: 'https://media.discordapp.net/attachments/575827924343848960/1114449712070799360/03_Valley_of_Triumph_-_Village_of_Dreams.png' 
          }, { 
              description: '**Shard Data: Village of Dreams, Valley of Triumph**', 
              image: 'https://media.discordapp.net/attachments/575827924343848960/1048546903702384721/vt-r_Village_of_Dreams.png' 
          }
            ],
        a: [
          {
            description: '**Shard Location: Ice Rink, Valley of Triumph**', 
            image: 'https://media.discordapp.net/attachments/575827924343848960/1116263531101306940/03_Valley_of_Triumph_-_Ice_Rink.png' 
          }, 
          {
            description: '**Shard Data: Ice Rink, Valley of Triumph**', 
            image: 'https://media.discordapp.net/attachments/575827924343848960/1050351219383730186/vt-b_Ice_Rink.png' 
          }
          ],
    },
    wasteland: {
        C: [
          { description: '**Shard Location: Graveyard, Golden Wasteland**', 
              image: 'https://media.discordapp.net/attachments/575827924343848960/1109015846753419294/04_Golden_Wasteland_-_Graveyard.png' }, 
          { 
            description: '**Shard Data: Graveyard, Golden Wasteland**', 
            image: 'https://media.discordapp.net/attachments/575827924343848960/1043553879289253919/gw-r_Graveyard.png' 
          }
               ],
        B: [
          { 
            description: '**Shard Location: Forgotten Ark, Golden Wasteland**', 
           image: 'https://media.discordapp.net/attachments/575827924343848960/1069221627918827622/Forgotten_Ark_1.png' 
            
          }, 
         { 
           description: '**Shard Data: Forgotten Ark, Golden Wasteland**',
           image: 'https://media.discordapp.net/attachments/575827924343848960/1112639178048548884/IMG_3148.png' 
         }
          ],
        b: [
          { 
            description: '**Shard Location: Battlefield, Golden Wasteland**', 
            image: 'https://media.discordapp.net/attachments/575827924343848960/1118435910615302164/04_Golden_Wasteland_-_Battlefield.png' 
          }, 
         { 
           description: '**Shard Data: Battlefield, Golden Wasteland**', 
          image: 'https://media.discordapp.net/attachments/575827924343848960/1052530499668688957/gw-b_Battlefield.png' 
          }
         ],
        A: [
          {
            description: '**Shard Location: Crab Fields/Shipwreck, Golden Wasteland**', 
            image: 'https://media.discordapp.net/attachments/575827924343848960/1094518173262417990/04_Golden_Wasteland_-_Crab_Fields.png' 
          }, { 
              description: '**Shard Data: Crab Fields, Golden Wasteland**', 
              image: 'https://media.discordapp.net/attachments/575827924343848960/1050722076681568256/gw-r_Shipwreck.png' 
          }
            ],
        a: [
          {
            description: '**Shard Location: Broken Temple, Golden Wasteland**', 
           image: 'https://media.discordapp.net/attachments/575827924343848960/1125685677384806531/04_Golden_Wasteland_-_Broken_Temple.png',
          }, 
          {
            description: '**Shard Data: , Broken Temple Golden Wasteland**', 
            image: 'https://media.discordapp.net/attachments/575827924343848960/1045297714474254396/gw-b_Broken_Temple.png',
          }
          ],
    },
    vault: {
        C: [
          { description: '**Shard Location: Jellyfish Cove, Vault of Knowledge**', 
              image: 'https://media.discordapp.net/attachments/575827924343848960/1089082330305544242/05_Vault_of_Knowledge_-_Jellyfish_Cove.png' }, 
          { 
            description: '**Shard Data: Jellyfish Cove, Vault of Knowledge**', 
            image: 'https://media.discordapp.net/attachments/575827924343848960/1049290746190106694/vk-r_Starlight_Desert.png' 
          }
               ],
        B: [
          { 
            description: '**Shard Location: Jellyfish Cove, Vault of Knowledge**', 
           image: 'https://media.discordapp.net/attachments/575827924343848960/1089082330305544242/05_Vault_of_Knowledge_-_Jellyfish_Cove.png' 
            
          }, 
         { 
           description: '**Shard Data: Jellyfish Cove, Vault of Knowledge**',
           image: 'https://media.discordapp.net/attachments/575827924343848960/1049290746190106694/vk-r_Starlight_Desert.png' 
         }
          ],
        b: [
          { 
            description: '**Shard Location: Starlight Desert, Vault of Knowledge**', 
            image: 'https://media.discordapp.net/attachments/575827924343848960/1090896818604347392/IMG_1525.png' 
          }, 
         { 
           description: '**Shard Data: Starlight Desert, Vault of Knowledge**', 
          image: 'https://media.discordapp.net/attachments/575827924343848960/1077178980051984455/vk-b_Starlight_Desert.png' 
          }
         ],
        A: [
          {
            description: '**Shard Location: Jellyfish Cove, Vault of Knowledge**', 
            image: 'https://media.discordapp.net/attachments/575827924343848960/1089082330305544242/05_Vault_of_Knowledge_-_Jellyfish_Cove.png' 
          }, { 
              description: '**Shard Data: Jellyfish Cove, Vault of Knowledge**', 
              image: 'https://media.discordapp.net/attachments/575827924343848960/1049290746190106694/vk-r_Starlight_Desert.png' 
          }
            ],
        a: [
          {
            description: '**Shard Location: Starlight Desert, Vault of Knowledge**', 
            image: 'https://media.discordapp.net/attachments/575827924343848960/1090896818604347392/IMG_1525.png' 
          }, 
          {
            description: '**Shard Data: Starlight Desert, Vault of Knowledge**', 
            image: 'https://media.discordapp.net/attachments/575827924343848960/1077178980051984455/vk-b_Starlight_Desert.png' 
          }
          ],
    },
};

const MAX_SHARD_INDEX = 1; // Two results for each event, so the max shard index is 1
let currentShardIndex = 0;
let originalEmbedData = null;
let originalActionRow = null;

const timezone = 'America/Los_Angeles';

// Map to store interactions and their corresponding shard embeds

async function shardLocation(interaction, Gale, Clement) {
    if (!interaction.isButton()) return;

    const messageId = interaction.message.id; // Get the messageId of the current interaction
  const currentDate = getCurrentDate(interaction, messageId);
  if (!currentDate) return;
    const dayOfMonth = currentDate.date();
    const sequenceIndex = (dayOfMonth - 1) % eventSequence.length;
    const currentEvent = eventSequence[sequenceIndex];

    // Retrieve the current second event for the day
    const secondSequenceIndex = (dayOfMonth - 1) % secondEventSequence.length;
    const currentSecondEvent = secondEventSequence[secondSequenceIndex];

    if (interaction.customId === 'shard_location') {
        currentShardIndex = 0;
        originalEmbedData = interaction.message.embeds[0];
        originalActionRow = interaction.message.components?.[0];
        await showShard(interaction, shardData[currentSecondEvent][currentEvent][currentShardIndex], Gale, Clement);
    } else if (interaction.customId === 'shard_leftL') {
        currentShardIndex = Math.max(currentShardIndex - 1, 0);
        await showShard(interaction, shardData[currentSecondEvent][currentEvent][currentShardIndex], Gale, Clement);
    } else if (interaction.customId === 'shard_rightL') {
        currentShardIndex = Math.min(currentShardIndex + 1, MAX_SHARD_INDEX);
        await showShard(interaction, shardData[currentSecondEvent][currentEvent][currentShardIndex], Gale, Clement);
    } else if (interaction.customId === 'shard_originalL') {
        if (originalEmbedData) {
            await interaction.update({ embeds: [originalEmbedData], components: [originalActionRow] });
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

async function showShard(interaction, shard, Gale, Clement) {
      const clementIcon = Clement.avatarURL({ format: 'png', size: 2048 });
  const galeIcon = Gale.avatarURL({ format: 'png', size: 2048 });


  const authorName = currentShardIndex === 0 ? `Shard location by Clement  (${Clement.username})` : `Shard data by Gale (${Gale.username})`;
  const authorIcon = currentShardIndex === 0 ? clementIcon : galeIcon;

    const shardEmbed = {
        title: shard.title,
        description: shard.description,
        color: parseInt('00ff00', 16),
        footer: { text: `Page ${currentShardIndex + 1} of ${MAX_SHARD_INDEX + 1} | Sky Shards Information`, icon_url: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' },
        author: {
      name: authorName,
      icon_url: authorIcon,
    },
    image: {
            url: shard.image
        },
    };

    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel('Location')
                .setCustomId('shard_leftL')
                .setStyle('1'),
            new ButtonBuilder()
                .setLabel('Data')
                .setCustomId('shard_rightL')
                .setStyle('1'),
            new ButtonBuilder()
                .setLabel('🔙')
                .setCustomId('shard_originalL')
                .setStyle(3)
        );

    // Disable navigation buttons if the current shard is the first or last
    if (currentShardIndex === 0) {
        actionRow.components[0].setDisabled(true);
    }
    if (currentShardIndex === MAX_SHARD_INDEX) {
        actionRow.components[1].setDisabled(true);
    }

    await interaction.update({ embeds: [shardEmbed], components: [actionRow] });
}

module.exports = {
    shardLocation,
};
