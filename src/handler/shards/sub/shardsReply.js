const { shardsAlt } = require('@shards/shardsAlt');
async function shardsReply(currentDate) {
  const {
    eventStatus,
    timeRemaining,
    currentShard,
    currentRealm,
    dayOfWeek,
    noShard,
  } = await shardsAlt(currentDate);
  let type = 'Red Shard';
  let location;
  let rewards;
  let colors = '#FF0000';
  let showButtons = true;
  let thumbUrl = '';

  if (currentRealm === 'prairie') {
    if (currentShard === 'a' && ![6, 0].includes(dayOfWeek)) {
      type = 'Black Shard';
      location = `Butterfly Fields, Daylight Prairie`;
      colors = '#000000';
      rewards = '200 Wax <:wax:1125091974869946369>';
      thumbUrl =
        'https://media.discordapp.net/attachments/867638574571323424/1159226741731119165/ButterflyFields.png';
    } else if (currentShard === 'A' && ![2, 3].includes(dayOfWeek)) {
      location = `Bird's Nest, Daylight Prairie`;
      rewards = '2.5 AC <a:ac5:1125338720183267390>';
      thumbUrl =
        'https://media.discordapp.net/attachments/867638574571323424/1159226742024708187/BirdsNest.png';
    } else if (currentShard === 'b' && ![0, 1].includes(dayOfWeek)) {
      type = 'Black Shard';
      colors = '#000000';
      location = 'Village Island, Daylight Prairie';
      rewards = '200 Wax <:wax:1125091974869946369>';
      thumbUrl =
        'https://media.discordapp.net/attachments/867638574571323424/1159226741412343989/VillageIsland.png';
    } else if (currentShard === 'B' && ![3, 4].includes(dayOfWeek)) {
      location = ' Sanctuary Island, Daylight Prairie';
      rewards = '3.5 AC <a:ac5:1125338720183267390>';
      thumbUrl =
        'https://media.discordapp.net/attachments/867638574571323424/1159226740741263510/SanctuaryIsland.png';
    } else if (currentShard === 'C' && ![1, 2].includes(dayOfWeek)) {
      location = 'Prairie Caves, Daylight Prairie';
      rewards = '2 AC <a:ac5:1125338720183267390>';
      thumbUrl =
        'https://media.discordapp.net/attachments/867638574571323424/1159226741110349925/PrairieCave.png';
    } else {
      showButtons = false;
    }
  } else if (currentRealm === 'forest') {
    if (currentShard === 'a' && ![6, 0].includes(dayOfWeek)) {
      type = 'Black Shard';
      location = 'Forest Brook, Hidden Forest';
      colors = '#000000';
      rewards = '200 Wax <:wax:1125091974869946369>';
      thumbUrl =
        'https://media.discordapp.net/attachments/867638574571323424/1159226847062671400/ForestBrook.png';
    } else if (currentShard === 'A' && ![2, 3].includes(dayOfWeek)) {
      location = 'Treehouse, Hidden Forest';
      rewards = '3.5 AC <a:ac5:1125338720183267390>';
      thumbUrl =
        'https://media.discordapp.net/attachments/867638574571323424/1159226739713650788/Treehouse.png';
    } else if (currentShard === 'b' && ![0, 1].includes(dayOfWeek)) {
      type = 'Black Shard';
      location = 'Boneyard, Hidden Forest';
      colors = '#000000';
      rewards = '200 Wax <:wax:1125091974869946369>';
      thumbUrl =
        'https://media.discordapp.net/attachments/867638574571323424/1159226740472819793/Boneyard.png';
    } else if (currentShard === 'B' && ![3, 4].includes(dayOfWeek)) {
      location = 'Sunny Forest, Hidden Forest';
      rewards = '3.5 AC <a:ac5:1125338720183267390>';
      thumbUrl =
        'https://media.discordapp.net/attachments/867638574571323424/1159226659518558298/ElevatedClearing.png';
    } else if (currentShard === 'C' && ![1, 2].includes(dayOfWeek)) {
      location = 'Forest End, Hidden Forest';
      rewards = '2.5 AC <a:ac5:1125338720183267390>';
      thumbUrl =
        'https://media.discordapp.net/attachments/867638574571323424/1159226740099534868/ForestEnd.png';
    } else {
      showButtons = false;
    }
  } else if (currentRealm === 'valley') {
    if (currentShard === 'a' && ![6, 0].includes(dayOfWeek)) {
      type = 'Black Shard';
      location = 'Ice Rink, Valley of Triumph';
      colors = '#000000';
      rewards = '200 Wax <:wax:1125091974869946369>';
      thumbUrl =
        'https://media.discordapp.net/attachments/867638574571323424/1159226659262693446/IceRink.png';
    } else if (currentShard === 'A' && ![2, 3].includes(dayOfWeek)) {
      location = 'Village of Dreams, Valley of Triumph';
      rewards = '2.5 AC <a:ac5:1125338720183267390>';
      thumbUrl =
        'https://media.discordapp.net/attachments/867638574571323424/1159226658918780948/VillageOfDreams.png';
    } else if (currentShard === 'b' && ![0, 1].includes(dayOfWeek)) {
      type = 'Black Shard';
      location = 'Ice Rink, Valley of Triumph';
      colors = '#000000';
      rewards = '200 Wax <:wax:1125091974869946369>';
      thumbUrl =
        'https://media.discordapp.net/attachments/867638574571323424/1159226659262693446/IceRink.png';
    } else if (currentShard === 'B' && ![3, 4].includes(dayOfWeek)) {
      location = `Hermit's Valley, Valley of Triumph`;
      rewards = '3.5 AC <a:ac5:1125338720183267390>';
      thumbUrl =
        'https://media.discordapp.net/attachments/867638574571323424/1159226658629365770/HermitsValley.png';
    } else if (currentShard === 'C' && ![1, 2].includes(dayOfWeek)) {
      location = 'Village of Dreams, Valley of Triumph';
      rewards = '2.5 AC <a:ac5:1125338720183267390>';
      thumbUrl =
        'https://media.discordapp.net/attachments/867638574571323424/1159226658918780948/VillageOfDreams.png';
    } else {
      showButtons = false;
    }
  } else if (currentRealm === 'wasteland') {
    if (currentShard === 'a' && ![6, 0].includes(dayOfWeek)) {
      type = 'Black Shard';
      location = 'Broken Temple, Golden Wasteland';
      colors = '#000000';
      rewards = '200 Wax <:wax:1125091974869946369>';
      thumbUrl =
        'https://media.discordapp.net/attachments/867638574571323424/1159226658209923202/BrokenTemple.png';
    } else if (currentShard === 'A' && ![2, 3].includes(dayOfWeek)) {
      location = 'Crab Fields, Golden Wasteland';
      rewards = '2.5 AC <a:ac5:1125338720183267390>';
      thumbUrl =
        'https://media.discordapp.net/attachments/867638574571323424/1159226846794231919/CrabFields.png';
    } else if (currentShard === 'b' && ![0, 1].includes(dayOfWeek)) {
      location = 'Battlefield, Golden Wasteland';
      type = 'Black Shard';
      colors = '#000000';
      rewards = '200 Wax <:wax:1125091974869946369>';
      thumbUrl =
        'https://media.discordapp.net/attachments/867638574571323424/1159226657148784680/Battlefield.png';
    } else if (currentShard === 'B' && ![3, 4].includes(dayOfWeek)) {
      location = 'Forgotten Ark, Golden Wasteland';
      rewards = '3.5 AC <a:ac5:1125338720183267390>';
      thumbUrl =
        'https://media.discordapp.net/attachments/867638574571323424/1159226657933119508/ForgottenArk.png';
    } else if (currentShard === 'C' && ![1, 2].includes(dayOfWeek)) {
      location = 'Graveyard, Golden Wasteland';
      rewards = '2 AC <a:ac5:1125338720183267390>';
      thumbUrl =
        'https://media.discordapp.net/attachments/867638574571323424/1159226742263787623/Graveyard.png';
    } else {
      showButtons = false;
    }
  } else if (currentRealm === 'vault') {
    if (currentShard === 'a' && ![6, 0].includes(dayOfWeek)) {
      location = 'Starlight Desert, Vault of Knowledge';
      type = 'Black Shard';
      colors = '#000000';
      rewards = '200 Wax <:wax:1125091974869946369>';
      thumbUrl =
        'https://media.discordapp.net/attachments/867638574571323424/1159226657656287392/StarlightDesert.png';
    } else if (currentShard === 'A' && ![2, 3].includes(dayOfWeek)) {
      location = 'Jellyfish Cove, Starlight Desert, Vault of Knowledge';
      rewards = '3.5 AC <a:ac5:1125338720183267390>';
      thumbUrl =
        'https://media.discordapp.net/attachments/867638574571323424/1159226657404616756/JellyfishCove.png';
    } else if (currentShard === 'b' && ![0, 1].includes(dayOfWeek)) {
      location = 'Starlight Desert, Vault of Knowledge';
      type = 'Black Shard';
      colors = '#000000';
      rewards = '200 Wax <:wax:1125091974869946369>';
      thumbUrl =
        'https://media.discordapp.net/attachments/867638574571323424/1159226657656287392/StarlightDesert.png';
    } else if (currentShard === 'B' && ![3, 4].includes(dayOfWeek)) {
      location = 'Jellyfish Cove, Starlight Desert, Vault of Knowledge';
      rewards = '3.5 AC <a:ac5:1125338720183267390>';
      thumbUrl =
        'https://media.discordapp.net/attachments/867638574571323424/1159226657404616756/JellyfishCove.png';
    } else if (currentShard === 'C' && ![1, 2].includes(dayOfWeek)) {
      location = 'Jellyfish Cove, Starlight Desert, Vault of Knowledge';
      rewards = '3.5 AC <a:ac5:1125338720183267390>';
      thumbUrl =
        'https://media.discordapp.net/attachments/867638574571323424/1159226657404616756/JellyfishCove.png';
    } else {
      showButtons = false;
    }
  }

  return {
    type,
    location,
    rewards,
    colors,
    showButtons,
    thumbUrl,
    noShard,
    eventStatus,
    timeRemaining,
  };
}

module.exports = {
  shardsReply,
};
