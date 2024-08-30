import type { SpiritsData } from "../type.d.ts";

const data: Record<string, SpiritsData> = {
  fireprophet: {
    name: "Prophet of Fire",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/b/b7/Prophecy-Spirit-Prophet-of-Fire.png",
    type: "Seasonal Spirit",
    realm: "Isle of Dawn",
    season: "Prophecy",
    ts: {
      eligible: true,
      returned: true,
      dates: ["August 03, 2023 (#93)", "December 09, 2021 (#50)"],
    },
    tree: {
      by: "Clement",
      total: "216 :RegularCandle: 26 :RegularHeart: 2 :AC:",
      image: "Prophet_of_Fire_Tree_Jay.png",
    },
    location: {
      by: "Clement",
      image: "Prophet_of_Fire_Location_Clement.jpg",
    },

    expression: {
      type: "Emote",
      icon: "<:fireprophet:1131649539682603008>",
      level: [
        {
          title: '"Chest Pound" Level 1',
          image: "Prophet-of-Fire-chest-pound-emote-level-3.gif",
        },
        {
          title: '"Chest Pound" Level 2',
          image: "Prophet-of-Fire-chest-pound-emote-level-2.gif",
        },
        {
          title: '"Chest Pound" Level 3',
          image: "Prophet-of-Fire-chest-pound-emote-level-3.gif",
        },
        {
          title: '"Chest Pound" Level 4',
          image: "Prophet-of-Fire-chest-pound-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Outfit",
        icon: "<:FirePOutfit:1273630782677716992>",
        type: "Outfit",
        images: [
          {
            description: "Front",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/d/de/Prophecy-Prophet_of_Fire_Leggings.png/revision/latest/scale-to-width-down/400?cb=20240811194621",
          },
          {
            description: "Back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/f/f5/Prophet-of-Fire-Outfit-Back.png/revision/latest/scale-to-width-down/400?cb=20240225200830",
          },
        ],
        price: "75 <:RegularCandle:1207793250895794226>",
        isSP: true,
      },
      {
        name: "Mask",
        icon: "<:FirePMask:1273630768379461643>",
        type: "Mask",
        images: [
          {
            description: "The Mask",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/6/6e/Prophecy-Prophet_of_Fire_Mask.png/revision/latest/scale-to-width-down/400?cb=20210725225609",
          },
        ],
        price: "54 <:RegularCandle:1207793250895794226>",
        spPrice: "29 <:ProphecyCandle:1273522988637224980>",
      },
      {
        name: "Hair",
        icon: "<:FirePHair:1273630749945233462>",
        type: "Hair",
        images: [
          {
            description: "The Hair",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/8/87/Prophecy-Prophet_of_Fire_Hair.png/revision/latest/scale-to-width-down/400?cb=20210725225204",
          },
        ],
        price: "44 <:RegularCandle:1207793250895794226>",
        isSP: true,
      },
      {
        name: "Fire Cauldron",
        icon: "<:FirePProp1:1273630736577986671>",
        type: "Props",
        images: [
          {
            description: "The Cauldron",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/d/d9/Fire_prophet%3Fs_cauldron_.png/revision/latest/scale-to-width-down/400?cb=20220902231159",
          },
          {
            description: "On player's back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/e/e6/Fire_prophets_cauldron_on_back.png/revision/latest/scale-to-width-down/400?cb=20230526222113",
          },
        ],
        price: "13 <:regularHeart:1207793247792013474>",
        notes: [
          "It is a placeable Prop that can be used to decorate Shared Spaces. When lit, its flame will recharge the player's wings",
          "This item was not available during the Season of Prophecy. Instead, it was introduced during the Prophet of Fire's first visit as a Traveling Spirit on December 9, 2021",
        ],
      },
      {
        name: "Fire element sticker",
        icon: "<:FirePProp2:1273630722443448401>",
        type: "Props",
        images: [
          {
            description: "The sticker",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/8/81/SoProphecy-Prophet-of-Fire-Prop-Sticker-image-Ed.png/revision/latest/scale-to-width-down/400?cb=20230803171021",
          },
          {
            description: "On player's back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/e/e9/Backpack_for_props.png/revision/latest/scale-to-width-down/400?cb=20240507043343",
          },
        ],
        price: "15 <:RegularCandle:1207793250895794226>",
        notes: [
          " It is a placeable Prop that can be used to decorate Shared Spaces. This item is purely cosmetic and does not offer any functionality",
          "This item was not available during the Season of Prophecy. Instead, it was first introduced during the Prophet of Fire's second visit as a Traveling Spirit on August 3, 2023",
        ],
      },
      {
        name: "Music Sheet #17",
        icon: "<:MusicIcon:1262323496852131882>",
        type: "Music Sheet",
        images: [],
        price: "15 <:RegularCandle:1207793250895794226>",
        isSP: true,
      },
    ],
  },
  airprophet: {
    name: "Prophet of Air",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/f/f5/Prophecy-Spirit-Prophet-of-Air.png",
    type: "Seasonal Spirit",
    realm: "Isle of Dawn",
    season: "Prophecy",
    ts: {
      eligible: true,
      returned: true,
      dates: ["May 15, 2023 (SV#2)", "May 12, 2022 (#61)"],
    },
    tree: {
      by: "Clement",
      total: "201 :RegularCandle: 12 :RegularHeart: 2:AC:",
      image: "Prophet_of_Air_Tree_Clement.png",
    },
    location: {
      by: "Clement",
      image: "Prophet_of_Air_Location_Clement.png",
    },
    expression: {
      type: "Emote",
      icon: "<:airprophet:1131649484347154433>",
      level: [
        {
          title: '"Balance" Emote Level 1',
          image: "Prophet-of-Air-balance-emote-level-1.gif",
        },
        {
          title: '"Balance" Emote Level 2',
          image: "Prophet-of-Air-balance-emote-level-2.gif",
        },
        {
          title: '"Balance" Emote Level 3',
          image: "Prophet-of-Air-balance-emote-level-3.gif",
        },
        {
          title: '"Balance" Emote Level 4',
          image: "Prophet-of-Air-balance-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Mask",
        type: "Mask",
        icon: "<:AirPMask:1273628410681491486>",
        images: [
          {
            description: "The Mask",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/4/4a/Prophecy-Prophet_of_Air_Mask.png/revision/latest/scale-to-width-down/400?cb=20210725225556",
          },
        ],
        price: "54 <:RegularCandle:1207793250895794226>",
        isSP: true,
      },
      {
        name: "Hair",
        type: "Hair",
        icon: "<:AirPHair:1273628398584856576>",
        images: [
          {
            description: "The Hair",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/d/de/Prophecy-Prophet_of_Air_Hair.png/revision/latest/scale-to-width-down/400?cb=20210725225219",
          },
        ],
        price: "44 <:RegularCandle:1207793250895794226>",
        spPrice: "13 <:ProphecyCandle:1273522988637224980>",
      },
      {
        name: "Cape",
        type: "Cape",
        icon: "<:AirPCape:1273628384521355404>",
        images: [
          {
            description: "Front",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/c/cc/Prophecy-Prophet_of_Air_Cape.png/revision/latest/scale-to-width-down/400?cb=20210725225725",
          },
          {
            description: "Interior",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/d/d4/Prophecy_cape_air_open_v2.png/revision/latest/scale-to-width-down/400?cb=20210725225846",
          },
          {
            description: "Back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/a/ae/Prophecy_cape_air_back_v2.png/revision/latest/scale-to-width-down/400?cb=20210725225845",
          },
        ],
        price: "75 <:RegularCandle:1207793250895794226>",
        spPrice: "29 <:ProphecyCandle:1273522988637224980>",
      },
      {
        name: "Air element sticker",
        type: "Prop",
        icon: "<:AirPProp:1273628371330535529>",
        images: [],
        price: "15 <:RegularCandle:1207793250895794226>",
        notes: [
          "It is a placeable Prop that can be used to decorate Shared Spaces. This item is purely cosmetic and does not offer any functionality",
          "This item was not available during the Season of Prophecy. Instead, it was first introduced during the Prophet of Air's first visit as a Traveling Spirit on May 12, 2022",
        ],
      },
    ],
  },
  earthprophet: {
    name: "Prophet of Earth",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/8/8a/Prophecy-Spirit-Prophet-of-Earth.png",
    type: "Seasonal Spirit",
    realm: "Isle of Dawn",
    season: "Prophecy",
    ts: {
      eligible: true,
      returned: true,
      dates: ["August 29, 2024 (#121)", "May 15, 2023 (SV#2)", "February 03, 2022 (#54)"],
    },
    tree: {
      by: "alvenoir & io",
      total: "206 :RegularCandle: 13 :RegularHeart: 2 :AC:",
      image: "Earth_Prophet_Price_Tree.png",
    },
    location: {
      by: "Clement",
      image: "Prophet_of_Earth_Location_Clement.png",
    },
    expression: {
      type: "Emote",
      icon: "<:earthprophet:1131649510045646908>",
      level: [
        {
          title: '"Dust Off" Emote Level 1',
          image: "Prophet-of-Earth-dust-off-emote-level-1.gif",
        },
        {
          title: '"Dust Off" Emote Level 2',
          image: "Prophet-of-Earth-dust-off-emote-level-2.gif",
        },
        {
          title: '"Dust Off" Emote Level 3',
          image: "Prophet-of-Earth-dust-off-emote-level-3.gif",
        },
        {
          title: '"Dust Off" Emote Level 4',
          image: "Prophet-of-Earth-dust-off-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Mask",
        type: "Mask",
        icon: "<:EarthPMask:1273533393333649459>",
        images: [
          {
            description: "The Mask",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/b/b3/Prophecy-Prophet_of_Earth_Mask.png/revision/latest/scale-to-width-down/400?cb=20210725225543",
          },
        ],
        price: "44 <:ProphecyCandle:1273522988637224980>",
        isSP: true,
      },
      {
        name: "Hair",
        type: "Hair",
        icon: "<:EarthPHair:1273533341794304093>",
        images: [
          {
            description: "Front",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/5/58/Prophecy-Prophet_of_Earth_Hair.png/revision/latest/scale-to-width-down/400?cb=20240111234228",
          },
          {
            description: "Side",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/7/74/Prophecy-Prophet-of-Earth-Hair-Side.png/revision/latest/scale-to-width-down/400?cb=20240111234351",
          },
          {
            description: "Back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/9/9d/Prophecy-Prophet-of-Earth-Hair-Back.png/revision/latest/scale-to-width-down/400?cb=20240111234426",
          },
        ],
        price: "44 <:ProphecyCandle:1273522988637224980>",
        spPrice: "",
      },
      {
        name: "Cape",
        type: "Cape",
        icon: "<:EarthPCape:1273533329412456529>",
        images: [
          {
            description: "Front",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/26/Prophecy-Prophet_of_Earth_cape.png/revision/latest/scale-to-width-down/400?cb=20210725225733",
          },
          {
            description: "Interior",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/5/51/Prophecy_cape_earth_open_v2.png/revision/latest/scale-to-width-down/400?cb=20210725225850",
          },
          {
            description: "Back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/8/80/Prophecy_cape_earth_back_v2.png/revision/latest/scale-to-width-down/400?cb=20210725225848",
          },
        ],
        price: "75 <:RegularCandle:1207793250895794226>",
        spPrice: "",
      },
      {
        name: "Earth element sticker",
        type: "Prop",
        icon: "<:EarthPProp:1273533314434863174>",
        images: [
          {
            description: "The Sticker",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/7/75/Prophet_of_earth_prop.png/revision/latest/scale-to-width-down/400?cb=20220901055209",
          },
          {
            description: "On player's back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/e/e9/Backpack_for_props.png/revision/latest/scale-to-width-down/400?cb=20240507043343",
          },
        ],
        price: "15 <:ProphecyCandle:1273522988637224980>",
        notes: [
          " It is a placeable Prop that can be used to decorate Shared Spaces. This item is purely cosmetic and does not offer any functionality",
          "This item was not available during the Season of Prophecy. Instead, it was first introduced during the Prophet of Earth's first (official) visit as a Traveling Spirit on February 3, 2022.",
        ],
      },
    ],
  },
  waterprophet: {
    name: "Prophet of Water",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/c/cf/Prophecy-Spirit-Prophet-of-Water.png",
    type: "Seasonal Spirit",
    realm: "Isle of Dawn",
    season: "Prophecy",
    ts: {
      eligible: true,
      returned: true,
      dates: ["May 15, 2023 (SV#2)", "November 10, 2022 (#74)", "August 08, 2021 (#41)"],
    },
    tree: {
      by: "Clement",
      total: "187 :RegularCandle: 13 :RegularHeart: 2 :AC:",
      image: "Prophecy_Water_Tree_Clement.png",
    },
    location: {
      by: "Clement",
      image: "Prophet_of_Water_Location_Clement.png",
    },
    expression: {
      type: "Emote",
      icon: "<:waterprophet:1131649574465974302>",
      level: [
        {
          title: '"Deep Breath" Emote Level 1',
          image: "Prophet-of-Water-deep-breath-emote-level-1.gif",
        },
        {
          title: '"Deep Breath" Emote Level 2',
          image: "Prophet-of-Water-deep-breath-emote-level-2.gif",
        },
        {
          title: '"Deep Breath" Emote Level 3',
          image: "Prophet-of-Water-deep-breath-emote-level-3.gif",
        },
        {
          title: '"Deep Breath" Emote Level 4',
          image: "Prophet-of-Water-deep-breath-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Mask",
        type: "Mask",
        icon: "<:WaterPMask:1273523160112824371>",
        images: [
          {
            description: "The Mask",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/e/ea/Prophecy-Prophet_of_Water_Mask.png/revision/latest/scale-to-width-down/400?cb=20210725225528",
          },
        ],
        price: "54 <:RegularCandle:1207793250895794226>",
        spPrice: "27 <:ProphecyCandle:1273522988637224980>",
      },
      {
        name: "Hair",
        type: "Hair",
        icon: "<:WaterPHair:1273523146439393323>",
        images: [
          {
            description: "The Hair",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/9/9a/Prophecy-Prophet_of_Water_Hair.png/revision/latest/scale-to-width-down/400?cb=20210725225242",
          },
        ],
        price: "44 <:RegularCandle:1207793250895794226>",
        isSP: true,
      },
      {
        name: "Cape",
        type: "Cape",
        icon: "<:WaterPCape:1273523129422974976>",
        images: [
          {
            description: "Front",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/0/08/Prophecy-Prophet_of_Water_Cape.png/revision/latest/scale-to-width-down/400?cb=20210725225654",
          },
          {
            description: "Interior",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/1/13/Prophecy_cape_water_open_v2.png/revision/latest/scale-to-width-down/400?cb=20210725225854",
          },
          {
            description: "Back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/b/b5/Prophecy_cape_water_back_v2.png/revision/latest/scale-to-width-down/400?cb=20210725225852",
          },
        ],
        price: "75 <:RegularCandle:1207793250895794226>",
        isSP: true,
      },
      {
        name: "Water sticker",
        type: "Prop",
        icon: "<:WaterPProp:1273523001572458516>",
        images: [
          {
            description: "The prop",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/6/69/SoProphecy-Prophet-of-Water-Prop-image-Morybel-0146.png/revision/latest/scale-to-width-down/400?cb=20221110160336",
          },
          {
            description: "On player's back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/e/e9/Backpack_for_props.png/revision/latest/scale-to-width-down/400?cb=20240507043343",
          },
        ],
        price: "15 <:RegularCandle:1207793250895794226>",
        notes: [
          "It is a placeable Prop that can be used to decorate Shared Spaces. This item is purely cosmetic and does not offer any functionality",
          "This item was not available during the Season of Prophecy. Instead, it was first introduced during the Prophet of Water's second visit as a Traveling Spirit on November 10, 2022",
        ],
      },
    ],
  },
};

export default data;
