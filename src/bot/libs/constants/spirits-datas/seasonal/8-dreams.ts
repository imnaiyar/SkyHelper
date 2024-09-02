import type { SpiritsData } from "../type.d.ts";

const data: Record<string, SpiritsData> = {
  spinning_mentor: {
    name: "Spinning Mentor",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/2b/Dreams-Spirit-Spinning-Mentor.png",
    type: "Seasonal Spirit",
    realm: "Valley of Triumph",
    season: "Dreams",
    ts: {
      eligible: true,
      returned: true,
      dates: ["August 15, 2024 (#120)", "July 06, 2023 (#91)", "April 14, 2022 (#59)"],
    },
    tree: {
      by: "Clement",
      total: "169 :RegularCandle: 13 :RegularHeart: 2 :AC:",
      image: "Spinning_Mentor_Tree_Clement.png",
    },
    location: {
      by: "Clement",
      image: "Spinning_Mentor_Location_Clement.png",
    },
    expression: {
      type: "Emote",
      icon: "<:mentor:1131645203548209162>",
      level: [
        {
          title: '"Spin Trick" Level 1',
          image: "Spinning-Mentor-spin-trick-emote-level-1.gif",
        },
        {
          title: '"Spin Trick" Level 2',
          image: "Spinning-Mentor-spin-trick-emote-level-2.gif",
        },
        {
          title: '"Spin Trick" Level 3',
          image: "Spinning-Mentor-spin-trick-emote-level-3.gif",
        },
        {
          title: '"Spin Trick" Level 4',
          image: "Spinning-Mentor-spin-trick-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Mask",
        type: "Mask",
        icon: "<:MentorMask:1273189554429628497>",
        images: [
          {
            description: "The Mask",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/e/ed/Dreams_mask_spinning_v2.png/revision/latest/scale-to-width-down/500?cb=20240814071503",
          },
        ],
        price: "42 <:RegularCandle:1207793250895794226>",
        spPrice: "23 <:DreamsCandle:1273190033855221831>",
      },
      {
        name: "Hair",
        icon: "<:MentorHair:1273189539074015285>",
        type: "Hair",
        images: [
          {
            description: "The Hair",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/a/ab/Dreams_hair_spinning_v2.png/revision/latest/scale-to-width-down/600?cb=20210727194552",
          },
        ],
        price: "44 <:RegularCandle:1207793250895794226>",
        spPrice: "13 <:DreamsCandle:1273190033855221831>",
      },
      {
        name: "Cape",
        type: "Cape",
        icon: "<:MentorCape:1273189522288676916>",
        images: [
          {
            description: "Front",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/a/ab/Dreams_cape_spinning_front_v2.png/revision/latest/scale-to-width-down/500?cb=20210727194542",
          },
          {
            description: "Interior",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/1/1b/Dreams_cape_spinning_open_v2.png/revision/latest/scale-to-width-down/500?cb=20210727194538",
          },
          {
            description: "Back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/4/4f/Dreams_cape_spinning_back_v2.png/revision/latest/scale-to-width-down/500?cb=20210727194540",
          },
        ],
        price: "70 <:RegularCandle:1207793250895794226>",
        isSP: true,
      },
    ],
  },
  postman: {
    name: "Peeking Postman",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/8/8a/Dreams-Spirit-Peeking-Postman.png",
    type: "Seasonal Spirit",
    realm: "Valley of triumph",
    season: "Dreams",
    ts: {
      eligible: true,
      returned: true,
      dates: ["June 23, 2022 (#64)"],
    },
    tree: {
      by: "Clement",
      total: "217 :RegularCandle: 13 :RegularHeart: 2 :AC:",
      image: "Peeking_Postman_Tree_Clement.png",
    },
    location: {
      by: "Clement",
      image: "Peeking_Postman_Location_Clement.png",
    },

    expression: {
      type: "Emote",
      icon: "<:postman:1131645181926584341>",
      level: [
        {
          title: '"Peek" Emote Level 1',
          image: "Peeking-Postman-peek-emote-level-1.gif",
        },
        {
          title: '"Peek" Emote Level 2',
          image: "Peeking-Postman-peek-emote-level-2.gif",
        },
        {
          title: '"Peek" Emote Level 3',
          image: "Peeking-Postman-peek-emote-level-3.gif",
        },
        {
          title: '"Peek" Emote Level 4',
          image: "Peeking-Postman-peek-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Outfit",
        type: "Outfit",
        icon: "<:PostmanOutfit:1273654355521831064>",
        price: "70 <:RegularCandle:1207793250895794226> (Together with shoe)",
        spPrice: "21 <:DreamsCandle:1273190033855221831>",
        notes: ["In the 0.24.5 Patch, the boots attached to the Outfit were removed and became a separate cosmetic item"],
        images: [
          {
            description: "Front",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/5/5e/Dreams_pants_peeking_v2.png/revision/latest/scale-to-width-down/400?cb=20240223021209",
          },
          {
            description: "Back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/6/68/Peeking-Postman-Outfit-back.png/revision/latest/scale-to-width-down/400?cb=20240223021435",
          },
        ],
      },
      {
        name: "Shoes",
        type: "Outfit",
        icon: "<:PostmanShoe:1273654337989644309>",
        price: "Included with the outfit",
        skipTree: true, // Skips the inclusion in friendhip tree calculations as this is included with the outfit
        images: [
          {
            description: "The Shoes",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/d/d9/Peeking-Postman-Shoes.png/revision/latest/scale-to-width-down/400?cb=20240223021433",
          },
        ],
        notes: [
          "In the 0.24.5 Patch, the boots were removed from the Peeking Postman's outfit and became a separate cosmetic item",
        ],
      },
      {
        name: "Mask",
        type: "Mask",
        icon: "<:PostmanMask:1273654324374802442>",
        price: "54 <:RegularCandle:1207793250895794226>",
        isSP: true,
        images: [
          {
            description: "The Mask",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/7/7e/Dreams_mask_peeking_v2.png/revision/latest/scale-to-width-down/400?cb=20210727194601",
          },
        ],
      },
      {
        name: "Cape",
        type: "Cape",
        icon: "<:PostmanCape:1273654311779303585>",
        price: "65 <:RegularCandle:1207793250895794226>",
        spPrice: "27 <:DreamsCandle:1273190033855221831>",
        images: [
          {
            description: "Front",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/2f/Dreams_cape_peeking_front_v2.png/revision/latest/scale-to-width-down/400?cb=20210727194535",
          },
          {
            description: "Interior",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/c/c9/Dreams_cape_peeking_open_v2.png/revision/latest/scale-to-width-down/400?cb=20210727194537",
          },
          {
            description: "Back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/d/d5/Dreams_cape_peeking_back_v2.png/revision/latest/scale-to-width-down/400?cb=20210727194533",
          },
        ],
      },
      {
        name: "Music Sheet #18",
        type: "Music Sheet",
        icon: "<:MusicIcon:1262323496852131882>",
        price: "15 <:RegularCandle:1207793250895794226>",
        spPrice: "12 <:DreamsCandle:1273190033855221831>",
        images: [],
      },
    ],
  },
  dancing_performer: {
    name: "Dancing Performer",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/9/9a/Dreams-Spirit-Dancing-Performer.png",
    type: "Seasonal Spirit",
    realm: "Valley of Triumph",
    season: "Dreams",
    ts: {
      eligible: true,
      returned: true,
      dates: ["April 25, 2024 (#112)"],
    },
    tree: {
      by: "NyR",
      total: "251 :RegularCandle: 13 :RegularHeart: 2 :AC:",
      image: "Dancing_Performer_Tree_NyR-1.png",
    },
    location: {
      by: "Clement",
      image: "Dancing_Performer_Location_Clement.png",
    },

    expression: {
      type: "Emote",
      icon: "<:dancing:1131645163383574569>",
      level: [
        {
          title: '"Snow Dance" Emote Level 1',
          image: "Dancing-Performer-show-dance-emote-level-1.gif",
        },
        {
          title: '"Snow Dance" Emote Level 2',
          image: "Dancing-Performer-show-dance-emote-level-2.gif",
        },
        {
          title: '"Snow Dance" Emote Level 3',
          image: "Dancing-Performer-show-dance-emote-level-3.gif",
        },
        {
          title: '"Snow Dance" Emote Level 4',
          image: "Dancing-Performer-show-dance-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Mask",
        type: "Mask",
        icon: "<:DancingPerformerMask:1273651363909210193>",
        price: "48 <:RegularCandle:1207793250895794226>",
        isSP: true,
        images: [
          {
            description: "The Mask",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/6/64/Dreams_mask_dancing_v2.png/revision/latest/scale-to-width-down/400?cb=20210727194559",
          },
        ],
      },
      {
        name: "Hair",
        type: "Hair",
        icon: "<:DancingPerformerHair:1273651350579712060>",
        price: "45 <:RegularCandle:1207793250895794226>",
        isSP: true,
        notes: [
          "Note that this item is considered a Hair, not a Hair Accessory, and as such it can not be worn over other Hairstyles",
        ],
        images: [
          {
            description: "Front",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/3b/Dreams_hair_dancing_v2.png/revision/latest/scale-to-width-down/400?cb=20240329225647",
          },
          {
            description: "Side",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/0/06/Dancing-Performer-Hair-side.png/revision/latest/scale-to-width-down/400?cb=20240329230101",
          },
          {
            description: "Back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/4/49/Dancing-Performer-Hair-back.png/revision/latest/scale-to-width-down/400?cb=20240329225815",
          },
        ],
      },
      {
        name: "Cape",
        type: "Cape",
        icon: "<:DancingPerformerCape:1273651337724432385>",
        price: "75 <:RegularCandle:1207793250895794226>",
        spPrice: "27 <:DreamsCandle:1273190033855221831>",
        images: [
          {
            description: "Front",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/6/6d/Dreams_cape_dancing_front_v2.png/revision/latest/scale-to-width-down/400?cb=20210727194529",
          },
          {
            description: "Interior",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/8/88/Dreams_cape_dancing_open_v2.png/revision/latest/scale-to-width-down/400?cb=20210727194531",
          },
          {
            description: "Back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/2b/Dreams_cape_dancing_back_v2.png/revision/latest/scale-to-width-down/400?cb=20240407232124",
          },
          {
            description: "Exterior",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/0/0d/Dancing-Performer-Cape-exterior.png/revision/latest/scale-to-width-down/400?cb=20240317195246",
          },
        ],
      },
      {
        name: "Lute",
        type: "Instrument",
        icon: "<:DancingPerformerInstrument:1273651325946695710>",
        price: "70 <:RegularCandle:1207793250895794226>",
        isSP: true,
        notes: [
          "In Harmony Hall, the Lute can be found in the left room with all the other stringed Instruments. It is the third Instrument from the left",
        ],
        images: [
          {
            description: "The Instrument",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/6/61/Dreams-Dancing-Performer-Guitar.png/revision/latest/scale-to-width-down/400?cb=20220520151436",
          },
          {
            description: "Playing the lute",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/23/Dreams_instrument_dancing_lute_v2.png/revision/latest/scale-to-width-down/400?cb=20240407234146",
          },
          {
            description: "On player's back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/7/7e/Dreams_instrument_dancing_lute_on_back_v2.png/revision/latest/scale-to-width-down/400?cb=20240407231951",
          },
        ],
      },
    ],
  },
  hermit: {
    name: "Bearhug Hermit",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/31/Dreams-Spirit-Bearhug-Hermit.png",
    type: "Seasonal Spirit",
    realm: "Valley of Triumph",
    season: "Dreams",
    ts: {
      eligible: true,
      returned: true,
      dates: ["February 15, 2024 (#107)", "November 24, 2022 (#75)"],
    },
    tree: {
      by: "Clement",
      total: "190 :RegularCandle: 8 :RegularHeart: 2 :AC:",
      image: "BearHug_Hermit_Tree_Clement.png.jpg",
    },
    location: {
      by: "Clement",
      image: "Bearhug_Hermit_Location_Clement.png.jpg",
    },

    expression: {
      type: "Friend Action",
      icon: "<:hermit:1131645142898581535>",
      level: [
        {
          title: '"Bear Hug" Friend Action Level 1',
          image: "Bearhug-Hermit-bearhug-emote-level-1.gif",
        },
        {
          title: '"Bear Hug" Friend Action Level 2',
          image: "Bearhug_Hermit_Bear_Hug_LvL_2.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Outfit",
        type: "Outfit",
        icon: "<:HermisOutfit:1273648642951086082>",
        images: [
          {
            description: "Front",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/0/0f/Dreams_pants_bearhug_v2.png/revision/latest/scale-to-width-down/400?cb=20240803214301",
          },
          {
            description: "Back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/f/f4/Bearhug-Hermit-Outfit-Back.png/revision/latest/scale-to-width-down/400?cb=20240225195448",
          },
        ],
        price: "70 <:RegularCandle:1207793250895794226>",
        isSP: true,
      },
      {
        name: "Red Horns",
        type: "Face Accessory",
        icon: "<:HermitFaceAccessory:1273648626756882542>",
        images: [
          {
            description: "The Accessory",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/1/19/Dreams_headpiece_bearhug_v2.png/revision/latest/scale-to-width-down/400?cb=20210727194554",
          },
        ],
        price: "42 <:RegularCandle:1207793250895794226>",
        isSP: true,
      },
      {
        name: "Hair",
        type: "Hair",
        icon: "<:HermitHair:1273648604635992085>",
        price: "50 <:RegularCandle:1207793250895794226>",
        spPrice: "29 <:DreamsCandle:1273190033855221831>",
        images: [
          {
            description: "Front",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/9/9e/Bearhug-Hermit-Hair-front.png/revision/latest/scale-to-width-down/400?cb=20240221070100",
          },
          {
            description: "Side",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/c/c7/Dreams_hair_bearhug_v2.png/revision/latest/scale-to-width-down/400?cb=20240221065549",
          },
          {
            description: "Back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/34/Bearhug-Hermit-Hair-back.png/revision/latest/scale-to-width-down/400?cb=20240221065823",
          },
        ],
      },
      {
        name: "Music Sheet #19",
        type: "Music Sheet",
        icon: "<:MusicIcon:1262323496852131882>",
        price: "15 <:RegularCandle:1207793250895794226>",
        isSP: true,
        images: [],
      },
    ],
  },
};

export default data;
