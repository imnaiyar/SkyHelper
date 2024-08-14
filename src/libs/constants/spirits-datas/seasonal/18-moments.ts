import type { SpiritsData } from "#libs/types";

const data: Record<string, SpiritsData> = {
  nightbird: {
    name: "Nightbird Whisperer",
    type: "Seasonal Spirit",
    realm: "Daylight Prairie",
    season: "Moments",
    ts: {
      eligible: true,
      returned: false,
      dates: [],
    },
    tree: {
      by: "NyR",
      total: " ",
      image: "Nightbird_Seasonal_Chart_NyR-1.png",
    },
    location: {
      by: "Mimi and Sam",
      image: "Moments_Spirits_Location_Mimi.jpg",
    },

    call: {
      title: "Nightbird Call",
      icon: "<:nightbird:1130948807396429884>",
      image: "Nightbird_Call.mp4",
    },
  },
  monk: {
    name: "Ascetic Monk",
    type: "Seasonal Spirit",
    realm: "Daylight Prairie",
    season: "Moments",
    ts: {
      eligible: true,
      returned: false,
      dates: [],
    },
    tree: {
      by: "NyR",
      total: " ",
      image: "Ascetic_Monk_Seasonal_Chart_NyR.png",
    },
    location: {
      by: "Mimi and Sam",
      image: "Moments_Spirits_Location_Mimi.jpg",
    },

    emote: {
      icon: "<:monk:1130948859674243185>",
      level: [
        {
          title: '"Blindfold Balance" Emote Level 1',
          image: "Ascetic_Monk_Blindfold_Balance_LvL_1.gif",
        },
        {
          title: '"Blindfold Balance" Emote Level 2',
          image: "Ascetic_Monk_Blindfold_Balance_LvL_2.gif",
        },
        {
          title: '"Blindfold Balance" Emote Level 3',
          image: "Ascetic_Monk_Blindfold_Balance_LvL_3.gif",
        },
        {
          title: '"Blindfold Balance" Emote Level 4',
          image: "Ascetic_Monk_Blindfold_Balance_LvL_4.gif",
        },
      ],
    },
  },
  geologist: {
    name: "Jolly Geologist",
    type: "Seasonal Spirit",
    realm: "Daylight Prairie",
    season: "Moments",
    ts: {
      eligible: true,
      returned: false,
      dates: [],
    },
    tree: {
      by: "NyR",
      total: " ",
      image: "Jolly_Geologist_Seasonal_Chart_NyR.png",
    },
    location: {
      by: "Mimi and Sam",
      image: "Moments_Spirits_Location_Mimi.jpg",
    },

    emote: {
      icon: "<:geologist:1130948834365816973>",
      level: [
        {
          title: '"Jolly Dance" Emote Level 1',
          image: "Geologist_Jolly_Dance_LvL_1.gif",
        },
        {
          title: '"Jolly Dance" Emote Level 2',
          image: "Geologist_Jolly_Dance_LvL_2.gif",
        },
        {
          title: '"Jolly Dance" Emote Level 3',
          image: "Geologist_Jolly_Dance_LvL_3.gif",
        },
        {
          title: '"Jolly Dance" Emote Level 4',
          image: "Geologist_Jolly_Dance_LvL_4.gif",
        },
      ],
    },
  },
  ranger: {
    name: "Reassuring Ranger",
    type: "Seasonal Spirit",
    realm: "Daylight Prairie",
    season: "Moments",
    ts: {
      eligible: true,
      returned: false,
      dates: [],
    },
    tree: {
      by: "NyR",
      total: " ",
      image: "Reassuring_Ranger_Seasonal_Chart_NyR.png",
    },
    location: {
      by: "Mimi and Sam",
      image: "Moments_Spirits_Location_Mimi.jpg",
    },

    action: {
      icon: "<:ranger:1130948781026844692>",
      level: [
        {
          title: '"Sidehug" Friend Action Level 1',
          image: "Ranger_Side_Hug_LvL_1.gif",
        },
        {
          title: '"Sidehug" Friend Action Level 2',
          image: "Ranger_Side_Hug_LvL_2.gif",
        },
      ],
    },
  },
};

export default data;
