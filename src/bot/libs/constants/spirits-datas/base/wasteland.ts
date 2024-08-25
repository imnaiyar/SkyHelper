import type { SpiritsData } from "../type.d.ts";

const data: Record<string, SpiritsData> = {
  courageous_soldier: {
    name: "Courageous Soldier",
    type: "Regular Spirit",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/6/6b/Wasteland-Spirit-Courageous-Soldier.png",
    realm: "Golden Wasteland",
    main: {
      description: "Courageous Soldier Infographics by Ed.7",
      image: "Courageous-Soldier-Guide-777-Ed.png",
    },
    expression: {
      type: "Stance",
      icon: "<:courageoussoldier:1205914854456696892>",
      level: [{ title: "Courageous Stance", image: "Courageous_Stance.gif" }],
    },
    collectibles: [
      {
        name: "Hair",
        icon: "<:CourageousSoldierHair:1275326200587354172>",
        type: "Hair",
        price: "4 <:regularHeart:1207793247792013474>",
        images: [
          {
            description: "The Hair (Front)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/c/c0/Courageous-Soldier-Hair-front.png/revision/latest/scale-to-width-down/400?cb=20240207183059",
          },
          {
            description: "The Hair (Interior)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/25/Hair13-Short_Mohawk.png/revision/latest/scale-to-width-down/400?cb=20240204051843",
          },
          {
            description: "The Hair (Back)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/6/64/Courageous-Soldier-Hair-back.png/revision/latest/scale-to-width-down/400?cb=20240207183104",
          },
        ],
      },
      {
        name: "Cape - Tier 1",
        icon: "<:CourageousSoldierCapeL1:1275326186892820490>",
        type: "Cape",
        price: "15 <:regularHeart:1207793247792013474>",
        images: [
          {
            description: "The Cape - Tier 1 (Front)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/c/cf/Cape-Green.png/revision/latest/scale-to-width-down/400?cb=20210810194934",
          },
          {
            description: "The Cape - Tier 1 (Interior)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/8/8a/Cape_green3.png/revision/latest/scale-to-width-down/400?cb=20210810213143",
          },
          {
            description: "The Cape - Tier 1 (Back)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/38/Cape_green2.png/revision/latest/scale-to-width-down/400?cb=20210810213141",
          },
        ],
      },
      {
        name: "Cape - Tier 2",
        icon: "<:CourageousSoldierCapeL2:1275326178726645822>",
        type: "Cape",
        price: "45 <:regularHeart:1207793247792013474>",
        notes: ["The Tier 2 Cape (and the second Wing Buff that unlocks it) are not needed to complete the Vault Constellation"],
        images: [
          {
            description: "The Cape - Tier 2 (Front)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/7/7c/Cape_green_tier_2_front.png/revision/latest/scale-to-width-down/400?cb=20210806192649",
          },
          {
            description: "The Cape - Tier 2 (Interior)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/6/6e/Cape_green_tier_2_inner.png/revision/latest/scale-to-width-down/400?cb=20210806192651",
          },
          {
            description: "The Cape - Tier 2 (Back)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/e/e5/Cape_green_tier_2_back.png/revision/latest/scale-to-width-down/400?cb=20210806192647",
          },
        ],
      },
    ],
  },
  fainting_warrior: {
    name: "Fainting Warrior",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/0/07/Wasteland-Spirit-Fainting-Warrior.png",
    type: "Regular Spirit",
    realm: "Golden Wasteland",
    main: {
      description: "Fainting Warrior Infographics by Ed.7",
      image: "Fainting-Warrior-Guide-777-Ed.png",
    },
    expression: {
      type: "Emote",
      icon: "<:faintingwarrior:1205914837360840714>",
      level: [
        {
          title: '"Faint Emote" Level 1',
          image: "Fainting_Warrior_Faint_Level_1.gif",
        },
        {
          title: '"Faint Emote" Level 2',
          image: "Fainting_Warrior_Faint_Level_2.gif",
        },
        {
          title: '"Faint Emote" Level 3',
          image: "Fainting_Warrior_Faint_Level_3.gif",
        },
        {
          title: '"Faint Emote" Level 4',
          image: "Fainting_Warrior_Faint_Level_4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Mask",
        icon: "<:FaintingWarriorMask:1275325091399335946>",
        type: "Mask",
        price: "15 <:regularHeart:1207793247792013474>",
        images: [
          {
            description: "The Mask",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/2a/Mask10-Full.png/revision/latest/scale-to-width-down/400?cb=20210810231754",
          },
        ],
      },
      {
        name: "Hair",
        icon: "<:FaintingWarriorHair:1275325076363018304>",
        type: "Hair",
        price: "5 <:regularHeart:1207793247792013474>",
        images: [
          {
            description: "The hair (Front)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/3a/Hair36-One_Side_Long.png/revision/latest/scale-to-width-down/400?cb=20240206220358",
          },
          {
            description: "The hair (Side)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/b/b0/Fainting-Warrior-Hair-side.png/revision/latest/scale-to-width-down/400?cb=20240207190453",
          },
          {
            description: "The hair (Back)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/1/10/Fainting-Warrior-Hair-back.png/revision/latest/scale-to-width-down/400?cb=20240207190450",
          },
        ],
      },
    ],
  },
  refugee: {
    name: "Frightened Refugee",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/4/49/Wasteland-Spirit-Frightened-Refugee.png",
    type: "Regular Spirit",
    realm: "Golden Wasteland",
    main: {
      description: "Frightened Refugee Infographics by Ed.7",
      image: "Frightened-Refugee-Guide-777-Ed.png",
    },
    expression: {
      type: "Emote",
      icon: "<:frightenedrefuge:1205914818134155294>",
      level: [
        {
          title: '"Duck Emote" Level 1',
          image: "Frightened_Refugee_Duck_Level_1.gif",
        },
        {
          title: '"Duck Emote" Level 2',
          image: "Frightened_Refugee_Duck_Level_2.gif",
        },
        {
          title: '"Duck Emote" Level 3',
          image: "Frightened_Refugee_Duck_Level_3.gif",
        },
        {
          title: '"Duck Emote" Level 4',
          image: "Frightened_Refugee_Duck_Level_4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Hair",
        icon: "<:FrightenedRefugeeHair:1275323127001518090>",
        type: "Hair",
        price: "3 <:regularHeart:1207793247792013474>",
        images: [
          {
            description: "The Hair",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/7/75/Hair27-Puffy_Ponytail.png/revision/latest/scale-to-width-down/400?cb=20240216060944",
          },
        ],
      },
      {
        name: "Contrabass Harp",
        icon: "<:FrightenedRefugeeInstrument:1275323117899743263>",
        type: "Instrument",
        price: "5 <:regularHeart:1207793247792013474>",
        notes: [
          "In Harmony Hall, this Instrument can be found in the left-hand room, on the same wall as the guitars, sitting on the floor in front of the <:laughinglightcatcher:1205914422309290015> Laughing Lightcather's <:LaughingLightCatcherInstrument:1275142104624136222> Harp.",
        ],
        images: [
          {
            description: "The instrument",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/0/02/Frightened-Refugee-Contrabass-harp.png/revision/latest/scale-to-width-down/400?cb=20220519010804",
          },
          {
            description: "Playing the instrument",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/b/ba/Instrument_bass_harp_playing.png/revision/latest/scale-to-width-down/400?cb=20210808203058",
          },
          {
            description: "On player's back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/2b/Instrument-Bass_Drum.png/revision/latest/scale-to-width-down/400?cb=20210806203303",
          },
        ],
      },
    ],
  },
  lookout_scout: {
    name: "Looking Scout",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/0/09/Wasteland-Spirit-Lookout-Scout.png",
    type: "Regular Spirit",
    realm: "Golden Wasteland",
    main: {
      description: "Looking Scout Infographics by Ed.7",
      image: "Lookout-Scout-Guide-777-Ed.png",
    },
    expression: {
      type: "Emote",
      icon: "<:lookoutscout:1205914800161558550>",
      level: [
        {
          title: '"Lookout Emote" Level 1',
          image: "Looking_Scout_Look_Around_Level_1.gif",
        },
        {
          title: '"Lookout Emote" Level 2',
          image: "Looking_Scout_Look_Around_Level_2.gif",
        },
        {
          title: '"Lookout Emote" Level 3',
          image: "Looking_Scout_Look_Around_Level_3.gif",
        },
        {
          title: '"Lookout Emote" Level 4',
          image: "Looking_Scout_Look_Around_Level_4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Mask",
        icon: "<:LookoutScoutMask:1275321552849600532>",
        type: "Mask",
        price: "10 <:regularHeart:1207793247792013474>",
        images: [
          {
            description: "The Mask",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/a/a5/Mask11.png/revision/latest/scale-to-width-down/400?cb=20210810231739",
          },
        ],
      },
      {
        name: "Horn",
        icon: "<:LookoutScoutInstrument:1275321542364106795>",
        type: "Instrument",
        price: "5 <:regularHeart:1207793247792013474>",
        notes: [
          "In Harmony Hall, this Instrument can be found on the back wall, behind and to the right of the front counter, in an alcove below the <:TwirlingChampionInstrument:1272251644746272919> Panflute",
        ],
        images: [
          {
            description: "The instrument",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/2c/Lookout-Scout-Horn.png/revision/latest/scale-to-width-down/400?cb=20220519193749",
          },
          {
            description: "Playing the instrument",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/c/cb/Instrument_horn_playing.png/revision/latest/scale-to-width-down/400?cb=20210808203104",
          },
          {
            description: "On player's back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/4/49/Instrument-Horn.png/revision/latest/scale-to-width-down/400?cb=20210806203320",
          },
        ],
      },
    ],
  },
  saluting_captain: {
    name: "Saluting Captain",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/8/8c/Wasteland-Spirit-Saluting-Captain.png",
    type: "Regular Spirit",
    realm: "Golden Wasteland",
    main: {
      description: "Saluting Captain Infographics by Ed.7",
      image: "Saluting-Captain-Guide-777-Ed.png",
    },
    expression: {
      type: "Emote",
      icon: "<:salutingcaptian:1205914782998335649>",
      level: [
        {
          title: '"Salute Emote" Level 1',
          image: "Saluting_Captain_Salute_Level_1.gif",
        },
        {
          title: '"Salute Emote" Level 2',
          image: "Saluting_Captain_Salute_Level_2.gif",
        },
        {
          title: '"Salute Emote" Level 3',
          image: "Saluting_Captain_Salute_Level_3.gif",
        },
        {
          title: '"Salute Emote" Level 4',
          image: "Saluting_Captain_Salute_Level_4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Hair",
        icon: "<:SalutingCaptainHair:1275320401181933659>",
        type: "Hair",
        price: "5 <:regularHeart:1207793247792013474>",
        images: [
          {
            description: "The Hair",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/31/Hair15-Short_Boy.png/revision/latest/scale-to-width-down/400?cb=20240123061235",
          },
        ],
      },
      {
        name: "Fireworks staff",
        icon: "<:SalutingCaptainProp:1275320388875718656>",
        type: "Prop",
        price: "20 <:regularHeart:1207793247792013474>",
        notes: [
          "When activated, it shoots off a burst of colorful fireworks with a bang. After 5 shots, there is a 10 second cooldown before it can be activated again",
          "It is a non-placeable Prop that cannot be used to decorate Shared Spaces",
        ],
        images: [
          {
            description: "THe staff",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/9/96/Saluting-Captain-Fireworks-Staff.png/revision/latest/scale-to-width-down/400?cb=20240317233220",
          },
          {
            description: "Holding the staff",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/8/81/Instrument_firework_staff_in_hand.png/revision/latest/scale-to-width-down/400?cb=20210808203101",
          },
          {
            description: "On player's back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/a/a0/Instrument-Fireworks_Staff.png/revision/latest/scale-to-width-down/400?cb=20210806203329",
          },
        ],
      },
    ],
  },
  stealthy_survivor: {
    name: "Stealthy Survivor",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/37/Wasteland-Spirit-Stealthy-Survivor.png",
    type: "Regular Spirit",
    realm: "Golden Wasteland",
    main: {
      description: "Stealthy Survivor Infographics by Ed.7",
      image: "Stealthy-Survivor-Guide-777-Ed.png",
    },
    expression: {
      type: "Stance",
      icon: "<:stealthysurvivor:1205914765558423552>",
      level: [{ title: "Sneaky Stance", image: "Sneaky_Stance.gif" }],
    },
    collectibles: [
      {
        name: "Hair",
        icon: "<:StealthySurvivorHair:1275318606296518726>",
        type: "Hair",
        price: "5 <:regularHeart:1207793247792013474>",
        images: [
          {
            description: "The Hair (Front)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/d/da/Stealthy-Survivor-Hair-front.png/revision/latest/scale-to-width-down/400?cb=20240219013414",
          },
          {
            description: "The Hair (Side)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/8/8e/Hair33-Short_Dreads.png/revision/latest/scale-to-width-down/400?cb=20240208020436",
          },
          {
            description: "The Hair (Back)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/3b/Stealthy-Survivor-Hair-back.png/revision/latest/scale-to-width-down/400?cb=20240219013409",
          },
        ],
      },
      {
        name: "Cape - Tier 1",
        icon: "<:StealthySurvivorCapeL1:1275318585811533946>",
        type: "Cape",
        price: "50 <:regularHeart:1207793247792013474>",
        images: [
          {
            description: "The Cape - Tier 1 (Front)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/9/90/Cape-Black.png/revision/latest/scale-to-width-down/400?cb=20210810212902",
          },
          {
            description: "The Cape - Tier 1 (Interior)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/1/15/Cape_black_3.png/revision/latest/scale-to-width-down/400?cb=20210810213200",
          },
          {
            description: "The Cape - Tier 1 (Back)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/9/9d/Cape_black_2.png/revision/latest/scale-to-width-down/400?cb=20210810213158",
          },
        ],
      },
      {
        name: "Cape - Tier 2",
        icon: "<:StealthySurvivorCapeL2:1275318572503011379>",
        type: "Cape",
        price: "150 <:regularHeart:1207793247792013474>",
        notes: [
          "The Tier 2 Cape (and the second Wing Buff that unlocks it) are not needed to complete the Golden Wasteland Constellation",
        ],
        images: [
          {
            description: "The Cape - Tier 2 (Front)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/8/88/Ascended_black_cape.PNG/revision/latest/scale-to-width-down/400?cb=20210821225949",
          },
          {
            description: "The Cape - Tier 2 (Interior)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/f/f3/Cape_black_tier_2_open.png/revision/latest/scale-to-width-down/400?cb=20210821230259",
          },
          {
            description: "The Cape - Tier 2 (Back)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/7/70/Cape_black_tier_2_back.png/revision/latest/scale-to-width-down/400?cb=20210821230256",
          },
        ],
      },
    ],
  },
};

export default data;
