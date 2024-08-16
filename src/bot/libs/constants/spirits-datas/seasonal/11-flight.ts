import type { SpiritsData } from "#libs/types";

const data: Record<string, SpiritsData> = {
  chimesmith: {
    name: "Tinkering Chimesmith",
    type: "Seasonal Spirit",
    realm: "Hidden Forest",
    season: "Flight",
    ts: {
      eligible: true,
      returned: true,
      dates: ["May 11, 2023 (#87)"],
    },
    tree: {
      by: "Clement",
      total: "238 :RegularCandle: 0 :RegularHeart: 2 :AC:",
      image: "Tinkering_Chimesmith_Tree_Clement.png",
    },
    location: {
      by: "Clement",
      image: "Tinkering_Chimesmith_Location_Clement.png",
    },

    stance: {
      title: "Tinker Stance",
      icon: "<:chimesmith:1131589172822544435>",
      image: "Tinker_Stance_.gif",
    },
  },
  navigator: {
    name: "Lively Navigator",
    type: "Seasonal Spirit",
    realm: "Hidden Forest",
    season: "Flight",
    ts: {
      eligible: true,
      returned: true,
      dates: ["August 17, 2023 (#94)"],
    },
    tree: {
      by: "Xander",
      total: "198 :RegularCandle: 13 :RegularHeart: 2 :AC:",
      image: "Lively_Navigator_Tree_Xander.jpg",
    },
    location: {
      by: "Clement",
      image: "Lively_Navigator_Location_Clement.jpg",
    },

    emote: {
      icon: "<:navigator:1131589125636632596>",
      level: [
        {
          title: '"Navigate" Emote Level 1',
          image: "Lively-Navigator-navigate-emote-level-1.gif",
        },
        {
          title: '"Navigate" Emote Level 2',
          image: "Lively-Navigator-navigate-emote-level-2.gif",
        },
        {
          title: '"Navigate" Emote Level 3',
          image: "Lively-Navigator-navigate-emote-level-3.gif",
        },
        {
          title: '"Navigate" Emote Level 4',
          image: "Lively-Navigator-navigate-emote-level-4.gif",
        },
      ],
    },
  },
  light_whisperer: {
    name: "Light Whisperer",
    type: "Seasonal Spirit",
    realm: "Hidden Forest",
    season: "Flight",
    ts: {
      eligible: true,
      returned: true,
      dates: ["February 29, 2024 (#108)"],
    },
    tree: {
      by: "Kai Ji",
      total: "243 :RegularCandle: 0 :RegularHeart: 2 :AC: ",
      image: "Light_Whisperer_Tree_Kai-Ji.png",
    },
    location: {
      by: "Clement",
      image: "Light_Whisper_Location_Clement.png",
    },

    call: {
      title: "Baby Manta Call",
      icon: "<:lightwhisperer:1131589102626672761>",
      image: "Baby_Manta_Call-2.mp4",
    },
  },
  talented_builder: {
    name: "Talented Builder",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/a/ac/Flight-Spirit-Talented-Builder.png",
    type: "Seasonal Spirit",
    realm: "Hidden Forest",
    season: "Flight",
    ts: {
      eligible: true,
      returned: true,
      dates: ["November 23, 2023 (#101)"],
    },
    tree: {
      by: "Kontra",
      total: "183 :RegularCandle: 13 :RegularHeart: 2 :AC:",
      image: "Talented_Builder_Tree_Kontra.png",
    },
    location: {
      by: "Clement",
      image: "Talented_Builder_Location_Clement.png",
    },
    emote: {
      icon: "<:builder:1131589149464481812>",
      level: [
        {
          title: '"Voila!" Emote Level 1',
          image: "Talented-Builder-voila-emote-level-1.gif",
        },
        {
          title: '"Voila!" Emote Level 2',
          image: "Talented-Builder-voila-emote-level-2.gif",
        },
        {
          title: '"Voila!" Emote Level 3',
          image: "Talented-Builder-voila-emote-level-3.gif",
        },
        {
          title: '"Voila!" Emote Level 4',
          image: "Talented-Builder-voila-emote-level-4.gif",
        },
      ],
    },
    cosmetics: [
      {
        name: "Outfit",
        icon: "<:BuilderOutfit:1274063253521039401>",
        type: "Outfit",
        price: "70 <:RegularCandle:1207793250895794226>",
        isSP: true,
        images: [
          {
            description: "Outfit (Front)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/4/45/Season_of_flight_pants_2_talented_builder_gs.PNG/revision/latest/scale-to-width-down/400?cb=20230626013814",
          },
          {
            description: "Outfit (Back)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/b/bd/Talented-Builder-Outfit-Back.png/revision/latest/scale-to-width-down/400?cb=20240225200623",
          },
        ],
      },
      {
        name: "White ruff",
        type: "Neck Accessory",
        icon: "<:BuilderNecklace:1274063232105189497>",
        price: "40 <:RegularCandle:1207793250895794226>",
        spPrice: "16 <:FlightCandle:1274063266389430312>",
        images: [
          {
            description: "The Ruff",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/a/a0/Season_of_flight_neckpiece_talented_builder.png/revision/latest/scale-to-width-down/400?cb=20210904225558",
          },
        ],
      },
      {
        name: "Hair",
        type: "Hair",
        icon: "<:BuilderHair:1274062847068082361>",
        price: "45 <:RegularCandle:1207793250895794226>",
        spPrice: "26 <:FlightCandle:1274063266389430312>",
        images: [
          {
            description: "Hair (Front)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/4/46/Season_of_flight_hair_1_talented_builder_gs.png/revision/latest/scale-to-width-down/400?cb=20240222065757",
          },
          {
            description: "Hair (Side)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/28/Talented-Builder-Hair-side.png/revision/latest/scale-to-width-down/400?cb=20240222072933",
          },
          {
            description: "Hair (Back)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/e/e8/Talented-Builder-Hair-back.png/revision/latest/scale-to-width-down/400?cb=20240222072937",
          },
        ],
        notes: [
          "Note that this item is considered a Hair, not Hair Accessory, and such it can not be worn over other hairstyles",
        ],
      },
      {
        name: "Music Sheet #25",
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
