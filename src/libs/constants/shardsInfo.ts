export const shardConfig = {
  a: { type: "<:ShardBlue:1233057106903699497> Black Shard", colors: "#000000", weekdays: [6, 0] },
  A: { type: "<:ShardRed:1233057065799254106> Red Shard", colors: "#FF0000", weekdays: [2, 3] },
  b: { type: "<:ShardBlue:1233057106903699497> Black Shard", colors: "#000000", weekdays: [0, 1] },
  B: { type: "<:ShardRed:1233057065799254106> Red Shard", colors: "#FF0000", weekdays: [3, 4] },
  C: { type: "<:ShardRed:1233057065799254106> Red Shard", colors: "#FF0000", weekdays: [1, 2] },
};

export interface ShardInfo {
  area: string;
  rewards: string;
  image: string;
  type: string;
  colors: string;
  weekdays: number[];
  locations: {
    description: string;
    image: string;
  }[];
}

export interface ShardsInfo {
  [key: string]: {
    [key: string]: ShardInfo;
  };
}

/**
 * Returns the shard information for each area
 * @example
 * const info = shardsInfo[currentRealm][currentShard]
 */
export default {
  prairie: {
    a: {
      area: "Butterfly Fields, <:r5Prairie:1150596314883690607> Daylight Prairie",
      rewards: "200 Wax <:wax:1125091974869946369>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226741731119165/ButterflyFields.png",
      ...shardConfig.a,
      locations: [
        {
          description: "**Shard Location: Butterfly Fields, <:r5Prairie:1150596314883690607> Daylight Prairie**",
          image:
            "https://media.discordapp.net/attachments/575827924343848960/1119162577126178846/01_Daylight_Prairie_-_Butterfly_Field.png",
        },
        {
          description: "**Shard Data: Butterfly Fields, <:r5Prairie:1150596314883690607> Daylight Prairie**",
          image: "https://media.discordapp.net/attachments/575827924343848960/1053249686422687784/dp-b_Butterfly_Field.png",
        },
      ],
    },
    A: {
      area: "Bird's Nest, <:r5Prairie:1150596314883690607> Daylight Prairie",
      rewards: "2.5 AC <a:ac5:1125338720183267390>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226742024708187/BirdsNest.png",
      ...shardConfig.A,
      locations: [
        {
          description: "**Shard Location: Bird's Nest, <:r5Prairie:1150596314883690607> Daylight Prairie**",
          image:
            "https://media.discordapp.net/attachments/575827924343848960/1109738791268257812/01_Daylight_Prairie_-_Birds_Nest.png",
        },
        {
          description: "**Shard Data: Bird's Nest, <:r5Prairie:1150596314883690607> Daylight Prairie**",
          image: "https://media.discordapp.net/attachments/575827924343848960/1044197796577824839/dp-r_Bird_Nest.png",
        },
      ],
    },
    b: {
      area: "Village Island, <:r5Prairie:1150596314883690607> Daylight Prairie",
      rewards: "200 Wax <:wax:1125091974869946369>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226741412343989/VillageIsland.png",
      ...shardConfig.b,
      locations: [
        {
          description: "**Shard Location: Village Island/Koi Pond, <:r5Prairie:1150596314883690607> Daylight Prairie**",
          image:
            "https://media.discordapp.net/attachments/575827924343848960/1115536957875945604/01_Daylight_Prairie_-_Village_Islands_and_Koi_Pond.png",
        },
        {
          description: "**Shard Data: Village Island/Koi Pod, <:r5Prairie:1150596314883690607> Daylight Prairie**",
          image: "https://media.discordapp.net/attachments/575827924343848960/1049635543421550652/dp-b_Village-Koi.png",
        },
      ],
    },
    B: {
      area: "Sanctuary Island, <:r5Prairie:1150596314883690607> Daylight Prairie",
      rewards: "3.5 AC <a:ac5:1125338720183267390>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226740741263510/SanctuaryIsland.png",
      ...shardConfig.B,
      locations: [
        {
          description: "**Shard Location: Sanctuary Island, <:r5Prairie:1150596314883690607> Daylight Prairie**",
          image: "https://media.discordapp.net/attachments/575827924343848960/1117348946390564934/IMG_4458.png",
        },
        {
          description: "**Shard Data: Sanctuary Island, <:r5Prairie:1150596314883690607> Daylight Prairie**",
          image: "https://media.discordapp.net/attachments/575827924343848960/1051464559065583637/dp-r_Sanctuary_Islands.png",
        },
      ],
    },
    C: {
      area: "Prairie Caves, <:r5Prairie:1150596314883690607> Daylight Prairie",
      rewards: "2 AC <a:ac5:1125338720183267390>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226741110349925/PrairieCave.png",
      ...shardConfig.C,
      locations: [
        {
          description: "**Shard Location: Prairie Caves, <:r5Prairie:1150596314883690607> Daylight Prairie**",
          image:
            "https://media.discordapp.net/attachments/575827924343848960/1124597919178313749/01_Daylight_Prairie_-_Prairie_Caves.png",
        },
        {
          description: "**Shard Data: Prairie Caves, <:r5Prairie:1150596314883690607> Daylight Prairie**",
          image: "https://media.discordapp.net/attachments/1123347180988661902/1126113425286766702/dp-r_Caves.jpg",
        },
      ],
    },
  },

  forest: {
    a: {
      area: "Forest Brook, <:r4Forest:1150596343354630235> Hidden Forest",
      rewards: "200 Wax <:wax:1125091974869946369>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226847062671400/ForestBrook.png",
      ...shardConfig.a,
      locations: [
        {
          description: "**Shard Location: Forest Brook, <:r4Forest:1150596343354630235> Hidden Forest**",
          image: "https://media.discordapp.net/attachments/575827924343848960/1117712849217781871/IMG_3543.png",
        },
        {
          description: "**Shard Data: Forest Brook, <:r4Forest:1150596343354630235> Hidden Forest**",
          image: "https://media.discordapp.net/attachments/575827924343848960/1051802895634399242/hf-b_Forest_Brook.png",
        },
      ],
    },
    A: {
      area: "Treehouse, <:r4Forest:1150596343354630235> Hidden Forest",
      rewards: "3.5 AC <a:ac5:1125338720183267390>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226739713650788/Treehouse.png",
      ...shardConfig.A,
      locations: [
        {
          description: "**Shard Location: Treehouse, <:r4Forest:1150596343354630235> Hidden Forest**",
          image:
            "https://media.discordapp.net/attachments/575827924343848960/1111912764420665394/02_Hidden_Forest_-_Assembly_Treehouse.png",
        },
        {
          description: "**Shard Data: Treehouse, <:r4Forest:1150596343354630235> Hidden Forest**",
          image: "https://media.discordapp.net/attachments/575827924343848960/1046371999586451597/png_20221027_180854_0000.png",
        },
      ],
    },
    b: {
      area: "Boneyard, <:r4Forest:1150596343354630235> Hidden Forest",
      rewards: "200 Wax <:wax:1125091974869946369>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226740472819793/Boneyard.png",
      ...shardConfig.b,
      locations: [
        {
          description: "**Shard Location: Broken Bridge/Boneyard, <:r4Forest:1150596343354630235> Hidden Forest**",
          image:
            "https://media.discordapp.net/attachments/575827924343848960/1121336759633059890/02_Hidden_Forest_-_Broken_Bridge.png",
        },
        {
          description: "**Shard Data: Broken Bridge/Boneyard, <:r4Forest:1150596343354630235> Hidden Forest**",
          image: "https://media.discordapp.net/attachments/575827924343848960/1048189111145603072/hf-b_Boneyard.png",
        },
      ],
    },
    B: {
      area: "Sunny Forest, <:r4Forest:1150596343354630235> Hidden Forest",
      rewards: "3.5 AC <a:ac5:1125338720183267390>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226659518558298/ElevatedClearing.png",
      ...shardConfig.B,
      locations: [
        {
          description: "**Shard Location: Elevated Clearing(Sunny Forest), <:r4Forest:1150596343354630235> Hidden Forest**",
          image:
            "https://media.discordapp.net/attachments/575827924343848960/1119522919983349780/02_Hidden_Forest_-_Elevated_Clearing.png",
        },
        {
          description: "**Shard Data: Elevated Clearing(Sunny Forest), <:r4Forest:1150596343354630235> Hidden Forest**",
          image: "https://media.discordapp.net/attachments/575827924343848960/1053645676870897724/hf-r_Elevated_Clearing.png",
        },
      ],
    },
    C: {
      area: "Forest End, <:r4Forest:1150596343354630235> Hidden Forest",
      rewards: "2.5 AC <a:ac5:1125338720183267390>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226740099534868/ForestEnd.png",
      ...shardConfig.C,
      locations: [
        {
          description: "**Shard Location: Forest End, <:r4Forest:1150596343354630235> Hidden Forest**",
          image:
            "https://media.discordapp.net/attachments/575827924343848960/1115899669847998526/02_Hidden_Forest_-_Forest_End.png",
        },
        {
          description: "**Shard Data: Forest End, <:r4Forest:1150596343354630235> Hidden Forest**",
          image: "https://media.discordapp.net/attachments/575827924343848960/1050078656015376496/hf-r_Forest_End.png",
        },
      ],
    },
  },
  valley: {
    a: {
      area: "Ice Rink, <:r3Valley:1150596376930037850> Valley of Triumph",
      rewards: "200 Wax <:wax:1125091974869946369>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226659262693446/IceRink.png",
      ...shardConfig.a,
      locations: [
        {
          description: "**Shard Location: Ice Rink, <:r3Valley:1150596376930037850> Valley of Triumph**",
          image:
            "https://media.discordapp.net/attachments/575827924343848960/1116263531101306940/03_Valley_of_Triumph_-_Ice_Rink.png",
        },
        {
          description: "**Shard Data: Ice Rink, <:r3Valley:1150596376930037850> Valley of Triumph**",
          image: "https://media.discordapp.net/attachments/575827924343848960/1050351219383730186/vt-b_Ice_Rink.png",
        },
      ],
    },
    A: {
      area: "Village of Dreams, <:r3Valley:1150596376930037850> Valley of Triumph",
      rewards: "2.5 AC <a:ac5:1125338720183267390>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226658918780948/VillageOfDreams.png",
      ...shardConfig.A,
      locations: [
        {
          description: "**Shard Location: Village of Dreams, <:r3Valley:1150596376930037850> Valley of Triumph**",
          image:
            "https://media.discordapp.net/attachments/575827924343848960/1114449712070799360/03_Valley_of_Triumph_-_Village_of_Dreams.png",
        },
        {
          description: "**Shard Data: Village of Dreams, <:r3Valley:1150596376930037850> Valley of Triumph**",
          image: "https://media.discordapp.net/attachments/575827924343848960/1048546903702384721/vt-r_Village_of_Dreams.png",
        },
      ],
    },
    b: {
      area: "Ice Rink, <:r3Valley:1150596376930037850> Valley of Triumph",
      rewards: "200 Wax <:wax:1125091974869946369>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226659262693446/IceRink.png",
      ...shardConfig.b,
      locations: [
        {
          description: "**Shard Location: Ice Rink, <:r3Valley:1150596376930037850> Valley of Triumph**",
          image:
            "https://media.discordapp.net/attachments/575827924343848960/1116263531101306940/03_Valley_of_Triumph_-_Ice_Rink.png",
        },
        {
          description: "**Shard Data: Ice Rink, <:r3Valley:1150596376930037850> Valley of Triumph**",
          image: "https://media.discordapp.net/attachments/575827924343848960/1050351219383730186/vt-b_Ice_Rink.png",
        },
      ],
    },
    B: {
      area: "Hermit's Valley, <:r3Valley:1150596376930037850> Valley of Triumph",
      rewards: "3.5 AC <a:ac5:1125338720183267390>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226658629365770/HermitsValley.png",
      ...shardConfig.B,
      locations: [
        {
          description: "**Shard Location: Hermits Valley, <:r3Valley:1150596376930037850> Valley of Triumph**",
          image:
            "https://media.discordapp.net/attachments/575827924343848960/1110464646911115314/03_Valley_of_Triumph_-_Hermit_Valley.png",
        },
        {
          description: "**Shard Data: Hermits Valley, <:r3Valley:1150596376930037850> Valley of Triumph**",
          image: "https://media.discordapp.net/attachments/575827924343848960/1055814361026936952/vt-r_Hermit_Valley.png",
        },
      ],
    },
    C: {
      area: "Village of Dreams, <:r3Valley:1150596376930037850> Valley of Triumph",
      rewards: "2.5 AC <a:ac5:1125338720183267390>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226658918780948/VillageOfDreams.png",
      ...shardConfig.C,
      locations: [
        {
          description: "**Shard Location: Village of Dreams, <:r3Valley:1150596376930037850> Valley of Triumph**",
          image:
            "https://media.discordapp.net/attachments/575827924343848960/1114449712070799360/03_Valley_of_Triumph_-_Village_of_Dreams.png",
        },
        {
          description: "**Shard Data: Village of Dreams, <:r3Valley:1150596376930037850> Valley of Triumph**",
          image: "https://media.discordapp.net/attachments/575827924343848960/1048546903702384721/vt-r_Village_of_Dreams.png",
        },
      ],
    },
  },
  wasteland: {
    a: {
      area: "Broken Temple, <:r2Wasteland:1150596423822356511> Golden Wasteland",
      rewards: "200 Wax <:wax:1125091974869946369>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226658209923202/BrokenTemple.png",
      ...shardConfig.a,
      locations: [
        {
          description: "**Shard Location: Broken Temple, <:r2Wasteland:1150596423822356511> Golden Wasteland**",
          image:
            "https://media.discordapp.net/attachments/575827924343848960/1125685677384806531/04_Golden_Wasteland_-_Broken_Temple.png",
        },
        {
          description: "**Shard Data: , Broken Temple <:r2Wasteland:1150596423822356511> Golden Wasteland**",
          image: "https://media.discordapp.net/attachments/575827924343848960/1045297714474254396/gw-b_Broken_Temple.png",
        },
      ],
    },
    A: {
      area: "Crab Fields, <:r2Wasteland:1150596423822356511> Golden Wasteland",
      rewards: "2.5 AC <a:ac5:1125338720183267390>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226846794231919/CrabFields.png",
      ...shardConfig.A,
      locations: [
        {
          description: "**Shard Location: Crab Fields/Shipwreck, <:r2Wasteland:1150596423822356511> Golden Wasteland**",
          image:
            "https://media.discordapp.net/attachments/575827924343848960/1094518173262417990/04_Golden_Wasteland_-_Crab_Fields.png",
        },
        {
          description: "**Shard Data: Crab Fields, <:r2Wasteland:1150596423822356511> Golden Wasteland**",
          image: "https://media.discordapp.net/attachments/575827924343848960/1050722076681568256/gw-r_Shipwreck.png",
        },
      ],
    },
    b: {
      area: "Battlefield, <:r2Wasteland:1150596423822356511> Golden Wasteland",
      rewards: "200 Wax <:wax:1125091974869946369>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226657148784680/Battlefield.png",
      ...shardConfig.b,
      locations: [
        {
          description: "**Shard Location: Battlefield, <:r2Wasteland:1150596423822356511> Golden Wasteland**",
          image:
            "https://media.discordapp.net/attachments/575827924343848960/1118435910615302164/04_Golden_Wasteland_-_Battlefield.png",
        },
        {
          description: "**Shard Data: Battlefield, <:r2Wasteland:1150596423822356511> Golden Wasteland**",
          image: "https://media.discordapp.net/attachments/575827924343848960/1052530499668688957/gw-b_Battlefield.png",
        },
      ],
    },
    B: {
      area: "Forgotten Ark, <:r2Wasteland:1150596423822356511> Golden Wasteland",
      rewards: "3.5 AC <a:ac5:1125338720183267390>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226657933119508/ForgottenArk.png",
      ...shardConfig.B,
      locations: [
        {
          description: "**Shard Location: Forgotten Ark, <:r2Wasteland:1150596423822356511> Golden Wasteland**",
          image: "https://media.discordapp.net/attachments/575827924343848960/1112639178048548884/IMG_3148.png",
        },
        {
          description: "**Shard Data: Forgotten Ark, <:r2Wasteland:1150596423822356511> Golden Wasteland**",
          image: "https://media.discordapp.net/attachments/575827924343848960/1069221627918827622/Forgotten_Ark_1.png",
        },
      ],
    },
    C: {
      area: "Graveyard, <:r2Wasteland:1150596423822356511> Golden Wasteland",
      rewards: "2 AC <a:ac5:1125338720183267390>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226742263787623/Graveyard.png",
      ...shardConfig.C,
      locations: [
        {
          description: "**Shard Location: Graveyard, <:r2Wasteland:1150596423822356511> Golden Wasteland**",
          image:
            "https://media.discordapp.net/attachments/575827924343848960/1109015846753419294/04_Golden_Wasteland_-_Graveyard.png",
        },
        {
          description: "**Shard Data: Graveyard, <:r2Wasteland:1150596423822356511> Golden Wasteland**",
          image: "https://media.discordapp.net/attachments/575827924343848960/1043553879289253919/gw-r_Graveyard.png",
        },
      ],
    },
  },
  vault: {
    a: {
      area: "Starlight Desert, <:r1Vault:1150596447679553636> Vault of Knowledge",
      rewards: "200 Wax <:wax:1125091974869946369>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226657656287392/StarlightDesert.png",
      ...shardConfig.a,
      locations: [
        {
          description: "**Shard Location: Starlight Desert, <:r1Vault:1150596447679553636> Vault of Knowledge**",
          image: "https://media.discordapp.net/attachments/575827924343848960/1090896818604347392/IMG_1525.png",
        },
        {
          description: "**Shard Data: Starlight Desert, <:r1Vault:1150596447679553636> Vault of Knowledge**",
          image: "https://media.discordapp.net/attachments/575827924343848960/1077178980051984455/vk-b_Starlight_Desert.png",
        },
      ],
    },
    A: {
      area: "Jellyfish Cove, Starlight Desert, <:r1Vault:1150596447679553636> Vault of Knowledge",
      rewards: "3.5 AC <a:ac5:1125338720183267390>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226657404616756/JellyfishCove.png",
      ...shardConfig.A,
      locations: [
        {
          description: "**Shard Location: Jellyfish Cove, <:r1Vault:1150596447679553636> Vault of Knowledge**",
          image:
            "https://media.discordapp.net/attachments/575827924343848960/1089082330305544242/05_Vault_of_Knowledge_-_Jellyfish_Cove.png",
        },
        {
          description: "**Shard Data: Jellyfish Cove, <:r1Vault:1150596447679553636> Vault of Knowledge**",
          image: "https://media.discordapp.net/attachments/575827924343848960/1049290746190106694/vk-r_Starlight_Desert.png",
        },
      ],
    },
    b: {
      area: "Starlight Desert, <:r1Vault:1150596447679553636> Vault of Knowledge",
      rewards: "200 Wax <:wax:1125091974869946369>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226657656287392/StarlightDesert.png",
      ...shardConfig.b,
      locations: [
        {
          description: "**Shard Location: Starlight Desert, <:r1Vault:1150596447679553636> Vault of Knowledge**",
          image: "https://media.discordapp.net/attachments/575827924343848960/1090896818604347392/IMG_1525.png",
        },
        {
          description: "**Shard Data: Starlight Desert, <:r1Vault:1150596447679553636> Vault of Knowledge**",
          image: "https://media.discordapp.net/attachments/575827924343848960/1077178980051984455/vk-b_Starlight_Desert.png",
        },
      ],
    },
    B: {
      area: "Jellyfish Cove, Starlight Desert, <:r1Vault:1150596447679553636> Vault of Knowledge",
      rewards: "3.5 AC <a:ac5:1125338720183267390>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226657404616756/JellyfishCove.png",
      ...shardConfig.B,
      locations: [
        {
          description: "**Shard Location: Jellyfish Cove, <:r1Vault:1150596447679553636> Vault of Knowledge**",
          image:
            "https://media.discordapp.net/attachments/575827924343848960/1089082330305544242/05_Vault_of_Knowledge_-_Jellyfish_Cove.png",
        },
        {
          description: "**Shard Data: Jellyfish Cove, <:r1Vault:1150596447679553636> Vault of Knowledge**",
          image: "https://media.discordapp.net/attachments/575827924343848960/1049290746190106694/vk-r_Starlight_Desert.png",
        },
      ],
    },
    C: {
      area: "Jellyfish Cove, Starlight Desert, <:r1Vault:1150596447679553636> Vault of Knowledge",
      rewards: "3.5 AC <a:ac5:1125338720183267390>",
      image: "https://media.discordapp.net/attachments/867638574571323424/1159226657404616756/JellyfishCove.png",
      ...shardConfig.C,
      locations: [
        {
          description: "**Shard Location: Jellyfish Cove, <:r1Vault:1150596447679553636> Vault of Knowledge**",
          image:
            "https://media.discordapp.net/attachments/575827924343848960/1089082330305544242/05_Vault_of_Knowledge_-_Jellyfish_Cove.png",
        },
        {
          description: "**Shard Data: Jellyfish Cove, <:r1Vault:1150596447679553636> Vault of Knowledge**",
          image: "https://media.discordapp.net/attachments/575827924343848960/1049290746190106694/vk-r_Starlight_Desert.png",
        },
      ],
    },
  },
} satisfies ShardsInfo;
