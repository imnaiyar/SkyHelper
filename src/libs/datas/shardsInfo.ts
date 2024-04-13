const shardConfig = {
  a: { type: "Black Shard", colors: "#000000", weekdays: [6, 0] },
  A: { type: "Red Shard", colors: "#FF0000", weekdays: [2, 3] },
  b: { type: "Black Shard", colors: "#000000", weekdays: [0, 1] },
  B: { type: "Red Shard", colors: "#FF0000", weekdays: [3, 4] },
  C: { type: "Red Shard", colors: "#FF0000", weekdays: [1, 2] },
};

export default {
  prairie: {
    a: {
      area: "Butterfly Fields, Daylight Prairie",
      rewards: "200 Wax <:wax:1125091974869946369>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226741731119165/ButterflyFields.png",
      ...shardConfig.a,
    },
    A: {
      area: "Bird's Nest, Daylight Prairie",
      rewards: "2.5 AC <a:ac5:1125338720183267390>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226742024708187/BirdsNest.png",
      ...shardConfig.A,
    },
    b: {
      area: "Village Island, Daylight Prairie",
      rewards: "200 Wax <:wax:1125091974869946369>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226741412343989/VillageIsland.png",
      ...shardConfig.b,
    },
    B: {
      area: "Sanctuary Island, Daylight Prairie",
      rewards: "3.5 AC <a:ac5:1125338720183267390>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226740741263510/SanctuaryIsland.png",
      ...shardConfig.B,
    },
    C: {
      area: "Prairie Caves, Daylight Prairie",
      rewards: "2 AC <a:ac5:1125338720183267390>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226741110349925/PrairieCave.png",
      ...shardConfig.C,
    },
  },
  forest: {
    a: {
      area: "Forest Brook, Hidden Forest",
      rewards: "200 Wax <:wax:1125091974869946369>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226847062671400/ForestBrook.png",
      ...shardConfig.a,
    },
    A: {
      area: "Treehouse, Hidden Forest",
      rewards: "3.5 AC <a:ac5:1125338720183267390>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226739713650788/Treehouse.png",
      ...shardConfig.A,
    },
    b: {
      area: "Boneyard, Hidden Forest",
      rewards: "200 Wax <:wax:1125091974869946369>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226740472819793/Boneyard.png",
      ...shardConfig.b,
    },
    B: {
      area: "Sunny Forest, Hidden Forest",
      rewards: "3.5 AC <a:ac5:1125338720183267390>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226659518558298/ElevatedClearing.png",
      ...shardConfig.B,
    },
    C: {
      area: "Forest End, Hidden Forest",
      rewards: "2.5 AC <a:ac5:1125338720183267390>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226740099534868/ForestEnd.png",
      ...shardConfig.C,
    },
  },
  valley: {
    a: {
      area: "Ice Rink, Valley of Triumph",
      rewards: "200 Wax <:wax:1125091974869946369>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226659262693446/IceRink.png",
      ...shardConfig.a,
    },
    A: {
      area: "Village of Dreams, Valley of Triumph",
      rewards: "2.5 AC <a:ac5:1125338720183267390>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226658918780948/VillageOfDreams.png",
      ...shardConfig.A,
    },
    b: {
      area: "Ice Rink, Valley of Triumph",
      rewards: "200 Wax <:wax:1125091974869946369>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226659262693446/IceRink.png",
      ...shardConfig.b,
    },
    B: {
      area: "Hermit's Valley, Valley of Triumph",
      rewards: "3.5 AC <a:ac5:1125338720183267390>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226658629365770/HermitsValley.png",
      ...shardConfig.B,
    },
    C: {
      area: "Village of Dreams, Valley of Triumph",
      rewards: "2.5 AC <a:ac5:1125338720183267390>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226658918780948/VillageOfDreams.png",
      ...shardConfig.C,
    },
  },
  wasteland: {
    a: {
      area: "Broken Temple, Golden Wasteland",
      rewards: "200 Wax <:wax:1125091974869946369>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226658209923202/BrokenTemple.png",
      ...shardConfig.a,
    },
    A: {
      area: "Crab Fields, Golden Wasteland",
      rewards: "2.5 AC <a:ac5:1125338720183267390>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226846794231919/CrabFields.png",
      ...shardConfig.A,
    },
    b: {
      area: "Battlefield, Golden Wasteland",
      rewards: "200 Wax <:wax:1125091974869946369>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226657148784680/Battlefield.png",
      ...shardConfig.b,
    },
    B: {
      area: "Forgotten Ark, Golden Wasteland",
      rewards: "3.5 AC <a:ac5:1125338720183267390>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226657933119508/ForgottenArk.png",
      ...shardConfig.B,
    },
    C: {
      area: "Graveyard, Golden Wasteland",
      rewards: "2 AC <a:ac5:1125338720183267390>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226742263787623/Graveyard.png",
      ...shardConfig.C,
    },
  },
  vault: {
    a: {
      area: "Starlight Desert, Vault of Knowledge",
      rewards: "200 Wax <:wax:1125091974869946369>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226657656287392/StarlightDesert.png",
      ...shardConfig.a,
    },
    A: {
      area: "Jellyfish Cove, Starlight Desert, Vault of Knowledge",
      rewards: "3.5 AC <a:ac5:1125338720183267390>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226657404616756/JellyfishCove.png",
      ...shardConfig.A,
    },
    b: {
      area: "Starlight Desert, Vault of Knowledge",
      rewards: "200 Wax <:wax:1125091974869946369>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226657656287392/StarlightDesert.png",
      ...shardConfig.b,
    },
    B: {
      area: "Jellyfish Cove, Starlight Desert, Vault of Knowledge",
      rewards: "3.5 AC <a:ac5:1125338720183267390>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226657404616756/JellyfishCove.png",
      ...shardConfig.B,
    },
    C: {
      area: "Jellyfish Cove, Starlight Desert, Vault of Knowledge",
      rewards: "3.5 AC <a:ac5:1125338720183267390>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226657404616756/JellyfishCove.png",
      ...shardConfig.C,
    },
  },
};
