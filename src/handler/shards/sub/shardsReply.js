
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');  
const Logger = require('@src/logger')
const fs = require('fs');
const moment = require('moment');

async function shardsReply (interaction,currentDate, formatDate, eventStatus,timeRemaining, currentEvent, currentSecondEvent, dayOfWeek, noShard) {
const timezone = 'America/Los_Angeles';
const messageDataFile = 'messageData.json';
    let result = '';
    let showButtons = true;

    if (currentSecondEvent === 'prairie') {
        if (currentEvent === 'a' && ![6, 0].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#000000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Black Shard', inline: true })

            .addFields({ name: 'Location', value: 'Butterfly Fields, Daylight Prairie', inline: true })

             .addFields({ name: 'Rewards', value: '200 Wax <:wax:1125091974869946369>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'A' && ![2, 3].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#FF0000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Red Shard', inline: true })

            .addFields({ name: 'Location', value: 'Bird\'s Nest, Daylight Prairie', inline: true })

             .addFields({ name: 'Rewards', value: '2.5 AC <a:ac5:1125338720183267390>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'b' && ![0, 1].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#000000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Black Shard', inline: true })

            .addFields({ name: 'Location', value: 'Village Island, Daylight Prairie', inline: true })

             .addFields({ name: 'Rewards', value: '200 Wax <:wax:1125091974869946369>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'B' && ![3, 4].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#FF0000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Red Shard', inline: true })

            .addFields({ name: 'Location', value: 'Sanctuary Island, Daylight Prairie', inline: true })

             .addFields({ name: 'Rewards', value: '3.5 AC <a:ac5:1125338720183267390>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'C' && ![1, 2].includes(dayOfWeek)) {
            result = new EmbedBuilder()

             .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

             .setTimestamp(Date.now())

             .setColor('#FF0000')

             .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

              .addFields({ name: 'Shard Info', value: 'Red Shard', inline: true })

             .addFields({ name: 'Location', value: 'Pararie Caves, Daylight Parairies', inline: true })

              .addFields({ name: 'Rewards', value: '2 AC <a:ac5:1125338720183267390>', inline: true })

             .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});
        } else {
            result = new EmbedBuilder()

               .setAuthor({ name: `There is no shard ${noShard}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})
               .setColor('#808080');
          showButtons = false;
;
        }
    } else if (currentSecondEvent === 'forest') {
        if (currentEvent === 'a' && ![6, 0].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#000000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Black Shard', inline: true })

            .addFields({ name: 'Location', value: 'Forest Brook, Hidden Forest', inline: true })

             .addFields({ name: 'Rewards', value: '200 Wax <:wax:1125091974869946369>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'A' && ![2, 3].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#FF0000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Red Shard', inline: true })

            .addFields({ name: 'Location', value: 'Treehouse, Hidden Forest', inline: true })

             .addFields({ name: 'Rewards', value: '3.5 AC <a:ac5:1125338720183267390>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'b' && ![0, 1].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#000000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Black Shard', inline: true })

            .addFields({ name: 'Location', value: 'Boneyard, Hidden Forest', inline: true })

             .addFields({ name: 'Rewards', value: '200 Wax <:wax:1125091974869946369>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'B' && ![3, 4].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#FF0000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Red Shard', inline: true })

            .addFields({ name: 'Location', value: 'Sunny Forest, Hidden Forest', inline: true })

             .addFields({ name: 'Rewards', value: '3.5 AC <a:ac5:1125338720183267390>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'C' && ![1, 2].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#FF0000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Red Shard', inline: true })

            .addFields({ name: 'Location', value: 'Forest End, Hidden Forest', inline: true })

             .addFields({ name: 'Rewards', value: '2.5 AC <a:ac5:1125338720183267390>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else {
            result = new EmbedBuilder()
                .setAuthor({ name: `There is no shard ${noShard}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})
                .setColor('#808080');
            showButtons = false;
          }
    } else if (currentSecondEvent === 'valley') {
        if (currentEvent === 'a' && ![6, 0].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#000000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Black Shard', inline: true })

            .addFields({ name: 'Location', value: 'Ice Rink, Valley of Triumph', inline: true })

             .addFields({ name: 'Rewards', value: '200 Wax <:wax:1125091974869946369>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'A' && ![2, 3].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#FF0000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Red Shard', inline: true })

            .addFields({ name: 'Location', value: 'Village of Dreams, Valley of Triumph', inline: true })

             .addFields({ name: 'Rewards', value: '2.5 AC <a:ac5:1125338720183267390>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'b' && ![0, 1].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#000000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Black Shard', inline: true })

            .addFields({ name: 'Location', value: 'Ice Rink, Valley of Triumph', inline: true })

             .addFields({ name: 'Rewards', value: '200 Wax <:wax:1125091974869946369>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'B' && ![3, 4].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#FF0000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Red Shard', inline: true })

            .addFields({ name: 'Location', value: 'Hermit\'s Valley, Valley of Triumph', inline: true })

             .addFields({ name: 'Rewards', value: '3.5 AC <a:ac5:1125338720183267390>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'C' && ![1, 2].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#FF0000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Red Shard', inline: true })

            .addFields({ name: 'Location', value: 'Village of Dreams, Valley of Triumph', inline: true })

             .addFields({ name: 'Rewards', value: '2.5 AC <a:ac5:1125338720183267390>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else {
            result =  new EmbedBuilder()
                .setAuthor({ name: `There is no shard ${noShard}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})
                .setColor('#808080');
            showButtons = false;
        }
    } else if (currentSecondEvent === 'wasteland') {
        if (currentEvent === 'a' && ![6, 0].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#000000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Black Shard', inline: true })

            .addFields({ name: 'Location', value: 'Broken Temple, Golden Wasteland', inline: true })

             .addFields({ name: 'Rewards', value: '200 Wax <:wax:1125091974869946369>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});
        } else if (currentEvent === 'A' && ![2, 3].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#FF0000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Red Shard', inline: true })

            .addFields({ name: 'Location', value: 'Crab Fields, Golden Wasteland', inline: true })

             .addFields({ name: 'Rewards', value: '2.5 AC <a:ac5:1125338720183267390>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'b' && ![0, 1].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#000000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Black Shard', inline: true })

            .addFields({ name: 'Location', value: 'Battlefield, Golden Wasteland', inline: true })

             .addFields({ name: 'Rewards', value: '200 Wax <:wax:1125091974869946369>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'B' && ![3, 4].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#FF0000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Red Shard', inline: true })

            .addFields({ name: 'Location', value: 'Forgotten Ark, Golden Wasteland', inline: true })

             .addFields({ name: 'Rewards', value: '3.5 AC <a:ac5:1125338720183267390>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});
        } else if (currentEvent === 'C' && ![1, 2].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#FF0000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Red Shard', inline: true })

            .addFields({ name: 'Location', value: 'Graveyard, Golden Wasteland', inline: true })

             .addFields({ name: 'Rewards', value: '2 AC <a:ac5:1125338720183267390>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else {
            result =  new EmbedBuilder()
                .setAuthor({ name: `There is no shard ${noShard}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})
                .setColor('#808080');
            showButtons = false;
        }
    } else if (currentSecondEvent === 'vault') {
        if (currentEvent === 'a' && ![6, 0].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#000000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Black Shard', inline: true })

            .addFields({ name: 'Location', value: 'Starlight Desert, Vault of Knowledge', inline: true })

             .addFields({ name: 'Rewards', value: '200 Wax <:wax:1125091974869946369>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'A' && ![2, 3].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#FF0000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Red Shard', inline: true })

            .addFields({ name: 'Location', value: 'Jellyfish Cove, Starlight Desert, Vault of Knowledge', inline: true })

             .addFields({ name: 'Rewards', value: '3.5 AC <a:ac5:1125338720183267390>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'b' && ![0, 1].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#000000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Black Shard', inline: true })

            .addFields({ name: 'Location', value: 'Starlight Desert, Vault of Knowledge', inline: true })

             .addFields({ name: 'Rewards', value: '200 Wax <:wax:1125091974869946369>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'B' && ![3, 4].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#FF0000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Red Shard', inline: true })

            .addFields({ name: 'Location', value: 'Jellyfish Cove, Starlight Desert, Vault of Knowledge', inline: true })

             .addFields({ name: 'Rewards', value: '3.5 AC <a:ac5:1125338720183267390>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else if (currentEvent === 'C' && ![1, 2].includes(dayOfWeek)) {
            result = new EmbedBuilder()

            .setAuthor({ name: `Shards Information for ${formatDate}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})

            .setTimestamp(Date.now())

            .setColor('#FF0000')

            .setFooter({ text: 'Sky Shards Information', iconURL: 'https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png' })

             .addFields({ name: 'Shard Type', value: 'Red Shard', inline: true })

            .addFields({ name: 'Location', value: 'Jellyfish Cove, Starlight Desert, Vault of Knowledge', inline: true })

             .addFields({ name: 'Rewards', value: '3.5 AC <a:ac5:1125338720183267390>', inline: true })

            .addFields({ name: 'Shard Countdown', value: `${eventStatus} ${timeRemaining}`});;
        } else {
            result =  new EmbedBuilder()
                .setAuthor({ name: `There is no shard ${noShard}`, iconURL: 'https://media.discordapp.net/attachments/888067672028377108/1124426967438082058/SOShattering-radiant-shards.jpg?width=862&height=925'})
                .setColor('#808080');
            showButtons = false;
        }
    } 
let disabled;
if (showButtons) {
  disabled = false;
} else {
  result.setImage('https://media.discordapp.net/attachments/867638574571323424/1154806135749103648/noShard.gif')
  disabled = true;
}
const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setEmoji('<a:left:1148644073670975640>')
                .setCustomId('prev')
                .setStyle('1'),
            new ButtonBuilder()
                .setEmoji('<a:right:1148627450608222278>')
                .setCustomId('next')
                .setStyle('1'),
            new ButtonBuilder()
                .setLabel('Timeline')
                .setCustomId('shard_timeline')
                .setDisabled(disabled)
                .setStyle('3'),
            new ButtonBuilder()
                .setLabel('Location/Data')
                .setCustomId('shard_location')
                .setDisabled(disabled )
                .setStyle('3'),
            new ButtonBuilder()
                .setLabel('About Shard')
                .setCustomId('about_shard')
                .setStyle('3')
        );
if (!interaction.isButton()) {
  await interaction.deferReply({ephemeral: true});
  const reply = await interaction.editReply({ embeds: [result], components: [actionRow], fetchReply: true });
    const messageId = reply.id;
    
    saveMessageData({ time: currentDate.format(), messageId, timestamp: moment().tz(timezone).format() });
  
} else {
  await interaction.update({ embeds: [result], components: [actionRow] });
  
}

function saveMessageData(data) {
  fs.readFile('messageData.json', 'utf8', (err, fileData) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fileData = '[]';
      } else {
        console.error('Error reading file:', err);
        return;
      }
    }

    let jsonData = JSON.parse(fileData);
    jsonData.push(data);

    fs.writeFile('messageData.json', JSON.stringify(jsonData, null, 2), (err) => {
      if (err) {
        console.error('Error writing file:', err);
      }
    });
  });
}
}

module.exports = {
    shardsReply
  };
  