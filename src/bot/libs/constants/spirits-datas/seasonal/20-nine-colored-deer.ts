import type { SpiritsData } from "../type.d.ts";

const data: Record<string, SpiritsData> = {
  hunter: {
    name: "Hunter",
    type: "Seasonal Spirit",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/7/72/Nine-Colored-Deer-Hunter.png",
    realm: "Vault of Knowledge",
    season: "Nine-Colored Deer",
    ts: {
      eligible: false,
      returned: false,
      dates: [],
    },
    tree: {
      by: "Mimi and Sam",
      total: " ",
      image: "Hunter-Tree_Mimi.jpg",
    },
    location: {
      by: "EM",
      description: "How to reach Crescent Oasis by Clement",
      image: "Deer_Spirits_Location_Em_Clement.jpg",
    },
    expression: {
      type: "Emote",
      icon: "<:hunter:1197413131736064052>",
      level: [
        {
          title: '"Flex" Emote Level 1',
          image: "Hunter-flex-emote-level-1.gif",
        },
        {
          title: '"Flex" Emote Level 2',
          image: "Hunter-flex-emote-level-2.gif",
        },
        {
          title: '"Flex" Emote Level 3',
          image: "Hunter-flex-emote-level-3.gif",
        },
        {
          title: '"Flex" Emote Level 4',
          image: "Hunter-flex-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Outfit",
        icon: "<:HunterOutfit:1275001325754515487>",
        type: "Outfit",
        spPrice: "8 <:NineColoredDeerCandle:1274975311611564052>",
        images: [
          {
            description: "The Outfit (Front)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/36/Hunter-Outfit.png/revision/latest/scale-to-width-down/400?cb=20240108065115",
          },
          {
            description: "The Outfit (Back)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/5/5c/Hunter-Outfit-Back.png/revision/latest/scale-to-width-down/400?cb=20240225195837",
          },
        ],
      },
      {
        name: "Hair",
        icon: "<:HunterHair:1275001312450187356>",
        type: "Hair",
        isSP: true,
        images: [
          {
            description: "The Hair",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/a/ae/Hunter-Hair.png/revision/latest/scale-to-width-down/400?cb=20240109192225",
          },
        ],
      },
      {
        name: "Cape",
        icon: "<:HunterCape:1275001300026921031>",
        type: "Cape",
        spPrice: "34 <:NineColoredDeerCandle:1274975311611564052>",
        images: [
          {
            description: "The Cape (Front)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/e/e4/Hunter-Cape-front.png/revision/latest/scale-to-width-down/400?cb=20240107202751",
          },
          {
            description: "The Cape (Interior)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/e/eb/Hunter-Cape-front-interior.png/revision/latest/scale-to-width-down/400?cb=20240107202749",
          },
          {
            description: "The Cape (Back)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/2a/Hunter-Cape-back.png/revision/latest/scale-to-width-down/400?cb=20240107202748",
          },
          {
            description: "The Cape (Exterior)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/4/4e/Hunter-Cape-back-exterior.png/revision/latest/scale-to-width-down/400?cb=20240107202746",
          },
        ],
      },
    ],
  },
  princess: {
    name: "Princess",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/d/da/Nine-Colored-Deer-Princess.png",
    type: "Seasonal Spirit",
    realm: "Vault of Knowledge",
    season: "Nine-Colored Deer",
    ts: {
      eligible: false,
      returned: true,
      dates: [],
    },
    tree: {
      by: "Mimi and Sam",
      total: " ",
      image: "Princess-tree_Mimi.jpg",
    },
    location: {
      by: "EM",
      description: "How to reach Crescent Oasis by Clement",
      image: "Deer_Spirits_Location_Em_Clement.jpg",
    },
    expression: {
      type: "Emote",
      icon: "<:princess:1197413108717731840>",
      level: [
        {
          title: '"Float Spin" Emote Level 1',
          image: "Princess-float-spin-emote-level-1_1.gif",
        },
        {
          title: '"Float Spin" Emote Level 1',
          image: "Princess-float-spin-emote-level-2.gif",
        },
        {
          title: '"Float Spin" Emote Level 1',
          image: "Princess-float-spin-emote-level-3.gif",
        },
        {
          title: '"Float Spin" Emote Level 1',
          image: "Princess-float-spin-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Outfit",
        icon: "<:PrincessOutfit:1274999375642493040>",
        type: "Outfit",
        spPrice: "26 <:NineColoredDeerCandle:1274975311611564052>",
        images: [
          {
            description: "The Outfit (Front)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/6/68/Princess-Outfit.png/revision/latest/scale-to-width-down/400?cb=20240108192359",
          },
          {
            description: "The Outfit (Back)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/27/Princess-Outfit-Back.png/revision/latest/scale-to-width-down/400?cb=20240316034824",
          },
        ],
      },
      {
        name: "Mask",
        icon: "<:PrincessMask:1274999360924680243>",
        type: "Mask",
        spPrice: "8 <:NineColoredDeerCandle:1274975311611564052>",
        images: [
          {
            description: "The Mask",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/7/7a/Princess-Mask.png/revision/latest/scale-to-width-down/400?cb=20240109011122",
          },
        ],
      },
      {
        name: "Hair",
        icon: "<:PrincessHair:1274999346508595221>",
        type: "Hair",
        isSP: true,
        images: [
          {
            description: "The Hair (Front)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/0/07/Princess-Hair.png/revision/latest/scale-to-width-down/400?cb=20240118034058",
          },
          {
            description: "The Hair (back)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/9/9f/Princess-Hair-back.png/revision/latest/scale-to-width-down/400?cb=20240118034129",
          },
        ],
      },
      {
        name: "Cape",
        type: "Cape",
        icon: "<:PrincessCape:1274999333510451267>",
        isSP: true,
        images: [
          {
            description: "The Cape (Front)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/0/08/Princess-Cape-front.png/revision/latest/scale-to-width-down/400?cb=20240107071807",
          },
          {
            description: "The Cape (Interior)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/3d/Princess-Cape-front-interior.png/revision/latest/scale-to-width-down/400?cb=20240107071808",
          },
          {
            description: "The Cape (Back)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/30/Princess-Cape-back.png/revision/latest/scale-to-width-down/400?cb=20240107071809",
          },
          {
            description: "The Cape (Exterior)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/3d/Princess-Cape-back-exterior.png/revision/latest/scale-to-width-down/400?cb=20240107071811",
          },
        ],
      },
    ],
  },
  lord: {
    name: "Feudal Lord",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/c/cf/Nine-Colored-Deer-Feudal-Lord.png",
    type: "Seasonal Spirit",
    realm: "Vault of Knowledge",
    season: "Nine-Colored Deer",
    ts: {
      eligible: false,
      returned: false,
      dates: [],
    },
    tree: {
      by: "Mimi and Sam",
      total: " ",
      image: "Feudal_Lord_Tree_Mimi.jpg",
    },
    location: {
      by: "EM",
      description: "How to reach Crescent Oasis by Clement",
      image: "Deer_Spirits_Location_Em_Clement.jpg",
    },
    expression: {
      type: "Friend Action",
      icon: "<:feudallord:1197413178330578964>",
      level: [
        {
          title: '"Cradle Carry" Friend Action Level 1',
          image: "Feudal-Lord-cradle-carry-emote-level-1.gif",
        },
        {
          title: '"Cradle Carry" Friend Action Level 2',
          image: "Feudal-Lord-cradle-carry-emote-level-2.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Mask",
        icon: "<:FeudalLordMask:1274977689337466880>",
        type: "Mask",
        spPrice: "18 <:NineColoredDeerCandle:1274975311611564052>",
        images: [
          {
            description: "The Mask",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/6/6c/Feudal-Lord-Mask.png/revision/latest/scale-to-width-down/400?cb=20240107203755",
          },
        ],
      },
      {
        name: "Hair Accessory",
        icon: "<:FeudalLordHeadpiece:1274977674313334887>",
        type: "Hair Accessory",
        isSP: true,
        images: [
          {
            description: "The Accessory",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/a/a1/Feudal-Lord-Headpiece.png/revision/latest/scale-to-width-down/400?cb=20240108230815",
          },
        ],
      },
      {
        name: "Cape",
        icon: "<:FeudalLordCape:1274977662863151114>",
        isSP: true,
        type: "Cape",
        images: [
          {
            description: "The Cape (Front)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/7/7c/Feudal-Lord-Cape-front.png/revision/latest/scale-to-width-down/400?cb=20240224054151",
          },
          {
            description: "The Cape (Interior)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/f/fb/Feudal-Lord-Cape-front-interior.png/revision/latest/scale-to-width-down/400?cb=20240224054241",
          },
          {
            description: "The Cape (Back)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/4/42/Feudal-Lord-Cape-back.png/revision/latest/scale-to-width-down/400?cb=20240224054319",
          },
          {
            description: "The Cape (Exterior)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/1/13/Feudal-Lord-Cape-back-exterior.png/revision/latest/scale-to-width-down/400?cb=20240224054402",
          },
        ],
      },
      {
        name: "Music Sheet ##39",
        type: "Music Sheet",
        icon: "<:MusicIcon:1262323496852131882>",
        spPrice: "32 <:NineColoredDeerCandle:1274975311611564052>",
        images: [],
      },
    ],
  },
  herb_gather: {
    name: "Herb Gatherer",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/a/ae/Nine-Colored-Deer-Herb-Gatherer.png",
    type: "Seasonal Spirit",
    realm: "Vault of Knowledge",
    season: "Nine-Colored Deer",
    ts: {
      eligible: false,
      returned: false,
      dates: [],
    },
    tree: {
      by: "Mimi and Sam",
      total: " ",
      image: "Herb_Gatherer_Tree_Mimi.jpg",
    },
    location: {
      by: "EM",
      description: "How to reach Crescent Oasis by Clement",
      image: "Deer_Spirits_Location_Em_Clement.jpg",
    },
    expression: {
      type: "Emote",
      icon: "<:herbgatherer:1197413154938957885>",
      level: [
        {
          title: '"Whistle" Emote Level 1',
          image: "Herb-Gatherer-whistle-emote-level-1.gif",
        },
        {
          title: '"Whistle" Emote Level 2',
          image: "Herb-Gatherer-whistle-emote-level-2.gif",
        },
        {
          title: '"Whistle" Emote Level 3',
          image: "Herb-Gatherer-whistle-emote-level-3.gif",
        },
        {
          title: '"Whistle" Emote Level 4',
          image: "Herb-Gatherer-whistle-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Outfit",
        icon: "<:HerbGathererOutfit:1274975350954135552>",
        type: "Outfit",
        isSP: true,
        images: [
          {
            description: "The Outfit (Front)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/5/51/Herb-Gatherer-Outfit.png/revision/latest/scale-to-width-down/400?cb=20240108061147",
          },
          {
            description: "The Outfit (Back)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/7/72/Herb-Gatherer-Outfit-Back.png/revision/latest/scale-to-width-down/400?cb=20240225195813",
          },
        ],
      },
      {
        name: "Hair",
        icon: "<:HerbGathererHair:1274975337037697084>",
        type: "Hair",
        spPrice: "26 <:NineColoredDeerCandle:1274975311611564052>",
        notes: [
          "Note that this item is considered a Hair, not a Hair Accessory, and as such it cannot be worn over other Hairstyles",
        ],
        images: [
          {
            description: "The Hair",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/0/0a/Herb-Gatherer-Hair.png/revision/latest/scale-to-width-down/400?cb=20240107204846",
          },
        ],
      },
      {
        name: "Pot",
        type: "Prop",
        icon: "<:HerbGathererProp:1274975324345602109>",
        spPrice: "36 <:NineColoredDeerCandle:1274975311611564052>",
        notes: ["This item is purely cosmetic and does not offer any functionality"],
        images: [
          {
            description: "The Prop",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/e/e9/Herb-Gatherer-Prop.png/revision/latest/scale-to-width-down/400?cb=20240110012554",
          },
          {
            description: "On player's back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/1/10/Herb-Gatherer-Prop-on-back.png/revision/latest/scale-to-width-down/400?cb=20240106011115",
          },
        ],
      },
    ],
  },
};

export default data;
