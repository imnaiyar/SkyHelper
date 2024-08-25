import type { SpiritsData } from "../type.d.ts";

const data: Record<string, SpiritsData> = {
  wise_grandparent: {
    name: "Wise Grandparent",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/2e/Belonging-Spirit-Wise-Grandpa.png",
    type: "Seasonal Spirit",
    realm: "Vault of Knowledge",
    season: "Belonging",
    ts: {
      eligible: true,
      returned: true,
      dates: ["November 09, 2023 (#100)", "November 11, 2021 (#48)", "August 06, 2020 (#15)"],
    },
    tree: {
      by: "Clement",
      total: "156 :RegularCandle: 0 :RegularHeart: 2 :AC:",
      image: "Wise_Grandparent_Tree_Clement.png",
    },
    location: {
      by: "Clement",
      image: "Wise_Grandparent_Location_Clement.jpg",
    },
    expression: {
      type: "Stance",
      icon: "<:wisegrandparent:1131650518792536125>",
      level: [{ title: "Wise Stance", image: "Wise_Stand.gif" }],
    },
    collectibles: [
      {
        name: "Bearded Mask",
        type: "Mask",
        icon: "<:WiseGrandparentMask:1272626214661656588>",
        images: [
          {
            description: "The Mask",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/4/48/Belonging_Mask_Vault.png",
          },
        ],
        price: "48 <:RegularCandle:1207793250895794226>",
        spPrice: "14 <:BelongingCandle:1272602132549341238>",
      },
      {
        name: "Golden-white Cape",
        type: "Cape",
        icon: "<:WiseGrandParentCape:1272626201139216468>",
        images: [
          {
            description: "The Cape (Front)",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/1/10/Belonging_cape_white_front.png",
          },
          {
            description: "The Cape (Interior)",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/9/93/Belonging_Cape_Vault.png",
          },
          {
            description: "The Cape (Back)",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/d/df/Belonging_cape_white_back.png",
          },
        ],
        price: "70 <:RegularCandle:1207793250895794226>",
        isSP: true,
      },
      {
        name: "Lantern",
        type: "Prop",
        icon: "<:WiseGrandparentProp:1272626086009765920>",
        images: [
          {
            description: "The Lantern",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/a/ac/Wise_grandparent_book.png",
          },
          {
            description: "Lantern on player's back",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/0/0a/Wise-Grandparent-prop-on-back.png",
          },
        ],
        price: "10 <:RegularCandle:1207793250895794226>",
        notes: [
          "This item is purely cosmetic and does not offer any functionality, and cannot be lit despite its resemblance to the lanterns seen in the Vault of Knowledge",
          "This item was not available during the Season of Belonging. Instead, it was added to the Wise Grandparent's Friendship Tree during their second visit as a Traveling Spirit on November 11, 2021",
        ],
      },
    ],
  },
  sparkler_parent: {
    name: "Sparkler Parent",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/f/f6/Belonging-Spirit-Sparkler-Parent.png",
    type: "Seasonal Spirit",
    realm: "Valley of Triumph",
    season: "Belonging",
    ts: {
      eligible: true,
      returned: true,
      dates: ["June 22, 2023 (#90)", "December 23, 2021 (#51)", "April 01, 2021 (#32)", "May 14, 2020 (#9)"],
    },
    tree: {
      by: "Clement",
      total: "116 :RegularCandle: 13 :RegularHeart: 2 :AC:",
      image: "Sparkler_Parent_Tree_Clement.png",
    },
    location: {
      by: "Clement",
      image: "Sparkler_Parent_Location_Clement.png",
    },
    expression: {
      type: "Emote",
      icon: "<:sparklerparent:1131650491923837018>",
      level: [
        {
          title: '"Sparkler" Emote Level 1',
          image: "Sparkler-Parent-sparkler-emote-level-1.gif",
        },
        {
          title: '"Sparkler" Emote Level 2',
          image: "Sparkler-Parent-sparkler-emote-level-2.gif",
        },
        {
          title: '"Sparkler" Emote Level 3',
          image: "Sparkler-Parent-sparkler-emote-level-3.gif",
        },
        {
          title: '"Sparkler" Emote Level 4',
          image: "Sparkler-Parent-sparkler-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Mask",
        type: "Mask",
        icon: "<:SparklerParentMask:1272623284306972723>",
        images: [
          {
            description: "The Mask",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/c/cd/Belonging_Mask_Valley.png",
          },
        ],
        price: "36 <:RegularCandle:1207793250895794226>",
        isSP: true,
      },
      {
        name: "Hair",
        type: "Hair",
        icon: "<:SparklerParentHair:1272623272923496572>",
        images: [
          {
            description: "The Hair",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/b/b8/Belonging_Hair_Valley.png",
          },
        ],
        price: "34 <:RegularCandle:1207793250895794226>",
        spPrice: "14 <:BelongingCandle:1272602132549341238>",
      },
      {
        name: "Pinwheel",
        type: "Prop",
        icon: "<:SparklerParentProp:1272623259073908858>",
        images: [
          {
            description: "The Pinwheel",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/9/91/Pinwheel_.png",
          },
          {
            description: "Pinwheel on player's back",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/9/9e/Sparkler-Parent-prop-on-back.png",
          },
        ],
        price: "33 <:RegularCandle:1207793250895794226>",
        notes: [
          "This item was not available during the Season of Belonging. Instead, it was added to the Sparkler Parent's Friendship Tree, during their third visit as Traveling Spirit on December 23rd, 2021.",
        ],
      },
    ],
  },
  pleaful_parent: {
    name: "Pleaful Parent",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/6/6c/Belonging-Spirit-Pleaful-Parent.png",
    type: "Seasonal Spirit",
    realm: "Golden Wasteland",
    season: "Belonging",
    ts: {
      eligible: true,
      returned: true,
      dates: ["December 22, 2022 (#77)", "December 10, 2020 (#24)", "March 26, 2020 (#5)"],
    },
    tree: {
      by: "Jed",
      total: "195 :RegularCandle: 13 :RegularHeart: 2 :AC:",
      image: "Pleaful_Parent_Tree_Jed.png",
    },
    location: {
      by: "Clement",
      image: "Pleaful_Parent_Location_Clement.jpg",
    },
    expression: {
      type: "Emote",
      icon: "<:pleafulparent:1131650465076101212>",
      level: [
        {
          title: '"Don\'t Go!" Emote Level 1',
          image: "Pleaful-Parent-dont-go-emote-level-1.gif",
        },
        {
          title: '"Don\'t Go!" Emote Level 2',
          image: "Pleaful-Parent-dont-go-emote-level-2.gif",
        },
        {
          title: '"Don\'t Go!" Emote Level 3',
          image: "Pleaful-Parent-dont-go-emote-level-3.gif",
        },
        {
          title: '"Don\'t Go!" Emote Level 4',
          image: "Pleaful-Parent-dont-go-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Mask",
        type: "Mask",
        icon: "<:PleafulParentMask:1272615600287387658>",
        images: [
          {
            description: "The Mask",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/e/eb/Belonging_Mask_Wasteland.png",
          },
        ],
        price: "42 <:RegularCandle:1207793250895794226>",
        spPrice: "18 <:BelongingCandle:1272602132549341238>",
      },
      {
        type: "Cape",
        name: "Dark-green Cape",
        icon: "<:PleafulParentCape:1272615583049056316>",
        images: [
          {
            description: "The Cape (Front)",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/6/63/Belonging_cape_dark_blue_front.png",
          },
          {
            description: "The Cape (Interior)",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/8/82/Belonging_Cape_wasteland.png",
          },
          {
            description: "The Cape (Back)",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/4/44/Belonging_cape_dark_blue_back.png",
          },
        ],
        price: "65 <:RegularCandle:1207793250895794226>",
        isSP: true,
      },
      {
        name: "Guitar",
        type: "Instrument",
        icon: "<:PleafulParentInstrument:1272615566510657619>",
        images: [
          {
            description: "The Guitar",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/e/e0/Belonging-Pleaful-Parent-Guitar.png",
          },
          {
            description: "Playing the guitar",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/0/02/Belonging_Inst_Wasteland_Guitar.png",
          },
          {
            description: "Guitar on the back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/8/87/Belonging_instrument_guitar_on_back.png",
          },
        ],
        price: "75 <:RegularCandle:1207793250895794226>",
        isSP: true,
        notes: [
          "In Harmony Hall, the Guitar can be found in the left room with all the other stringed Instruments, on the left-most side",
          "It is also available in the Village Theater, at the front left of the stage, where it can be used by all players who have completed the third Quest of the Season of Performance",
        ],
      },
    ],
  },
  hairtousle_teen: {
    name: "Hairtousle Teen",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/9/9f/Belonging-Spirit-Hairtousle-Teen.png",
    type: "Seasonal Spirit",
    realm: "Hidden Forest",
    season: "Belonging",
    ts: {
      eligible: true,
      returned: true,
      dates: ["March 28, 2024 (#110)", "June 09, 2022 (#63)", "June 11, 2020 (#11)"],
    },
    tree: {
      by: "Clement",
      total: "148 :RegularCandle: 9 :RegularHeart: 2 :AC:",
      image: "Hairtousle_Teen_Tree_Clement.png",
    },
    location: {
      by: "Clement",
      image: "Haitousle_Teen_Location_Clement.webp",
    },
    expression: {
      type: "Friend Action",
      icon: "<:hairtousle:1131650432180175008>",
      level: [
        {
          title: '"Hairtousle" Friend Action Level 1',
          image: "Hairtousle-Teen-hairtousle-emote-level-1.gif",
        },
        {
          title: '"Hairtousle" Friend Action Level 2',
          image: "Hairtousle-Teen-hairtousle-emote-level-2.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Face Accessory",
        icon: "<:HairtousleHat:1272607540458426506>",
        images: [
          {
            description: "The Earmuffs",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/b/b6/Belonging_Headgear_Forest_Ear_Muffs.png",
          },
        ],
        price: "50 <:RegularCandle:1207793250895794226>",
        isSP: true,
      },
      {
        name: "Ukulele",
        type: "Instrument",
        icon: "<:HairtousleInstrument:1272607556065431552>",
        images: [
          {
            description: "The Instrument",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/0/06/Belonging-Hairtousle-teen-Ukulele.png",
          },
          {
            description: "Playing the Instrument",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/d/d0/Belonging_Inst_Forest_Mando.png",
          },
          {
            description: "The Instrument (On the back)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/d/d7/Belonging_instrument_ukulele_on_back.png",
          },
        ],
        price: "70 <:RegularCandle:1207793250895794226>",
        spPrice: "18 <:BelongingCandle:1272602132549341238>",
        notes: [
          "In Harmony Hall, the Ukulele can be found in the left room with all the other stringed Instruments. It is the second Instrument from the left.",
        ],
      },
    ],
  },
  confetti_cousin: {
    name: "Confetti Cousin",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/0/06/Belonging-Spirit-Confetti-Cousin.png",
    type: "Seasonal Spirit",
    realm: "Daylight Prairie",
    season: "Belonging",
    ts: {
      eligible: true,
      returned: true,
      dates: ["September 28, 2023 (#97)", "January 21, 2021 (#27)", "July 09, 2020 (#13)"],
    },
    tree: {
      by: "Jay",
      total: "115 :RegularCandle: 13 :RegularHeart: 2 :AC:",
      image: "Confetti_Cousin_Tree_Jay.png",
    },
    location: {
      by: "Clement",
      image: "Confetti_Cousin_Location_Clement.png",
    },
    expression: {
      type: "Emote",
      icon: "<:confettiCousin:1131650251216920656>",
      level: [
        {
          title: '"Confetti" Emote Level 1',
          image: "Confetti-Cousin-confetti-emote-level-1.gif",
        },
        {
          title: '"Confetti" Emote Level 2',
          image: "Confetti-Cousin-confetti-emote-level-2.gif",
        },
        {
          title: '"Confetti" Emote Level 3',
          image: "Confetti-Cousin-confetti-emote-level-3.gif",
        },
        {
          title: '"Confetti" Emote Level 4',
          image: "Confetti-Cousin-confetti-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Hair",
        icon: "<:ConfettiCousinHair:1272604132464656404>",
        images: [
          {
            description: "The Hair (Front)",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/d/d5/Belonging_Hair_Prairie.png",
          },
          {
            description: "The Hair (Side)",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/7/7c/Confetti-Cousin-Hair-side.png",
          },
          {
            description: "The Hair (Back)",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/e/ea/Confetti-Cousin-Hair-back.png",
          },
        ],
        price: "42 <:RegularCandle:1207793250895794226>",
        isSP: true,
        notes: [
          "Note that this item is considered a Hair, not a Hair Accessory, and as such cannot be worn over other Hairstyles",
        ],
      },
      {
        name: "Cape",
        icon: "<:ConfettiCousinCape:1272604119550398475>",
        images: [
          {
            description: "The Cape (Front)",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/7/71/Belonging_cape_red_front.png",
          },
          {
            description: "The Cape (Interior)",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/8/87/Belonging_Cape_Prairie.png",
          },
          {
            description: "The Cape (Back)",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/7/78/Belonging_cape_red_back.png",
          },
        ],
        price: "60 <:RegularCandle:1207793250895794226>",
        spPrice: "12 <:BelongingCandle:1272602132549341238>",
      },
    ],
  },
  boogie_kid: {
    name: "Boogie Kid",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/3c/Belonging-Spirit-Boogie-Kid.png",
    type: "Seasonal Spirit",
    realm: "Isle of Dawn",
    season: "Belonging",
    ts: {
      eligible: true,
      returned: true,
      dates: ["March 02, 2023 (#82)", "July 22, 2021 (#40)", "November 12, 2020 (#22)"],
    },
    tree: {
      by: "Jed",
      total: "103 :RegularCandle: 13 :RegularHeart: 2 :AC:",
      image: "Boogie_Kid_Tree_Jed.png",
    },
    location: {
      by: "Clement",
      image: "Boogie_Kid_Location_Clement.jpg",
    },
    expression: {
      type: "Emote",
      icon: "<:boogiekid:1131650220317478923>",
      level: [
        {
          title: '"Boogie Dance" Emote Level 1',
          image: "Boogie-Kid-boogie-dance-emote-level-1.gif",
        },
        {
          title: '"Boogie Dance" Emote Level 2',
          image: "Boogie-Kid-boogie-dance-emote-level-2.gif",
        },
        {
          title: '"Boogie Dance" Emote Level 3',
          image: "Boogie-Kid-boogie-dance-emote-level-3.gif",
        },
        {
          title: '"Boogie Dance" Emote Level 4',
          image: "Boogie-Kid-boogie-dance-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Mask",
        icon: "<:BoogieMask:1272601546638753892>",
        images: [
          {
            description: "The Mask",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/e/ee/Belonging_Mask_Isle.png",
          },
        ],
        price: "30 <:RegularCandle:1207793250895794226>",
        spPrice: "12 <:BelongingCandle:1272602132549341238>",
      },
      {
        name: "Outfit",
        icon: "<:BoogiePant:1272601567853543504>",
        images: [
          {
            description: "The Outfit (Front)",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/a/a6/Belonging_Legs_Isle.png",
          },
          {
            description: "The Outfit (Back)",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/b/bb/Boogie-Kid-Outfit-Back.png",
          },
        ],
        price: "60 <:RegularCandle:1207793250895794226>",
        isSP: true,
      },
    ],
  },
};

export default data;
