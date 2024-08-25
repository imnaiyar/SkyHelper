import type { SpiritsData } from "../type.d.ts";

const data: Record<string, SpiritsData> = {
  carpenter: {
    name: "Snoozing Carpenter",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/c/c4/Enchantment-Spirit-Snoozing-Carpenter.png",
    type: "Seasonal Spirit",
    realm: "Golden Wasteland",
    season: "Enchantment",
    ts: {
      eligible: true,
      returned: true,
      dates: ["April 27, 2023 (#86)", "May 27, 2021 (#36)"],
    },
    tree: {
      by: "Jed",
      total: "112 :RegularCandle: 13 :RegularHeart: 2 :AC:",
      image: "Golden_Wasteland_-_Snoozing_Carpenter.png",
    },
    location: {
      by: "Clement",
      image: "05_Season_of_Enchantment_-_Snoozing_Carpenter.png",
    },
    expression: {
      type: "Emote",
      icon: "<:carpenter:1131649953505230848>",
      level: [
        {
          title: '"Doze" Emote Level 1',
          image: "Snoozing-Carpenter-doze-emote-level-1.gif",
        },
        {
          title: '"Doze" Emote Level 2',
          image: "Snoozing-Carpenter-doze-emote-level-2.gif",
        },
        {
          title: '"Doze" Emote Level 3',
          image: "Snoozing-Carpenter-doze-emote-level-3.gif",
        },
        {
          title: '"Doze" Emote Level 4',
          image: "Snoozing-Carpenter-doze-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Hair",
        type: "Hair",
        icon: "<:CarpenterHair:1273179072641368167>",
        images: [
          {
            description: "The Hair",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/32/Season_of_enchantment_hair_doze_v2.png/revision/latest/scale-to-width-down/500?cb=20210725154937",
          },
        ],
        price: "34 <:RegularCandle:1207793250895794226>",
        isSP: true,
      },
      {
        name: "Yellow-orange Cape",
        type: "Cape",
        icon: "<:CarpenterCape:1273179060209586187>",
        images: [
          {
            description: "Front",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/7/71/Season_of_enchantment_cape_sleepy_front_v2.png/revision/latest/scale-to-width-down/500?cb=20210725152338",
          },
          {
            description: "Interior",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/9/99/Season_of_enchantment_cape_sleepy_open_v2.png/revision/latest/scale-to-width-down/500?cb=20210725152340",
          },
          {
            description: "Back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/7/7d/Season_of_enchantment_cape_sleepy_back_v2.png/revision/latest/scale-to-width-down/500?cb=20210725152337",
          },
        ],
        price: "65 <:RegularCandle:1207793250895794226>",
        spPrice: "14 <:EnchantmentCandle:1272859574159802400>",
      },
    ],
  },
  scarecrow_farmer: {
    name: "Scarecrow Farmer",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/a/a1/Enchantment-Spirit-Scarecrow-Farmer.png",
    type: "Seasonal Spirit",
    realm: "Golden Wasteland",
    season: "Enchantment",
    ts: {
      eligible: true,
      returned: true,
      dates: ["March 31, 2022 (#58)"],
    },
    tree: {
      by: "Clement",
      total: "88 :RegularCandle: 13 :RegularHeart: 2 :AC:",
      image: "Traveling_Spirit_0582.png",
    },
    location: {
      by: "Clement",
      image: "Scarecrow_Farmer_Location_Clement.png",
    },
    expression: {
      type: "Emote",
      icon: "<:scarecrow:1131649929492828180>",
      level: [
        {
          title: '"Boo" Emote Level 1',
          image: "Scarecrow-Farmer-boo-emote-level-1.gif",
        },
        {
          title: '"Boo" Emote Level 2',
          image: "Scarecrow-Farmer-boo-emote-level-2.gif",
        },
        {
          title: '"Boo" Emote Level 3',
          image: "Scarecrow-Farmer-boo-emote-level-3.gif",
        },
        {
          title: '"Boo" Emote Level 4',
          image: "Scarecrow-Farmer-boo-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Mask",
        type: "Mask",
        icon: "<:FarmerMask:1273177460858425364>",
        images: [
          {
            description: "The Mask",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/0/04/Season_of_enchantment_mask_scare_v2.png/revision/latest/scale-to-width-down/500?cb=20240723014129",
          },
        ],
        price: "42 <:RegularCandle:1207793250895794226>",
        isSP: true,
      },
      {
        name: "Hair",
        type: "Hair",
        icon: "<:FarmerHair:1273177427216171148>",
        images: [
          {
            description: "Front",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/1/1d/Season_of_enchantment_hair_scare_v2.png/revision/latest/scale-to-width-down/500?cb=20240723020609",
          },
          {
            description: "Side",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/4/47/Scarecrow-Farmer-Hair-side.png/revision/latest/scale-to-width-down/500?cb=20240723024714",
          },
          {
            description: "Back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/f/f2/Scarecrow-Farmer-Hair-back.png/revision/latest/scale-to-width-down/500?cb=20240723024712",
          },
        ],
        price: "34 <:RegularCandle:1207793250895794226>",
        spPrice: "12 <:EnchantmentCandle:1272859574159802400>",
        notes: [
          "Note that this item is considered a Hair, not a Hair Accessory, and as such it can not be worn over other Hairstyles",
        ],
      },
    ],
  },
  herbalist: {
    name: "Playfighting Herbalist",
    image:
      "https://static.wikia.nocookie.net/sky-children-of-the-light/images/1/11/Enchantment-Spirit-Playfighting-Herbalist.png",
    type: "Seasonal Spirit",
    realm: "Golden Wasteland",
    season: "Enchantment",
    ts: {
      eligible: true,
      returned: true,
      dates: ["October 12, 2023 (#98)", "October 28, 2021 (#47)"],
    },
    tree: {
      by: "Clement",
      total: "195 :RegularCandle: 10 :RegularHeart: 2 :AC:",
      image: "Playfight_herbalist-TS2.jpg",
    },
    location: {
      by: "Clement",
      image: "Playfighting_Herbalist_Location_Clement.jpg",
    },
    expression: {
      type: "Friend Action",
      icon: "<:herbalist:1131649901814624276>",
      level: [
        {
          title: '"Playfight" Friend Action Level 1',
          image: "Playfighting-Herbalist-play-fight-emote-level-1.gif",
        },
        {
          title: '"Playfight" Friend Action Level 2',
          image: "Playfighting-Herbalist-play-fight-emote-level-2.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Mask",
        type: "Mask",
        icon: "<:HerbalistMask:1273172966771003443>",
        images: [
          {
            description: "The Mask",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/c/ce/Season_of_enchantment_mask_playfight_v2.png/revision/latest/scale-to-width-down/500?cb=20210725152358",
          },
        ],
        price: "30 <:RegularCandle:1207793250895794226>",
        spPrice: "14 <:EnchantmentCandle:1272859574159802400>",
      },
      {
        name: "Hair",
        type: "Hair",
        icon: "<:HerbalistHair:1273172856829907016>",
        images: [
          {
            description: "Front",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/a/a7/Season_of_enchantment_hair_playfight_v2.png/revision/latest/scale-to-width-down/500?cb=20240220064048",
          },
          {
            description: "Side",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/a/ae/Playfighting-Herbalist-Hair-side.png/revision/latest/scale-to-width-down/500?cb=20240222072928",
          },
          {
            description: "Back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/6/63/Playfighting-Herbalist-Hair-back.png/revision/latest/scale-to-width-down/500?cb=20240222072934",
          },
        ],
        price: "42 <:RegularCandle:1207793250895794226>",
        isSP: true,
      },
      {
        name: "Cape",
        type: "Cape",
        icon: "<:HerbalistCape:1273172841952444417>",
        images: [
          {
            description: "Front",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/5/51/Season_of_enchantment_cape_playflght_front_v2.png/revision/latest/scale-to-width-down/500?cb=20210725152331",
          },
          {
            description: "Interior",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/36/Season_of_enchantment_cape_playflght_open_v2.png/revision/latest/scale-to-width-down/500?cb=20210725152335",
          },
          {
            description: "Back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/31/Season_of_enchantment_cape_playflght_back_v2.png/revision/latest/scale-to-width-down/500?cb=20210725152330",
          },
          {
            description: "Exterior",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/a/a9/Playfighting-Herbalist-Cape-exterior.png/revision/latest/scale-to-width-down/500?cb=20240226194252",
          },
        ],
        price: "70 <:RegularCandle:1207793250895794226>",
        spPrice: "20 <:EnchantmentCandle:1272859574159802400>",
      },
      {
        name: "Yellow Orb",
        type: "Prop",
        icon: "<:HerbalistProp:1273172827356401674>",
        images: [
          {
            description: "The Prop",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/31/Playfighting-herbalist-orb-prop.png/revision/latest/scale-to-width-down/500?cb=20220903025130",
          },
          {
            description: "From a wide distance",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/f/f7/Play_fighting_herbalist%E2%80%99s_orb.jpg/revision/latest/scale-to-width-down/500?cb=20211221153645",
          },
          {
            description: "On Player's back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/e/e9/Backpack_for_props.png/revision/latest/scale-to-width-down/50?cb=20240507043343",
          },
        ],
        price: "20 <:RegularCandle:1207793250895794226>",
        notes: [
          "This item was not available during the Season of Enchantment. Instead, it was added to the Playfighting Herbalist's Friendship Tree during their first visit as a Traveling Spirit on October 28, 2021",
        ],
      },
      {
        name: "Musit Sheet #13",
        type: "Music Sheet",
        icon: "<:MusicIcon:1262323496852131882>",
        images: [],
        price: "15 <:RegularCandle:1207793250895794226>",
        spPrice: "18 <:EnchantmentCandle:1272859574159802400>",
      },
    ],
  },
  muralist: {
    name: "Nodding Muralist",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/8/8e/Enchantment-Spirit-Nodding-Muralist.png",
    type: "Seasonal Spirit",
    realm: "Golden Wasteland",
    season: "Enchantment",
    ts: {
      eligible: true,
      returned: true,
      dates: ["October 27, 2022 (#73)", "January 07, 2021 (#26)"],
    },
    tree: {
      by: "Jed",
      total: "77 :RegularCandle: 13 :RegularHeart: 2 :RegularCandle:",
      image: "Nodding_Muralist_Tree_Jed.png",
    },
    location: {
      by: "Clement",
      image: "Nodding_Muralist_Location_Clement.png",
    },
    expression: {
      type: "Emote",
      icon: "<:muralist:1131649861377339452>",
      level: [
        {
          title: '"Nod" Emote Level 1',
          image: "Nodding-Muralist-nod-emote-level-1.gif",
        },
        {
          title: '"Nod" Emote Level 2',
          image: "Nodding-Muralist-nod-emote-level-2.gif",
        },
        {
          title: '"Nod" Emote Level 3',
          image: "Nodding-Muralist-nod-emote-level-3.gif",
        },
        {
          title: '"Nod" Emote Level 4',
          image: "Nodding-Muralist-nod-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Mask",
        type: "Mask",
        icon: "<:MuralistMask:1273168859859259413>",
        images: [
          {
            description: "The Mask",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/2a/Season_of_enchantment_mask_nodding_v2.png/revision/latest/scale-to-width-down/500?cb=20210725152356",
          },
        ],
        price: "30 <:RegularCandle:1207793250895794226>",
        spPrice: "6 <:EnchantmentCandle:1272859574159802400>",
      },
      {
        name: "Hair",
        type: "Hair",
        icon: "<:MuralistHair:1273168844394860555>",
        images: [
          {
            description: "THe Hair",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/5/58/Season_of_enchantment_hair_nodding_v2.png/revision/latest/scale-to-width-down/500?cb=20240305065351",
          },
        ],
        price: "34 <:RegularCandle:1207793250895794226>",
        isSP: true,
      },
    ],
  },
  alchemist: {
    name: "Indifferent Alchemist",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/26/Enchantment-Spirit-Indifferent-Alchemist.png",
    type: "Seasonal Spirit",
    realm: "Golden Wasteland",
    season: "Enchantment",
    ts: {
      eligible: true,
      returned: true,
      dates: ["September 01, 2022 (#69)", "October 29, 2020 (#21)"],
    },
    tree: {
      by: "Jed",
      total: "167 :RegularCandle: 13 :RegularHeart: 2 :AC:",
      image: "Indifferent_Alchemist_Tree_Jed.png",
    },
    location: {
      by: "Clement",
      image: "Indifferent_Alchemist_Location_Clement.jpg",
    },
    expression: {
      type: "Emote",
      icon: "<:alchemist:1131649811439947796>",
      level: [
        {
          title: '"Shrug" Emote Level 1',
          image: "Indifferent-Alchemist-shrug-emote-level-1.gif",
        },
        {
          title: '"Shrug" Emote Level 2',
          image: "Indifferent-Alchemist-shrug-emote-level-2.gif",
        },
        {
          title: '"Shrug" Emote Level 3',
          image: "Indifferent-Alchemist-shrug-emote-level-3.gif",
        },
        {
          title: '"Shrug" Emote Level 4',
          image: "Indifferent-Alchemist-shrug-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Mask",
        type: "Mask",
        icon: "<:AlchemistMask:1273165134964985928>",
        images: [
          {
            description: "The Mask",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/38/Season_of_enchantment_mask_indifferent_v2.png/revision/latest/scale-to-width-down/500?cb=20210725152355",
          },
        ],
        price: "42 <:RegularCandle:1207793250895794226>",
        isSP: true,
      },
      {
        name: "Hair",
        type: "Hair",
        icon: "<:AlchemistHair:1273165045047758849>",
        images: [
          {
            description: "The Hair",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/7/77/Season_of_enchantment_hair_indifferent_v2.png/revision/latest/scale-to-width-down/500?cb=20240305214516",
          },
        ],
        price: "42 <:RegularCandle:1207793250895794226>",
        spPrice: "18 <:EnchantmentCandle:1272859574159802400>",
        notes: [
          "Note that this item is considered a Hair, not a Hair Accessory, and as such it can not be worn over other Hairstyles",
        ],
      },
      {
        name: "Cape",
        type: "Cape",
        icon: "<:AlchemistCape:1273165030980059260>",
        images: [
          {
            description: "Front",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/22/Season_of_enchantment_cape_indifferent_front_v2.png",
          },
          {
            description: "Interior",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/1/14/Season_of_enchantment_cape_indifferent_open_v2.png",
          },
          {
            description: "Back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/1/17/Season_of_enchantment_cape_indifferent_back_v2.png",
          },
          {
            description: "Exterior",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/8/84/Indifferent-Alchemist-Cape-exterior.png",
          },
        ],
        price: "70 <:RegularCandle:1207793250895794226>",
        isSP: true,
      },
    ],
  },
  crab_walker: {
    name: "Crab Walker",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/5/54/Enchantment-Spirit-Crab-Walker.png",
    type: "Seasonal Spirit",
    realm: "Golden Wasteland",
    season: "Enchantment",
    ts: {
      eligible: true,
      returned: true,
      dates: ["March 16, 2023 (#83)", "February 18, 2021 (#29)"],
    },
    tree: {
      by: "Jed",
      total: "115 :RegularCandle: 13 :RegularHeart: 2 :AC:",
      image: "Crab_Walker_Tree_Jed.png",
    },
    location: {
      by: "Clement",
      image: "Crab_Walker_Location_Clement.jpg",
    },
    expression: {
      type: "Emote",
      icon: "<:crabwalker:1131649778434981908>",
      level: [
        {
          title: '"Crab Walk" Emote Level 1',
          image: "Crab-Walker-crab-walk-emote-level-1.gif",
        },
        {
          title: '"Crab Walk" Emote Level 2',
          image: "Crab-Walker-crab-walk-emote-level-2.gif",
        },
        {
          title: '"Crab Walk" Emote Level 3',
          image: "Crab-Walker-crab-walk-emote-level-3.gif",
        },
        {
          title: '"Crab Walk" Emote Level 4',
          image: "Crab-Walker-crab-walk-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Hair",
        type: "Hair",
        icon: "<:CrabWalkerHair:1272232776225259594>",
        images: [
          {
            description: "The Hair",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/39/Season_of_enchantment_hair_crabwalk_v2.png/revision/latest/scale-to-width-down/500?cb=20210725155004",
          },
        ],
        price: "42 <:RegularCandle:1207793250895794226>",
        spPrice: "12 <:EnchantmentCandle:1272859574159802400>",
        notes: [
          "Note that this item is considered a Hair, not a Hair Accessory, and as such it can not be worn over other Hairstyles",
        ],
      },
      {
        name: "Cape",
        type: "Cape",
        icon: "<:CrabWalkerCape:1272232767484203009>",
        images: [
          {
            description: "Front",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/b/bc/Season_of_enchantment_cape_crab_front_v2.png",
          },
          {
            description: "Interior",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/e/e3/Season_of_enchantment_cape_crab_open_v2.png",
          },
          {
            description: "Back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/a/a5/Season_of_enchantment_cape_crab_back_v2.png",
          },
        ],
        price: "60 <:RegularCandle:1207793250895794226>",
        isSP: true,
      },
    ],
  },
};

export default data;
