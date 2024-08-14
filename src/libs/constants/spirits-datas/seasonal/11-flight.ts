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
  },
};

export default data;
