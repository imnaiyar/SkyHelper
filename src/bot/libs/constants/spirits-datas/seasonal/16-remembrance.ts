import type { SpiritsData } from "../type.d.ts";

const data: Record<string, SpiritsData> = {
  wounded_warrior: {
    name: "Wounded Warrior",
    type: "Seasonal Spirit",
    realm: "Vault of Knowledge",
    season: "Remembrance",
    ts: {
      eligible: true,
      returned: false,
      dates: [],
    },
    tree: {
      by: "Clement",
      total: " ",
      image: "Wounded_Warrior_Seasonal_Chart_Clement.jpg",
    },
    location: {
      by: "Mimi and Sam",
      image: "Remembrance_Spirits_Location_Mimi.png",
    },

    expression: {
      type: "Stance",
      icon: "<:wounded:1131584200735211710>",
      level: [{ title: "Injured Stance", image: "Injured_Stance.gif" }],
    },
  },
  pleading_child: {
    name: "Pleading Child",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/d/d8/Remembrance-Spirit-Wounded-Warrior.png",
    type: "Seasonal Spirit",
    realm: "Vault of Knowledge",
    season: "Remembrance",
    ts: {
      eligible: true,
      returned: false,
      dates: [],
    },
    tree: {
      by: "Clement",
      total: " ",
      image: "Pleading_Child_Seasonal_Chart_Clement.jpg",
    },
    location: {
      by: "Mimi and Sam",
      image: "Remembrance_Spirits_Location_Mimi.png",
    },
    expression: {
      type: "Emote",
      icon: "<:pleading:1131584152332935331>",
      level: [
        {
          title: '"Pleading" Emote Level 1',
          image: "Pleading_Child_Pleading_Lvl_1.gif",
        },
        {
          title: '"Pleading" Emote Level 2',
          image: "Pleading_Child_Pleading_Lvl_2.gif",
        },
        {
          title: '"Pleading" Emote Level 3',
          image: "Pleading_Child_Pleading_Lvl_3.gif",
        },
        {
          title: '"Pleading" Emote Level 4',
          image: "Pleading_Child_Pleading_Lvl_4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Outfit",
        icon: "<:WoundedWarriorOutfit:1274771681864454227>",
        type: "Outfit",
        spPrice: "30 <:RemembranceCandle:1274767706305859677>",
        images: [
          {
            description: "The Outfit (Front)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/4/41/SoRemembrance-Wounded-Warrior-Outfit.png/revision/latest/scale-to-width-down/400?cb=20230626022039",
          },
          {
            description: "The Outfit (Back)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/7/71/SoRemembrance-Wounded-Warrior-Outfit-Back.png/revision/latest/scale-to-width-down/400?cb=20240225152922",
          },
        ],
      },
      {
        name: "Mask",
        icon: "<:WoundedWarriorMask:1274771668551602268>",
        type: "Mask",
        isSP: true,
        images: [
          {
            description: "The Mask",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/d/d4/SoRemembrance-Wounded-Warrior-Mask.png/revision/latest/scale-to-width-down/400?cb=20221218020600",
          },
        ],
      },
      {
        name: "Cape",
        icon: "<:WoundedWarriorCape:1274771654135779428>",
        type: "Cape",
        isSP: true,
        images: [
          {
            description: "The Cape (Front)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/e/e7/SoRemembrance-Wounded-Warrior-Cape-Front.png/revision/latest/scale-to-width-down/400?cb=20221218015720",
          },
          {
            description: "The Cape (Interior)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/6/67/SoRemembrance-Wounded-Warrior-Cape-Front-Butterfly.png/revision/latest/scale-to-width-down/400?cb=20221218015754",
          },
          {
            description: "The Cape (Back)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/b/b3/SoRemembrance-Wounded-Warrior-Cape-Back.png/revision/latest/scale-to-width-down/400?cb=20221218015804",
          },
          {
            description: "The Cape (Exterior)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/0/08/SoRemembrance-Wounded-Warrior-Cape-Back-Butterfly.png/revision/latest/scale-to-width-down/400?cb=20221218015811",
          },
        ],
      },
    ],
  },

  veteran: {
    name: "Bereft Veteran",
    type: "Seasonal Spirit",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/8/86/Remembrance-Spirit-Bereft-Veteran.png",
    realm: "Vault of Knowledge",
    season: "Remembrance",
    ts: {
      eligible: true,
      returned: false,
      dates: [],
    },
    tree: {
      by: "Clement",
      total: " ",
      image: "Bereft_Veteran_Seasonal_Chart_Clement.jpg",
    },
    location: {
      by: "Mimi and Sam",
      image: "Remembrance_Spirits_Location_Mimi.png",
    },
    expression: {
      type: "Emote",
      icon: "<:Bereft:1131584129054560396>",
      level: [
        {
          title: '"Grieving" Emote Level 1',
          image: "Veteran_Grieving_LvL_1.gif",
        },
        {
          title: '"Grieving" Emote Level 2',
          image: "Veteran_Grieving_LvL_2.gif",
        },
        {
          title: '"Grieving" Emote Level 3',
          image: "Veteran_Grieving_LvL_3.gif",
        },
        {
          title: '"Grieving" Emote Level 4',
          image: "Veteran_Grieving_LvL_4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Mask",
        icon: "<:VeteranMask:1274769664085594245>",
        type: "Mask",
        spPrice: "6 <:RemembranceCandle:1274767706305859677>",
        images: [
          {
            description: "The Mask",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/8/8d/SoRemembrance-Bereft-Veteran-Mask.png/revision/latest/scale-to-width-down/400?cb=20221217213207",
          },
        ],
      },
      {
        name: "Hair",
        icon: "<:VeteranHair:1274769648637968445>",
        type: "Hair",
        isSP: true,
        images: [
          {
            description: "The Hair",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/6/6d/SoRemembrance-Bereft-Veteran-Hair.png/revision/latest/scale-to-width-down/400?cb=20221209024340",
          },
        ],
      },
      {
        name: "Cape",
        icon: "<:VeteranCape:1274769636428353616>",
        type: "Cape",
        spPrice: "34 <:RemembranceCandle:1274767706305859677>",
        images: [
          {
            description: "The Cape (Front)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/3d/SoRemembrance-Bereft-Veteran-Cape-front.png/revision/latest/scale-to-width-down/400?cb=20221218012602",
          },
          {
            description: "The Cape (Interior)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/3f/SoRemembrance-Bereft-Veteran-Cape-front-butterfly.png/revision/latest/scale-to-width-down/400?cb=20221218012602",
          },
          {
            description: "The Cape (Back)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/b/b7/SoRemembrance-Bereft-Veteran-Cape-back.png/revision/latest/scale-to-width-down/400?cb=20221218012602",
          },
          {
            description: "The Cape (Exterior)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/7/77/SoRemembrance-Bereft-Veteran-Cape-back-butterfly.png/revision/latest/scale-to-width-down/400?cb=20221218012600",
          },
        ],
      },
    ],
  },
  tea_brewer: {
    name: "Tiptoeing Tea-Brewer",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/e/ea/Remembrance-Spirit-Tiptoeing-Tea-Brewer.png",
    type: "Seasonal Spirit",
    realm: "Vault of Knowledge",
    season: "Remembrance",
    ts: {
      eligible: true,
      returned: false,
      dates: [],
    },
    tree: {
      by: "Clement",
      total: " ",
      image: "Tea_Brewer_Seasonal_Chart_Clement.jpg",
    },
    location: {
      by: "Mimi and Sam",
      image: "Remembrance_Spirits_Location_Mimi.png",
    },
    expression: {
      type: "Emote",
      icon: "<:tiptoe:1131584176882192455>",
      level: [
        {
          title: '"Tiptoeing" Emote Level 1',
          image: "Teamaker_Tiptoeing_Lvl_1.gif",
        },
        {
          title: '"Tiptoeing" Emote Level 2',
          image: "Teamaker_Tiptoeing_Lvl_2.gif",
        },
        {
          title: '"Tiptoeing" Emote Level 3',
          image: "Teamaker_Tiptoeing_Lvl_3.gif",
        },
        {
          title: '"Tiptoeing" Emote Level 4',
          image: "Teamaker_Tiptoeing_Lvl_4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Outfit",
        icon: "<:TeaBrewererOutfit:1274767756826247229>",
        type: "Outfit",
        isSP: true,
        images: [
          {
            description: "The Outfit (Front)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/2a/SoRemembrance-Tiptoeing-Tea-Brewer-Outfit.png/revision/latest/scale-to-width-down/400?cb=20230627013140",
          },
          {
            description: "The Outfit (Back)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/a/a8/SoRemembrance-Tiptoeing-Tea-Brewer-Outfit-Back.png/revision/latest/scale-to-width-down/400?cb=20240225152638",
          },
        ],
      },
      {
        name: "Hair",
        type: "Hair",
        icon: "<:TeaBrewererHair:1274767734210564209>",
        isSP: true,
        images: [
          {
            description: "The Hair",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/4/4c/SoRemembrance-Tiptoeing-Tea-Brewer-Hair.png/revision/latest/scale-to-width-down/400?cb=20221218014039",
          },
        ],
      },
      {
        name: "Cape",
        type: "Cape",
        icon: "<:TeaBrewererCape:1274767719664980048>",
        spPrice: "38 <:RemembranceCandle:1274767706305859677>",
        images: [
          {
            description: "The Cape (The Front)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/4/43/SoRemembrance-Tiptoeing-Tea-Brewer-Cape-Front.png/revision/latest/scale-to-width-down/400?cb=20221218014918",
          },
          {
            description: "The Cape (Interior)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/1/14/SoRemembrance-Tiptoeing-Tea-Brewer-Cape-Front-Butterfly.png/revision/latest/scale-to-width-down/400?cb=20221218014932",
          },
          {
            description: "The Cape (Back)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/b/b6/SoRemembrance-Tiptoeing-Tea-Brewer-Cape-Back.png/revision/latest/scale-to-width-down/400?cb=20221218014946",
          },
          {
            description: "The Cape (Exterior)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/a/a6/SoRemembrance-Tiptoeing-Tea-Brewer-Cape-Back-Butterfly.png/revision/latest/scale-to-width-down/400?cb=20221218014958",
          },
        ],
      },
    ],
  },
};

export default data;
