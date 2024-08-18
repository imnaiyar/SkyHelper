import type { SpiritsData } from "#libs/types";

const data: Record<string, SpiritsData> = {
  modest_dancer: {
    name: "Modest Dancer",
    type: "Seasonal Spirit",
    realm: "Valley of Triumph",
    season: "Performance",
    ts: {
      eligible: true,
      returned: false,
      dates: [],
    },
    tree: {
      by: "Clement",
      total: " ",
      image: "Modest_Dancer_Seasonal_Chart_Clement.jpg",
    },
    location: {
      by: "SkyZed",
      image: "Modest_Dancer_Location_SkyZed.jpg",
    },

    action: {
      icon: "<:modest:1131586528540381194>",
      level: [
        {
          title: '"Duet Dance" Friemd Action Level 1',
          image: "Modest-Dancer-duet-dance-emote-level-1.gif",
        },
        {
          title: '"Duet Dance" Friemd Action Level 2',
          image: "Modest-Dancer-duet-dance-emote-level-2.gif",
        },
      ],
    },
  },
  mellow_musician: {
    name: "Mellow Musician",
    type: "Seasonal Spirit",
    realm: "Valley of Triumph",
    season: "Performance",
    ts: {
      eligible: true,
      returned: false,
      dates: [],
    },
    tree: {
      by: "Clement",
      total: " ",
      image: "Mellow_Musician_Seasonal_Chart_Clement.jpg",
    },
    location: {
      by: "SkyZed",
      image: "Mellow_Musician_Location_SkyZed.jpg",
    },

    emote: {
      icon: "<:mellow:1131586502149816411>",
      level: [
        {
          title: '"Headbob" Emote Level 1',
          image: "Mellow-Musician-headbob-emote-level-1.gif",
        },
        {
          title: '"Headbob" Emote Level 2',
          image: "Mellow-Musician-headbob-emote-level-2.gif",
        },
        {
          title: '"Headbob" Emote Level 3',
          image: "Mellow-Musician-headbob-emote-level-3.gif",
        },
        {
          title: '"Headbob" Emote Level 4',
          image: "Mellow-Musician-headbob-emote-level-4.gif",
        },
      ],
    },
  },
  stagehand: {
    name: "Frantic Stagehand",
    type: "Seasonal Spirit",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/c/c0/Performance-Spirit-Frantic-Stagehand.png",
    realm: "Valley of Triumph",
    season: "Performance",
    ts: {
      eligible: true,
      returned: false,
      dates: [],
    },
    tree: {
      by: "Clement",
      total: " ",
      image: "Frantic_Stagehand_Seasonal_Chart_Clement.jpg",
    },
    location: {
      by: "SkyZed",
      image: "Frantic_Stagehand_Location_SkyZed.jpg",
    },
    action: {
      icon: "<:stagehand:1131586475226562670>",
      level: [
        {
          title: '"Handshake" Friend Action Level 1',
          image: "Frantic_Stagehand_Handshake_Action_LvL_1.gif",
        },
        {
          title: '"Handshake" Friend Action Level 2',
          image: "Frantic_Stagehand_Handshake_Action_LvL_2.gif",
        },
      ],
    },
    cosmetics: [
      {
        name: "Outfit",
        icon: "<:StagehandOutfit:1274680011894554634>",
        type: "Outfit",
        price: "70 <:RegularCandle:1207793250895794226>",
        isSP: true,
        images: [
          {
            description: "The Outfit (Front)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/0/02/SoPerformance_-_Frantic_Stagehand-outfit.png/revision/latest/scale-to-width-down/400?cb=20230626014208",
          },
          {
            description: "The Outfit (Back)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/5/5b/Frantic-Stagehand-Outfit-Back.png/revision/latest/scale-to-width-down/400?cb=20240225195716",
          },
        ],
      },
      {
        name: "Mask",
        type: "Mask",
        icon: "<:StagehandMask:1274679946689646723>",
        price: "34 <:RegularCandle:1207793250895794226>",
        spPrice: "30 <:PerformanceCandle:1274667488323571722>",
        images: [
          {
            description: "The Mask",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/8/81/SoPerformance_-_Frantic_Stagehand-mask.png/revision/latest/scale-to-width-down/400?cb=20220312223201",
          },
        ],
      },
      {
        name: "Hair",
        icon: "<:StagehandHair:1274679897373278259>",
        price: "48 <:RegularCandle:1207793250895794226>",
        isSP: true,
        images: [
          {
            description: "The Hair",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/e/e3/SoPerformance_-_Frantic_Stagehand-hairstyle.png/revision/latest/scale-to-width-down/400?cb=20240305020245",
          },
        ],
      },
      {
        name: "Music Sheet #29",
        icon: "<:MusicIcon:1262323496852131882>",
        type: "Music Sheet",
        price: "15 <:RegularCandle:1207793250895794226>",
        spPrice: "22 <:PerformanceCandle:1274667488323571722>",
        images: [],
      },
    ],
  },

  storyteller: {
    name: "Forgetful Storyteller",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/1/1e/Performance-Spirit-Forgetful-Storyteller.png",
    type: "Seasonal Spirit",
    realm: "Valley of Triumph",
    season: "Performance",
    ts: {
      eligible: true,
      returned: false,
      dates: [],
    },
    tree: {
      by: " Clement",
      total: " ",
      image: "Forgetful_Storyteller_Seasonal_Chart_Clement.jpg",
    },
    location: {
      by: "SkyZed",
      image: "Storyteller_Location_SkyZed.jpg",
    },
    emote: {
      icon: "<:storyteller:1131586451885260831>",
      level: [
        {
          title: '"Aww!" Emote Level 1',
          image: "Forgetful-Storyteller-awww-emote-level-1.gif",
        },
        {
          title: '"Aww!" Emote Level 2',
          image: "Forgetful-Storyteller-awww-emote-level-2.gif",
        },
        {
          title: '"Aww!" Emote Level 3',
          image: "Forgetful-Storyteller-awww-emote-level-3.gif",
        },
        {
          title: '"Aww!" Emote Level 4',
          image: "Forgetful-Storyteller-awww-emote-level-4.gif",
        },
      ],
    },
    cosmetics: [
      {
        name: "Outfit",
        icon: "<:StorytellerOutfit:1274667700580520008>",
        type: "Outfit",
        isSP: true,
        images: [],
      },
      {
        name: "Mask",
        icon: "<:StorytellerMask:1274667589091594280>",
        type: "Mask",
        isSP: true,
        images: [
          {
            description: "The Mask",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/24/SoPerformance_-_Forgetful_Storyteller-mask.png/revision/latest/scale-to-width-down/400?cb=20220306172212",
          },
        ],
      },
      {
        name: "Hair",
        type: "Hair",
        icon: "<:StorytellerHair:1274667514399555604>",
        spPrice: "16 <:PerformanceCandle:1274667488323571722>",
        notes: [
          " Note that this item is considered a Hair, not a Hair Accessory, and as such it can not be worn over other Hairstyles",
        ],
        images: [
          {
            description: "The Hair",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/d/da/SoPerformance_-_Forgetful_Storyteller-hairstyle.png/revision/latest/scale-to-width-down/400?cb=20220306172214",
          },
        ],
      },
      {
        name: "Cape",
        icon: "<:StorytellerCape:1274667502043009066>",
        type: "Cape",
        spPrice: "34 <:PerformanceCandle:1274667488323571722>",
        images: [
          {
            description: "The Cape (Front)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/6/6c/SOPerformance_-Forgetful_Storyteller_-_Cape_front.png/revision/latest/scale-to-width-down/400?cb=20220311011314",
          },
          {
            description: "The Cape (Interior)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/8/8b/SOPerformance_-Forgetful_Storyteller_-_Cape_front_butterly.png/revision/latest/scale-to-width-down/400?cb=20220311011313",
          },
          {
            description: "The Cape (Back)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/d/db/SOPerformance_-Forgetful_Storyteller_-_Cape_back.png/revision/latest/scale-to-width-down/400?cb=20220311011313",
          },
          {
            description: "The Cape (Exterior)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/9/9a/SOPerformance_-Forgetful_Storyteller_-_Cape_back_butterly.png/revision/latest/scale-to-width-down/400?cb=20220311011313",
          },
        ],
      },
    ],
  },
};

export default data;
