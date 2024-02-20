const { shardsAlt } = require("../shardsAlt");

/**
 * Returns final info for a shard for a given date
 * @param {import('moment').Moment} currentDate
 * @returns
 */
async function shardsReply(currentDate) {
  const { eventStatus, timeRemaining, currentShard, currentRealm, dayOfWeek, noShard } = await shardsAlt(currentDate);

  let type = "Red Shard";
  let location;
  let rewards;
  let colors;
  let showButtons = true;
  let thumbUrl = "";

  const shardConfig = {
    a: { type: "Black Shard", colors: "#000000", weekdays: [6, 0] },
    A: { type: "Red Shard", colors: "#FF0000", weekdays: [2, 3] },
    b: { type: "Black Shard", colors: "#000000", weekdays: [0, 1] },
    B: { type: "Red Shard", colors: "#FF0000", weekdays: [3, 4] },
    C: { type: "Red Shard", colors: "#FF0000", weekdays: [1, 2] },
  };

  const realms = {
    prairie: {
      a: [
        "Butterfly Fields, Daylight Prairie",
        "200 Wax <:wax:1125091974869946369>",
        "https://media.discordapp.net/attachments/867638574571323424/1159226741731119165/ButterflyFields.png",
      ],
      A: [
        "Bird's Nest, Daylight Prairie",
        "2.5 AC <a:ac5:1125338720183267390>",
        "https://media.discordapp.net/attachments/867638574571323424/1159226742024708187/BirdsNest.png",
      ],
      b: [
        "Village Island, Daylight Prairie",
        "200 Wax <:wax:1125091974869946369>",
        "https://media.discordapp.net/attachments/867638574571323424/1159226741412343989/VillageIsland.png",
      ],
      B: [
        "Sanctuary Island, Daylight Prairie",
        "3.5 AC <a:ac5:1125338720183267390>",
        "https://media.discordapp.net/attachments/867638574571323424/1159226740741263510/SanctuaryIsland.png",
      ],
      C: [
        "Prairie Caves, Daylight Prairie",
        "2 AC <a:ac5:1125338720183267390>",
        "https://media.discordapp.net/attachments/867638574571323424/1159226741110349925/PrairieCave.png",
      ],
    },
    forest: {
      a: [
        "Forest Brook, Hidden Forest",
        "200 Wax <:wax:1125091974869946369>",
        "https://media.discordapp.net/attachments/867638574571323424/1159226847062671400/ForestBrook.png",
      ],
      A: [
        "Treehouse, Hidden Forest",
        "3.5 AC <a:ac5:1125338720183267390>",
        "https://media.discordapp.net/attachments/867638574571323424/1159226739713650788/Treehouse.png",
      ],
      b: [
        "Boneyard, Hidden Forest",
        "200 Wax <:wax:1125091974869946369>",
        "https://media.discordapp.net/attachments/867638574571323424/1159226740472819793/Boneyard.png",
      ],
      B: [
        "Sunny Forest, Hidden Forest",
        "3.5 AC <a:ac5:1125338720183267390>",
        "https://media.discordapp.net/attachments/867638574571323424/1159226659518558298/ElevatedClearing.png",
      ],
      C: [
        "Forest End, Hidden Forest",
        "2.5 AC <a:ac5:1125338720183267390>",
        "https://media.discordapp.net/attachments/867638574571323424/1159226740099534868/ForestEnd.png",
      ],
    },
    valley: {
      a: [
        "Ice Rink, Valley of Triumph",
        "200 Wax <:wax:1125091974869946369>",
        "https://media.discordapp.net/attachments/867638574571323424/1159226659262693446/IceRink.png",
      ],
      A: [
        "Village of Dreams, Valley of Triumph",
        "2.5 AC <a:ac5:1125338720183267390>",
        "https://media.discordapp.net/attachments/867638574571323424/1159226658918780948/VillageOfDreams.png",
      ],
      b: [
        "Ice Rink, Valley of Triumph",
        "200 Wax <:wax:1125091974869946369>",
        "https://media.discordapp.net/attachments/867638574571323424/1159226659262693446/IceRink.png",
      ],
      B: [
        "Hermit's Valley, Valley of Triumph",
        "3.5 AC <a:ac5:1125338720183267390>",
        "https://media.discordapp.net/attachments/867638574571323424/1159226658629365770/HermitsValley.png",
      ],
      C: [
        "Village of Dreams, Valley of Triumph",
        "2.5 AC <a:ac5:1125338720183267390>",
        "https://media.discordapp.net/attachments/867638574571323424/1159226658918780948/VillageOfDreams.png",
      ],
    },
    wasteland: {
      a: [
        "Broken Temple, Golden Wasteland",
        "200 Wax <:wax:1125091974869946369>",
        "https://media.discordapp.net/attachments/867638574571323424/1159226658209923202/BrokenTemple.png",
      ],
      A: [
        "Crab Fields, Golden Wasteland",
        "2.5 AC <a:ac5:1125338720183267390>",
        "https://media.discordapp.net/attachments/867638574571323424/1159226846794231919/CrabFields.png",
      ],
      b: [
        "Battlefield, Golden Wasteland",
        "200 Wax <:wax:1125091974869946369>",
        "https://media.discordapp.net/attachments/867638574571323424/1159226657148784680/Battlefield.png",
      ],
      B: [
        "Forgotten Ark, Golden Wasteland",
        "3.5 AC <a:ac5:1125338720183267390>",
        "https://media.discordapp.net/attachments/867638574571323424/1159226657933119508/ForgottenArk.png",
      ],
      C: [
        "Graveyard, Golden Wasteland",
        "2 AC <a:ac5:1125338720183267390>",
        "https://media.discordapp.net/attachments/867638574571323424/1159226742263787623/Graveyard.png",
      ],
    },
    vault: {
      a: [
        "Starlight Desert, Vault of Knowledge",
        "200 Wax <:wax:1125091974869946369>",
        "https://media.discordapp.net/attachments/867638574571323424/1159226657656287392/StarlightDesert.png",
      ],
      A: [
        "Jellyfish Cove, Starlight Desert, Vault of Knowledge",
        "3.5 AC <a:ac5:1125338720183267390>",
        "https://media.discordapp.net/attachments/867638574571323424/1159226657404616756/JellyfishCove.png",
      ],
      b: [
        "Starlight Desert, Vault of Knowledge",
        "200 Wax <:wax:1125091974869946369>",
        "https://media.discordapp.net/attachments/867638574571323424/1159226657656287392/StarlightDesert.png",
      ],
      B: [
        "Jellyfish Cove, Starlight Desert, Vault of Knowledge",
        "3.5 AC <a:ac5:1125338720183267390>",
        "https://media.discordapp.net/attachments/867638574571323424/1159226657404616756/JellyfishCove.png",
      ],
      C: [
        "Jellyfish Cove, Starlight Desert, Vault of Knowledge",
        "3.5 AC <a:ac5:1125338720183267390>",
        "https://media.discordapp.net/attachments/867638574571323424/1159226657404616756/JellyfishCove.png",
      ],
    },
  };

  const shardInfo = shardConfig[currentShard];
  const realmInfo = realms[currentRealm];

  if (shardInfo && realmInfo && !shardInfo.weekdays.includes(dayOfWeek)) {
    type = shardInfo.type;
    colors = shardInfo.colors;
    [location, rewards, thumbUrl] = realmInfo[currentShard];
  } else {
    showButtons = false;
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
