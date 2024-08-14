import type { SpiritsData } from "#libs/types";

const data: Record<string, SpiritsData> = {
  hunter: {
    name: "Hunter",
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
      image: "Hunter-Tree_Mimi.jpg",
    },
    location: {
      by: "EM",
      description: "How to reach Crescent Oasis by Clement",
      image: "Deer_Spirits_Location_Em_Clement.jpg",
    },

    emote: {
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
  },
  princess: {
    name: "Princess",
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

    emote: {
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
  },
  lord: {
    name: "Feudal Lord",
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

    action: {
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
  },
  herb_gather: {
    name: "Herb Gatherer",
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

    emote: {
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
  },
};

export default data;
