import type { SpiritsData } from "../type.d.ts";

const data: Record<string, SpiritsData> = {
  stretching: {
    name: "Stretching Guru",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/4/46/Gratitude-Spirit-Stretching-Guru.png",
    type: "Seasonal Spirit",
    realm: "Daylight Prairie",
    season: "Gratitude",
    ts: {
      eligible: true,
      returned: true,
      dates: ["March 17, 2022 (#57)", "April 30, 2020 (#8)"],
    },
    tree: {
      by: "Clement",
      total: "104 :RegularCandle: 13 :RegularHeart: 2 :AC:",
      image: "Stretching_Guru_Tree.png",
    },
    location: {
      by: "Clement",
      image: "Stretching_Guru_Location.png",
    },

    expression: {
      type: "Emote",
      icon: "<:stretchingGuru:1153511673949343805>",
      level: [
        {
          title: '"Yoga Emote" Level 1',
          image: "Stretching-Guru-yoga-emote-level-1.gif",
        },
        {
          title: '"Yoga Emote" Level 2',
          image: "Stretching-Guru-yoga-emote-level-2.gif",
        },
        {
          title: '"Yoga Emote" Level 3',
          image: "Stretching-Guru-yoga-emote-level-3.gif",
        },
        {
          title: '"Yoga Emote" Level 4',
          image: "Stretching-Guru-yoga-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Hair",
        images: [
          {
            description: "The Hair",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/4/43/SoG2-2019_Hat.png",
          },
        ],
        icon: "<:StretchingHair:1272175411849203763>",
        price: "26 <:RegularCandle:1207793250895794226>",
        spPrice: "6 <:GratitudeSC:1272164085815054337>",
      },
      {
        name: "Cape",
        images: [
          {
            description: "The Cape (Front)",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/e/e3/Gratitude_cape_prairie_front.png",
          },
          {
            description: "The Cape (Interior)",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/8/8f/Gratitude_cape_prairie_inner.png",
          },
          {
            description: "THe Cape (Back)",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/7/7b/Cape1-Season_of_Gratitude_2019.png",
          },
        ],
        icon: "<:StretchingCape:1272175400071594086>",
        price: "65 <:RegularCandle:1207793250895794226>",
        isSP: true,
      },
    ],
  },
  sassy: {
    name: "Sassy Drifter",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/5/5d/Gratitude-Spirit-Sassy-Drifter.png",
    type: "Seasonal Spirit",
    realm: "Isle of Dawn",
    season: "Gratitude",
    ts: {
      eligible: true,
      returned: true,
      total: "5",
      dates: [
        "April 11, 2024 (#111)",
        "December 08, 2022 (#76)",
        "July 08, 2021 (#39)",
        "May 28, 2020 (#10)",
        "January 31, 2020 (#1)",
      ],
    },
    tree: {
      by: "Jed",
      total: "87 :RegularCandle: 2 :AC:",
      image: "Sassy_Drifter_Tree.png",
    },
    location: {
      by: "Clement",
      image: "Sassy_Drifter_Location.jpg",
    },

    expression: {
      type: "Stance",
      icon: "<:sassyDrifter:1153511651522396322>",
      level: [{ title: "Sassy Stance", image: "Sassy_Stance.gif" }],
    },
    collectibles: [
      {
        name: "Mask",
        icon: "<:SassyMask:1272172108193075326>",
        images: [
          {
            description: "The Mask (Front)",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/d/db/SoG2-2019_Cat_Mask.png",
          },
          {
            description: "The Mask (Side)",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/f/f5/Sassy-Drifter-Mask-side.png",
          },
        ],
        isSP: true,
        price: "48 <:RegularCandle:1207793250895794226>",
      },
      {
        name: "Hair",
        icon: "<:SassyHair:1272172095169626163>",
        images: [
          {
            description: "The Hair (Front)",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/0/01/Sassy-Drifter-Hair-front.png",
          },
          {
            description: "The Hair (Side)",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/1/1c/Hair40-SeasonOfGratitude_2019.png",
          },
          {
            description: "The Hair (Back)",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/e/e3/Sassy-Drifter-Hair-back.png",
          },
        ],
        price: "26 <:RegularCandle:1207793250895794226>",
        spPrice: "6 <:GratitudeSC:1272164085815054337>",
      },
    ],
  },
  saluting: {
    name: "Saluting Protector",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/8/82/Gratitude-Spirit-Saluting-Protector.png",
    type: "Seasonal Spirit",
    realm: "Golden Wasteland",
    season: "Gratitude",
    ts: {
      eligible: true,
      returned: true,
      total: "2",
      dates: ["January 20, 2022 (#53)", "November 21, 2024 (#127)"],
    },
    tree: {
      by: "Clement",
      total: "145 :RegularCandle: 13 :RegularHeart: 2 :AC:",
      image: "saluting_Protector_Tree.png",
    },
    location: {
      by: "Clement",
      image: "Saluting_Performer_Location.png",
    },

    expression: {
      type: "Emote",
      icon: "<:salutingProtector:1153511628596334723>",
      level: [
        {
          title: '"Acknowledge Emote" Level 1',
          image: "Saluting-Protector-acknowledge-emote-level-1.gif",
        },
        {
          title: '"Acknowledge Emote" Level 2',
          image: "Saluting-Protector-acknowledge-emote-level-2.gif",
        },
        {
          title: '"Acknowledge Emote" Level 3',
          image: "Saluting-Protector-acknowledge-emote-level-3.gif",
        },
        {
          title: '"Acknowledge Emote" Level 4',
          image: "Saluting-Protector-acknowledge-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Mask",
        icon: "<:SalutingMask:1272167717390254182>",
        images: [
          {
            description: "The Mask",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/e/eb/Mask17-Seasonal_SoG_2019.png",
          },
        ],
        isSP: true,
        price: "42 <:RegularCandle:1207793250895794226>",
      },
      {
        name: "Cape",
        icon: "<:SalutingCape:1272167679687528520>",
        images: [
          {
            description: "The Cape (Front)",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/8/87/Gratitude_cape_white_front.png",
          },
          {
            description: "The Cape (Interior)",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/36/Cape2-Season_of_Gratitude_2019.png",
          },
          {
            description: "The Cape (Back)",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/9/92/Gratitude_cape_white_back.png",
          },
          {
            description: "The Cape (Exterior)",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/6/69/Saluting-Protector-Cape-Exterior.png",
          },
        ],
        price: "75 <:RegularCandle:1207793250895794226>",
        spPrice: "20 <:GratitudeSC:1272164085815054337>",
      },
    ],
  },
  provoking: {
    name: "Provoking Performer",
    type: "Seasonal Spirit",
    realm: "Hidden Forest",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/25/Gratitude-Spirit-Provoking-Performer.png",
    season: "Gratitude",
    ts: {
      eligible: true,
      returned: true,
      dates: ["March 30, 2023 (#84)", "October 01, 2020 (#19)", "March 12, 2020 (#4)"],
    },
    tree: {
      by: "Clement",
      total: "104 :RegularCandle: 13 :RegularHeart: 2 :AC:",
      image: "Provoking_Performer_Tree.png.jpg",
    },
    location: {
      by: "Clement",
      image: "Provoking_Performer_Location.png",
    },

    expression: {
      type: "Emote",
      icon: "<:provokingProtector:1153511606475554906>",
      level: [
        {
          title: '"Kabuki Emote" Level 1',
          image: "Provoking-Performer-kabuki-emote-level-1.gif",
        },
        {
          title: '"Kabuki Emote" Level 2',
          image: "Provoking-Performer-kabuki-emote-level-2.gif",
        },
        {
          title: '"Kabuki Emote" Level 3',
          image: "Provoking-Performer-kabuki-emote-level-3.gif",
        },
        {
          title: '"Kabuki Emote" Level 4',
          image: "Provoking-Performer-kabuki-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Mask",
        images: [
          {
            description: "THe Mask",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/4/42/Mask18-Seasonal_SoG_2019.png",
          },
        ],
        icon: "<:PerformerMask:1272165997440270386>",
        isSP: true,
        price: "42 <:RegularCandle:1207793250895794226>",
      },
      {
        name: "Hair",
        images: [
          {
            description: "The Hair",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/0/05/Hair41-SeasonOfGratitude_2019.png",
          },
        ],
        price: "34 <:RegularCandle:1207793250895794226>",
        spPrice: "14 <:GratitudeSC:1272164085815054337>",
        icon: "<:PerformerHair:1272165874937368626>",
      },
    ],
  },
  leaping: {
    name: "Leaping Dancer",
    type: "Seasonal Spirit",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/a/ae/Gratitude-Spirit-Leaping-Dancer.png",
    realm: "Valley of Triumph",
    season: "Gratitude",
    ts: {
      eligible: true,
      returned: true,
      total: "3",
      dates: ["June 6, 2024 (#115)", "March 18, 2021 (#31)", "June 25, 2020 (#12)", ["July 03, 2023 (SV#3)", "July 16, 2023"]],
    },
    tree: {
      by: "Jed",
      total: "107 :RegularCandle: 13  2:AC:",
      image: "leaping_dancer_tree.png",
    },
    location: {
      by: "Clement",
      image: "Leaping_Dancer_Location.png",
    },

    expression: {
      type: "Emote",
      icon: "<:leepingDancer:1153511583532716032>",
      level: [
        {
          title: '"Kabuki Emote" Level 1',
          image: "Leaping-Dancer-leap-emote-level-1.gif",
        },
        {
          title: '"Kabuki Emote" Level 2',
          image: "Leaping-Dancer-leap-emote-level-2.gif",
        },
        {
          title: '"Kabuki Emote" Level 3',
          image: "Leaping-Dancer-leap-emote-level-3.gif",
        },
        {
          title: '"Kabuki Emote" Level 4',
          image: "Leaping-Dancer-leap-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Mask",
        images: [
          {
            description: "The Mask (Front)",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/f/fd/Mask19-Seasonal_SoG_2019.png",
          },
          {
            description: "The Mask (Side)",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/f/f9/Leaping-Dancer-Mask-side.png",
          },
        ],
        price: "54 <:RegularCandle:1207793250895794226>",
        isSP: true,
        icon: "<:LeapingMask:1272162395581841408>",
      },
      {
        name: "Instrument",
        images: [
          {
            description: "The Instrument",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/c/c9/Gratitude-Leaping-Dancer-Small-Bell.png",
          },
          {
            description: "Playing the Instrument",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/8/8f/Instrument-Small_Bell-Seasonal.png",
          },
          {
            description: "Instrument on a player's back",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/4/43/Gratitude_sm_bell_on_back.png",
          },
        ],
        price: "40 <:RegularCandle:1207793250895794226>",
        icon: "<:LeapingInstrument:1272162378565288037>",
        spPrice: "10 <:GratitudeSC:1272164085815054337>",
      },
    ],
  },
  shaman: {
    name: "Greeting Shaman",
    type: "Seasonal Spirit",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/3e/Gratitude-Spirit-Greeting-Shaman.png",
    realm: "Vault of Knowledge",
    season: "Gratitude",
    ts: {
      eligible: true,
      returned: true,
      total: "3",
      dates: ["May 26, 2022 (#62)", "July 23, 2020 (#14)", ["July 03, 2023 (SV#3)", "July 16, 2023"]],
    },
    tree: {
      by: "Clement",
      total: "112 :RegularCandle: 13 :RegularHeart: 2 :AC:",
      image: "Greeting_Shaman_Tree.png",
    },
    location: {
      by: "Clement",
      image: "Greeting_Shaman_Location.png",
    },

    expression: {
      type: "Emote",
      icon: "<:greetingShaman:1153511559490965664>",
      level: [
        {
          title: '"Kung Fu Emote" Level 1',
          image: "Greeting-Shaman-kung-fu-emote-level-1.gif",
        },
        {
          title: '"Kung Fu Emote" Level 2',
          image: "Greeting-Shaman-kung-fu-emote-level-2.gif",
        },
        {
          title: '"Kung Fu Emote" Level 3',
          image: "Greeting-Shaman-kung-fu-emote-level-3.gif",
        },
        {
          title: '"Kung Fu Emote" Level 4',
          image: "Greeting-Shaman-kung-fu-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Mask",
        images: [
          {
            description: "The Mask",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/b/b7/Mask16-Seasonal_SoG_2019.png",
          },
        ],
        isSP: true,
        icon: "<:ShamanMask:1272141932579127357>",
        price: "54 <:RegularCandle:1207793250895794226>",
      },
      {
        name: "Instrument",
        images: [
          {
            description: "The Instrument",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/1/18/Gratitude-Greeting-Shaman-Large_bell.png",
          },
          {
            description: "Playing the Instrument",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/4/4d/Instrument-Large_Bell-Seasonal.png",
          },
          {
            description: "Instrument on the Back",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/2c/Gratitude_lg_bell_on_back.png",
          },
        ],
        icon: "<:ShamanInstrument:1272141953798242327>",
        price: "45 <:RegularCandle:1207793250895794226>",
        isSP: true,
      },
    ],
  },
};

export default data;
