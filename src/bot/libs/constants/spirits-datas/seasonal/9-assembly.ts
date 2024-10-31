import type { SpiritsData } from "../type.d.ts";

const data: Record<string, SpiritsData> = {
  scolding_student: {
    name: "Scolding Student",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/1/10/Assembly-Spirit-Scolding-Student.png",
    type: "Seasonal Spirit",
    realm: "Hidden Forest",
    season: "Assembly",
    ts: {
      eligible: true,
      returned: true,
      dates: ["August 18, 2022 (#68)"],
    },
    tree: {
      by: "Clement",
      total: "157 :RegularCandle: 13 :RegularHeart: 2 :AC:",
      image: "Scolding_Student_Tree_Clement.png",
    },
    location: {
      by: "Clement",
      image: "Scolding_Student_Location_Clement.png",
    },
    expression: {
      type: "Emote",
      icon: "<:student:1131591495993016421>",
      level: [
        {
          title: '"Scold" Emote Level 1',
          image: "Scolding-Student-scold-emote-level-1.gif",
        },
        {
          title: '"Scold" Emote Level 2',
          image: "Scolding-Student-scold-emote-level-2.gif",
        },
        {
          title: '"Scold" Emote Level 3',
          image: "Scolding-Student-scold-emote-level-3.gif",
        },
        {
          title: '"Scold" Emote Level 4',
          image: "Scolding-Student-scold-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Mask",
        type: "Mask",
        icon: "<:StudenMask:1273881509014667305>",
        price: "24 <:RegularCandle:1207793250895794226>",
        spPrice: "10 <:AssemblyCandle:1273826333897523250>",
        images: [
          {
            description: "The Mask",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/c/cb/Assembly_mask_scolding_v2.png/revision/latest/scale-to-width-down/400?cb=20210727192720",
          },
        ],
      },
      {
        name: "Hair",
        type: "Hair",
        icon: "<:StudenHair:1273881494632403004>",
        price: "50 <:RegularCandle:1207793250895794226>",
        spPrice: "18 <:AssemblyCandle:1273826333897523250>",
        images: [
          {
            description: "The Hair",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/3e/Assembly_hair_scolding_v2.png/revision/latest/scale-to-width-down/400?cb=20210727192709",
          },
        ],
      },
      {
        name: "Cape",
        type: "Cape",
        icon: "<:StudentCape:1273881483215372359>",
        price: "70 <:RegularCandle:1207793250895794226>",
        isSP: true,
        images: [
          {
            description: "Front",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/d/dc/Assembly_cape_scolding_front_v2.png/revision/latest/scale-to-width-down/400?cb=20210727192654",
          },
          {
            description: "Side",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/e/e3/Assembly_cape_scolding_open_v2.png/revision/latest/scale-to-width-down/400?cb=20210727192656",
          },
          {
            description: "Back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/1/1a/Assembly_cape_scolding_back_v2.png/revision/latest/scale-to-width-down/400?cb=20210727192652",
          },
        ],
      },
    ],
  },
  cadet: {
    name: "Scaredy Cadet",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/0/0c/Assembly-Spirit-Scaredy-Cadet.png",
    type: "Seasonal Spirit",
    realm: "Hidden Forest",
    season: "Assembly",
    ts: {
      eligible: true,
      returned: true,
      dates: [["March 06, 2023 (SV#1)", "March 19, 2023"]],
    },
    tree: {
      by: "NyR",
      total: "152 :RegularCandle: 13 :RegularHeart: 2 :AC:",
      image: "Scaredy_Cadet_Tree_NyR.jpg",
    },
    location: {
      by: "Clement",
      image: "Scaredy_Cadet_Location_Clement.png",
    },
    expression: {
      type: "Emote",
      icon: "<:cadet:1131591467429793962>",
      level: [
        {
          title: '"Eww" Emote Level 1',
          image: "Scaredy-Cadet-eww-emote-level-1.gif",
        },
        {
          title: '"Eww" Emote Level 2',
          image: "Scaredy-Cadet-eww-emote-level-2.gif",
        },
        {
          title: '"Eww" Emote Level 3',
          image: "Scaredy-Cadet-eww-emote-level-3.gif",
        },
        {
          title: '"Eww" Emote Level 4',
          image: "Scaredy-Cadet-eww-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Mask",
        icon: "<:CadetMask:1273870700729597974>",
        type: "Mask",
        price: "24 <:RegularCandle:1207793250895794226>",
        spPrice: "5 <:AssemblyCandle:1273826333897523250>",
        images: [
          {
            description: "The Mask",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/b/b6/Assembly_mask_scaredy_v2.png/revision/latest/scale-to-width-down/400?cb=20210727192718",
          },
        ],
      },
      {
        name: "Hair",
        type: "Hair",
        icon: "<:CadetHair:1273870678919217217>",
        price: "45 <:RegularCandle:1207793250895794226>",
        isSP: true,
        images: [
          {
            description: "The Hair",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/26/Assembly_hair_scaredy_v2.png/revision/latest/scale-to-width-down/400?cb=20210727192707",
          },
        ],
      },
      {
        name: "Hammock",
        type: "Prop",
        icon: "<:CadetProp:1273870663396102205>",
        price: "55 <:RegularCandle:1207793250895794226>",
        spPrice: "20 <:AssemblyCandle:1273826333897523250>",
        images: [
          {
            description: "The Hammock",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/35/Assembly_prop_hammock_down.png/revision/latest/scale-to-width-down/400?cb=20220902225105",
          },
          {
            description: "Hammock in use",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/5/5c/Scaredy-Cadet-Hammock-Prop-Using.png/revision/latest/scale-to-width-down/400?cb=20240508145306",
          },
          {
            description: "On player's back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/1/11/Assembly_prop_hammock_on_back.png/revision/latest/scale-to-width-down/400?cb=20210807183319",
          },
        ],
      },
      {
        name: "Music Sheet #21",
        icon: "<:MusicIcon:1262323496852131882>",
        price: "15 <:RegularCandle:1207793250895794226>",
        spPrice: "15 <:AssemblyCandle:1273826333897523250>",
        images: [],
      },
    ],
  },
  foresterer: {
    name: "Daydream Forester",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/d/dc/Assembly-Spirit-Daydream-Forester.png",
    type: "Seasonal Spirit",
    realm: "Hidden Forest",
    season: "Assembly",
    ts: {
      eligible: true,
      returned: true,
      dates: ["March 14, 2024 (#109)", "April 28, 2022 (#60)"],
    },
    tree: {
      by: "Clement",
      total: "96 :RegularCandle: 13 :RegularHeart: 2 :AC:",
      image: "Daydream_Forestor_Tree_Clement.png",
    },
    location: {
      by: "Clement",
      image: "Daydreaming_Forester_Location_Clement.png",
    },
    expression: {
      type: "Emote",
      icon: "<:forester:1131591420239675402>",
      level: [
        {
          title: '"Bubbles" Emote Level 1',
          image: "Daydream-Forester-bubbles-emote-level-1.gif",
        },
        {
          title: '"Bubbles" Emote Level 2',
          image: "Daydream-Forester-bubbles-emote-level-2.gif",
        },
        {
          title: '"Bubbles" Emote Level 3',
          image: "Daydream-Forester-bubbles-emote-level-3.gif",
        },
        {
          title: '"Bubbles" Emote Level 4',
          image: "Daydream-Forester-bubbles-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Mask",
        type: "Mask",
        icon: "<:ForesterMask:1273867569442586674>",
        price: "24 <:RegularCandle:1207793250895794226>",
        spPrice: "5 <:AssemblyCandle:1273826333897523250>",
        images: [
          {
            description: "The Mask",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/0/06/Assembly_mask_daydream_v2.png/revision/latest/scale-to-width-down/400?cb=20210727192715",
          },
        ],
      },
      {
        name: "Hair",
        icon: "<:ForesterHair:1273867555303592048>",
        type: "Hair",
        images: [
          {
            description: "Front",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/25/Daydream-Forester-Hair-Front.png/revision/latest/scale-to-width-down/400?cb=20240315133842",
          },
          {
            description: "Side",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/1/10/Daydream-Forester-Hair-Side.png/revision/latest/scale-to-width-down/400?cb=20240315133246",
          },
          {
            description: "Back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/e/e5/Daydream-Forester-Hair-Back.png/revision/latest/scale-to-width-down/400?cb=20240315133455",
          },
        ],
        price: "44 <:RegularCandle:1207793250895794226>",
        isSP: true,
      },
      {
        name: "Music Sheet #20",
        icon: "<:MusicIcon:1262323496852131882>",
        type: "Music Sheet",
        price: "15 <:RegularCandle:1207793250895794226>",
        spPrice: "15 <:AssemblyCandle:1273826333897523250>",
        images: [],
      },
    ],
  },
  adventurer: {
    name: "Marching Adventurer",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/d/dd/Assembly-Spirit-Marching-Adventurer.png",
    type: "Seasonal Spirit",
    realm: "Hidden Forest",
    season: "Assembly",
    ts: {
      eligible: true,
      returned: true,
      dates: [["March 06, 2023 (SV#1)", "March 19, 2023"]],
    },
    tree: {
      by: "NyR",
      total: "143:RegularCandle: 13 :RegularHeart: 2 :AC:",
      image: "Marching_Adventurer_Tree_NyR.jpg",
    },
    location: {
      by: "Clement",
      image: "Marching_Adventurer_Location_Clement.png",
    },
    expression: {
      type: "Emote",
      icon: "<:adventurer:1131591445057372272>",
      level: [
        {
          title: '"Marching" Emote Level 1',
          image: "Marching-Adventurer-marching-emote-level-1.gif",
        },
        {
          title: '"Marching" Emote Level 2',
          image: "Marching-Adventurer-marching-emote-level-2.gif",
        },
        {
          title: '"Marching" Emote Level 3',
          image: "Marching-Adventurer-marching-emote-level-3.gif",
        },
        {
          title: '"Marching" Emote Level 4',
          image: "Marching-Adventurer-marching-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Mask",
        type: "Mask",
        icon: "<:AdventurerMask:1273862074652430437>",
        price: "30 <:RegularCandle:1207793250895794226>",
        isSP: true,
        images: [
          {
            description: "The Mask",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/f/fd/Assembly_mask_marching_v2.png/revision/latest/scale-to-width-down/400?cb=20210727192717",
          },
        ],
      },
      {
        name: "Hair",
        type: "Hair",
        icon: "<:AdventurerHair:1273862060496650271>",
        price: "45 <:RegularCandle:1207793250895794226>",
        spPrice: "12 <:AssemblyCandle:1273826333897523250>",
        images: [
          {
            description: "The Hair",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/5/54/Assembly_hair_marching_v2.png/revision/latest/scale-to-width-down/400?cb=20210727192706",
          },
        ],
      },
      {
        name: "Prop",
        type: "Prop",
        icon: "<:AdventurerProp:1273862046852579368>",
        price: "55 <:RegularCandle:1207793250895794226>",
        spPrice: "22 <:AssemblyCandle:1273826333897523250>",
        images: [
          {
            description: "The Prop",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/30/Assembly_prop_torch_lit_2.png/revision/latest/scale-to-width-down/400?cb=20220902225003",
          },
          {
            description: "On player's back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/9/91/Assembly_prop_torch_on_back.png/revision/latest/scale-to-width-down/400?cb=20210807183329",
          },
        ],
        notes: [
          "It is a placeable Prop that can be used to decorate Shared Spaces. When lit, its flame will recharge the player's wings",
        ],
      },
    ],
  },
  scout: {
    name: "Chuckling Scout",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/b/b8/Assembly-Spirit-Chuckling-Scout.png",
    type: "Seasonal Spirit",
    realm: "Hidden Forest",
    season: "Assembly",
    ts: {
      eligible: true,
      returned: true,
      dates: [["March 06, 2023 (SV#1)", "March 19, 2023"]],
    },
    tree: {
      by: "NyR",
      total: "159 :RegularCandle: 13 :RegularHeart: 2 :AC:",
      image: "Chuckling_Scout_Tree_NyR.jpg",
    },
    location: {
      by: "Clement",
      image: "Chuckling_Scout_Location_Clement.png",
    },
    expression: {
      type: "Emote",
      icon: "<:scout:1131591393282904084>",
      level: [
        {
          title: '"Chuckle" Emote Level 1',
          image: "Chuckling-Scout-chuckle-emote-level-1.gif",
        },
        {
          title: '"Chuckle" Emote Level 2',
          image: "Chuckling-Scout-chuckle-emote-level-2.gif",
        },
        {
          title: '"Chuckle" Emote Level 3',
          image: "Chuckling-Scout-chuckle-emote-level-3.gif",
        },
        {
          title: '"Chuckle" Emote Level 4',
          image: "Chuckling-Scout-chuckle-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Outfit",
        icon: "<:ScoutOutfit:1273848191304863859>",
        type: "Outfit",
        price: "65 <:RegularCandle:1207793250895794226> (Together with shoes)",
        isSP: true,
        notes: ["In the 0.22.0 Patch, the boots attached to the Outfit were removed and became a separate cosmetic item"],
        images: [
          {
            description: "Front",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/c/c6/Assembly_pants_chuckling_v2.png/revision/latest/scale-to-width-down/400?cb=20240303040359",
          },
          {
            description: "Back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/3b/Chuckling-Scout-Outfit-Back.png/revision/latest/scale-to-width-down/400?cb=20240225195535",
          },
        ],
      },
      {
        name: "Shoes",
        type: "Outfit",
        icon: "<:ScoutShoes:1273848176927047782>",
        price: "Included with the outfit",
        images: [
          {
            description: "The shoes",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/36/Chuckling-Scout-shoes.png/revision/latest/scale-to-width-down/400?cb=20230923181717",
          },
        ],
        skipTree: true,
        notes: ["In the 0.22.0 Patch, the boots were removed from the attached outfit and became a separate cosmetic item"],
      },
      {
        name: "Mask",
        type: "Mask",
        icon: "<:ScoutMask:1273848170731802645>",
        price: "36 <:RegularCandle:1207793250895794226>",
        spPrice: "12 <:AssemblyCandle:1273826333897523250>",
        images: [
          {
            description: "The Mask",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/e/e0/Assembly_mask_chuckling_v2.png/revision/latest/scale-to-width-down/400?cb=20210727192713",
          },
        ],
      },
      {
        name: "Hoop",
        type: "Prop",
        icon: "<:ScoutProp:1273848341012152321>",
        price: "45 <:RegularCandle:1207793250895794226>",
        spPrice: "20 <:AssemblyCandle:1273826333897523250>",
        images: [
          {
            description: "The Prop",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/4/4d/Assembly_prop_hoop_down.png/revision/latest/scale-to-width-down/400?cb=20220902224909",
          },
          {
            description: "On player's back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/5/51/Assembly_prop_hoop_on_back.png/revision/latest/scale-to-width-down/400?cb=20210807183323",
          },
        ],
        notes: [
          "It is a placeable Prop that can be used to decorate Shared Spaces. This item is purely cosmetic and does not offer any functionality",
        ],
      },
    ],
  },
  botanist: {
    name: "Baffled Botanist",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/8/81/Assembly-Spirit-Baffled-Botanist.png",
    type: "Seasonal Spirit",
    realm: "Hidden Forest",
    season: "Assembly",
    ts: {
      eligible: true,
      returned: true,
      dates: ["September 26, 2024 (#123)", ["March 06, 2023 (SV#1)", "March 19, 2023"], "January 05, 2023 (#78)"],
    },
    tree: {
      by: "Clement",
      total: "127 :RegularCandle: 13 :RegularHeart: 2 :AC:",
      image: "Baffled_Botanist_Tree_Clement.png",
    },
    location: {
      by: "Clement",
      image: "Baffled_Botanist_Location_Clement.png",
    },
    expression: {
      type: "Emote",
      icon: "<:botanist:1131591369492795503>",
      level: [
        {
          title: '"Facepalm" Emote Level 1',
          image: "Baffled-Botanist-facepalm-emote-level-1.gif",
        },
        {
          title: '"Facepalm" Emote Level 2',
          image: "Baffled-Botanist-facepalm-emote-level-2.gif",
        },
        {
          title: '"Facepalm" Emote Level 3',
          image: "Baffled-Botanist-facepalm-emote-level-3.gif",
        },
        {
          title: '"Facepalm" Emote Level 4',
          image: "Baffled-Botanist-facepalm-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Mask",
        type: "Mask",
        icon: "<:BotanistMask:1273826071946723438>",
        price: "24 <:RegularCandle:1207793250895794226>",
        spPrice: "14 <:AssemblyCandle:1273826333897523250>",
        images: [
          {
            description: "The Mask",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/7/7b/Assembly_mask_baffled_v2.png/revision/latest/scale-to-width-down/400?cb=20210727192712",
          },
        ],
      },
      {
        name: "Hair",
        type: "Hair",
        icon: "<:BotanistHair:1273826065017606147>",
        price: "45 <:RegularCandle:1207793250895794226>",
        isSP: true,
        images: [
          {
            description: "The Hair",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/f/fa/Assembly_hair_baffled_v2.png/revision/latest/scale-to-width-down/400?cb=20210727192702",
          },
        ],
      },
      {
        name: "Spotlight",
        type: "Prop",
        icon: "<:BotanistProp:1273826056331067433>",
        price: "45 <:RegularCandle:1207793250895794226>",
        isSP: true,
        images: [
          {
            description: "The prop",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/5/56/Baffled-botanist-spotlight-prop-closeup.png/revision/latest/scale-to-width-down/400?cb=20220901055616",
          },
          {
            description: "The prom in use",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/6/67/Assembly_prop_lamp_down.png/revision/latest/scale-to-width-down/400?cb=20210807183324",
          },
          {
            description: "On Player's back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/f/f3/Assembly_prop_lamp_on_back.png/revision/latest/scale-to-width-down/400?cb=20210807183326",
          },
        ],
      },
    ],
  },
};

export default data;
