import type { SpiritsData } from "../type.d.ts";

const data: Record<string, SpiritsData> = {
  applauding_bellmaker: {
    name: "Applauding Bellmaker",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/4/40/Prairie-Spirit-Applauding-Bellmaker.png",
    type: "Regular Spirit",
    realm: "Daylight Prairie",
    main: {
      description: "Applauding Bellmaker Infographics by Ed.7",
      image: "Applauding-Bellmaker-Guide-777-Ed.webp",
    },
    expression: {
      type: "Emote",
      icon: "<:applaudingbellmaker:1205914299814518784>",
      level: [
        {
          title: '"Clap Emote" Level 1',
          image: "Applauding-Bellmaker-clap-emote-level-1.gif",
        },
        {
          title: '"Clap Emote" Level 2',
          image: "Applauding-Bellmaker-clap-emote-level-2.gif",
        },
        {
          title: '"Clap Emote" Level 3',
          image: "Applauding-Bellmaker-clap-emote-level-3.gif",
        },
        {
          title: '"Clap Emote" Level 4',
          image: "Applauding-Bellmaker-clap-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Hair",
        icon: "<:ApplaudingBellmakerHair:1275147506866716774>",
        type: "Hair",
        price: "3 <:regularHeart:1207793247792013474>",
        images: [
          {
            description: "The Hair (Front)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/1/1a/Hair05-Pippi_Ponytails.png/revision/latest/scale-to-width-down/400?cb=20240123000827",
          },
          {
            description: "The Hair (Side)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/7/76/Applauding-Bellmaker-Hair-side.png/revision/latest/scale-to-width-down/400?cb=20240123061709",
          },
          {
            description: "The Hair (Back)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/f/fc/Applauding-Bellmaker-Hair-back.png/revision/latest/scale-to-width-down/400?cb=20240123061708",
          },
        ],
      },
    ],
  },
  bird_whisperer: {
    name: "Bird Whisperer",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/7/75/Prairie-Spirit-Bird-Whisperer.png",
    type: "Regular Spirit",
    realm: "Daylight Prairie",
    main: {
      description: "Bird Whisperer Infographics by Ed.7",
      image: "Bird-Whisperer-Guide-777-Ed.webp",
    },
    expression: {
      type: "Call",
      icon: "<:birdwhisperer:1205914321897398332>",
      level: [{ title: "Bird Call", image: "Bird_Call-1.mp4" }],
    },
    collectibles: [
      {
        name: "Hair",
        icon: "<:BirdWhispererHair:1275146482806161490>",
        type: "Hair",
        price: "5 <:regularHeart:1207793247792013474>",
        images: [
          {
            description: "The Hair (Front)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/4/48/Hair11-Vertical_Ponytail.png/revision/latest/scale-to-width-down/400?cb=20240121233843",
          },
          {
            description: "The Hair (Side)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/0/0a/Bird-Whisperer-Hair-side.png/revision/latest/scale-to-width-down/400?cb=20240122025551",
          },
          {
            description: "The Hair (Back)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/3c/Bird-Whisperer-Hair-back.png/revision/latest/scale-to-width-down/400?cb=20240122025255",
          },
        ],
      },
      {
        name: "Music Sheet #1",
        icon: "<:MusicIcon:1262323496852131882>",
        price: "1 <:regularHeart:1207793247792013474>",
        type: "Music Sheet",
        images: [],
      },
    ],
  },
  charmer: {
    name: "Butterfly Charmer",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/5/59/Prairie-Spirit-Butterfly-Charmer.png",
    type: "Regular Spirit",
    realm: "Daylight Prairie",
    main: {
      description: "Butterfly Charmer Infographics by Ed.7",
      image: "Butterfly-Charmer-Guide-777-Ed.png",
    },
    expression: {
      type: "Emote",
      icon: "<:butterflycharmer:1205914343519158302>",
      level: [
        {
          title: '"Butterfly Emote" Level 1',
          image: "Butterfly-Charmer-butterfly-emote-level-1.gif",
        },
        {
          title: '"Butterfly Emote" Level 2',
          image: "Butterfly-Charmer-butterfly-emote-level-2.gif",
        },
        {
          title: '"Butterfly Emote" Level 3',
          image: "Butterfly-Charmer-butterfly-emote-level-3.gif",
        },
        {
          title: '"Butterfly Emote" Level 4',
          image: "Butterfly-Charmer-butterfly-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Outfit",
        icon: "<:ButterflyCharmerOutfit:1275144432378970132>",
        price: "4 <:regularHeart:1207793247792013474>",
        type: "Outfit",
        images: [
          {
            description: "The Outfit",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/f/f0/Legs08.png/revision/latest/scale-to-width-down/400?cb=20230626011016",
          },
        ],
      },
      {
        name: "Cape (Tier 1)",
        icon: "<:ButterflyCharmerCapeLvl1:1275144418625589290>",
        price: "3 <:regularHeart:1207793247792013474>",
        type: "Cape",
        images: [
          {
            description: "The Cape - Tier 1 (Front)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/2a/Cape-Yellow.png/revision/latest/scale-to-width-down/400?cb=20210810194740",
          },
          {
            description: "The Cape - Tier 1 (Interior)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/b/bd/Cape_yellow_3.png/revision/latest/scale-to-width-down/400?cb=20210810213135",
          },
          {
            description: "The Cape - Tier 1 (Back)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/8/8d/Cape_yellow_2.png/revision/latest/scale-to-width-down/400?cb=20210810213133",
          },
        ],
      },
      {
        name: "Cape (Tier 2)",
        icon: "<:ButterflyCharmerCapeLvl2:1275144406143598726>",
        type: "Cape",
        price: "9 <:regularHeart:1207793247792013474>",
        notes: [
          "The Tier 2 Cape (and the second Wing Buff that unlocks it) are not needed to complete the Daylight Prairie Constellation. These were both added to the Friendship Tree in Patch 0.12.0 on December 15, 2020",
        ],
        images: [
          {
            description: "The Cape - Tier 2 (Front)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/30/Cape_yellow_tier_2_front.png/revision/latest/scale-to-width-down/400?cb=20210806192716",
          },
          {
            description: "The Cape - Tier 2 (Interior)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/4/48/Cape_yellow_tier_2_inner.png/revision/latest/scale-to-width-down/400?cb=20210806192718",
          },
          {
            description: "The Cape - Tier 2 (Back)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/5/5e/Cape_yellow_tier_2_back.png/revision/latest/scale-to-width-down/400?cb=20210806192714",
          },
        ],
      },
    ],
  },
  worshiper: {
    name: "Ceremonial Worshipper",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/32/Prairie-Spirit-Ceremonial-Worshiper.png",
    type: "Regular Spirit",
    realm: "Daylight Prairie",
    main: {
      description: "Ceremonial Worshipper Infographics by Ed.7",
      image: "Ceremonial-Worshiper-Guide-777-Ed.png",
    },
    expression: {
      type: "Emote",
      icon: "<:ceremonialworshiper:1205914362733404181>",
      level: [
        {
          title: '"Teamwork Emote"\n- There\'s only 1 level of this emote',
          image: "Ceremonial-Worshiper-teamwork-emote-level-1.gif",
        },
      ],
    },
  },
  dock_worker: {
    name: "Exhausted Dock Worker",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/3c/Prairie-Spirit-Exhausted-Dock-Worker.png",
    type: "Regular Spirit",
    realm: "Daylight Prairie",
    main: {
      description: "Exhausted Dock Worker Infographics by Ed.7",
      image: "Exhausted-Dock-Worker-Guide-777-Ed.png",
    },
    expression: {
      type: "Emote",
      icon: "<:exhausteddockworker:1205914381519556708>",
      level: [
        {
          title: '"Exhasted Emote" Level 1',
          image: "Exhausted-Dock-Worker-wipe-brow-emote-level-1.gif",
        },
        {
          title: '"Exhasted Emote" Level 2',
          image: "Exhausted-Dock-Worker-wipe-brow-emote-level-2.gif",
        },
        {
          title: '"Exhasted Emote" Level 3',
          image: "Exhausted-Dock-Worker-wipe-brow-emote-level-3.gif",
        },
        {
          title: '"Exhasted Emote" Level 4',
          image: "Exhausted-Dock-Worker-wipe-brow-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Face Accessory",
        type: "Face Accessory",
        icon: "<:ExhaustedDockWorkerFaceAccessory:1275143511381114971>",
        price: "3 <:regularHeart:1207793247792013474>",
        images: [
          {
            description: "The Accessory",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/9/9b/Mask04.png/revision/latest/scale-to-width-down/400?cb=20210810231611",
          },
        ],
      },
    ],
  },
  laughing_light_catcher: {
    name: "Laughing Light Catcher",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/d/de/Prairie-Spirit-Laughing-Light-Catcher.png",
    type: "Regular Spirit",
    realm: "Daylight Prairie",
    main: {
      description: "Laughing Light Catcher Infographics by Ed.7",
      image: "Laughing-Light-Catcher-Guide-777-Ed.webp",
    },
    expression: {
      type: "Emote",
      icon: "<:laughinglightcatcher:1205914422309290015>",
      level: [
        {
          title: '"Laugh Emote" Level 1',
          image: "Laughing-Light-Catcher-laugh-emote-level-1.gif",
        },
        {
          title: '"Laugh Emote" Level 2',
          image: "Laughing-Light-Catcher-laugh-emote-level-2.gif",
        },
        {
          title: '"Laugh Emote" Level 3',
          image: "Laughing-Light-Catcher-laugh-emote-level-3.gif",
        },
        {
          title: '"Laugh Emote" Level 4',
          image: "Laughing-Light-Catcher-laugh-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Hair",
        icon: "<:LaughingLightCatcherHair:1275142115927654501>",
        type: "Hair",
        price: "5 <:regularHeart:1207793247792013474>",
        images: [
          {
            description: "The Hair (Front)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/f/f9/Hair26-Puffy_Ponytails.png/revision/latest/scale-to-width-down/400?cb=20240216070333",
          },
          {
            description: "The Hair (Side)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/5/5a/Laughing-Light-Catcher-Hair-side.png/revision/latest/scale-to-width-down/400?cb=20240219013425",
          },
          {
            description: "The Hair (Back)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/7/78/Laughing-Light-Catcher-Hair-back.png/revision/latest/scale-to-width-down/400?cb=20240219013405",
          },
        ],
      },
      {
        name: "Hand-held Harp",
        icon: "<:LaughingLightCatcherInstrument:1275142104624136222>",
        price: "5 <:regularHeart:1207793247792013474>",
        type: "Instrument",
        notes: [
          "The IAP variant inspired by this item, the Fledgling Harp, was later introduced with Harmony Hall. The two harps have the same sound, but different visuals",
          "In Harmony Hall, this Instrument can be found in the left-hand room, on the same wall as the guitars, sitting on a shelf behind the <:FrightenedRefugeeInstrument:1275323117899743263> Contrabass",
        ],
        images: [
          {
            description: "The harp",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/d/d4/Laughing-Light-Catcher-harp.png/revision/latest/scale-to-width-down/400?cb=20240610161904",
          },
          {
            description: "Playing the harp",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/5/56/Instrument_harp_playing.png/revision/latest/scale-to-width-down/400?cb=20240610162034",
          },
          {
            description: "On player's back",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/9/91/Instrument-Harp.png/revision/latest/scale-to-width-down/400?cb=20240610162130",
          },
        ],
      },
    ],
  },
  shipwright: {
    name: "Slumbering Shipwright",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/1/15/Prairie-Spirit-Slumbering-Shipwright.png",
    type: "Regular Spirit",
    realm: "Daylight Prairie",
    main: {
      description: "Slumbering Shipwright Infographics by Ed.7",
      image: "Slumbering-Shipwright-Guide-777-Ed.webp",
    },
    expression: {
      type: "Emote",
      icon: "<:slumberingshipwright:1205914400901308546>",
      level: [
        {
          title: '"Yawn Emote" Level 1',
          image: "Slumbering-Shipwright-yawn-emote-level-1.gif",
        },
        {
          title: '"Yawn Emote" Level 2',
          image: "Slumbering-Shipwright-yawn-emote-level-2.gif",
        },
        {
          title: '"Yawn Emote" Level 3',
          image: "Slumbering-Shipwright-yawn-emote-level-3.gif",
        },
        {
          title: '"Yawn Emote" Level 4',
          image: "Slumbering-Shipwright-yawn-emote-level-4.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Hair",
        icon: "<:SlumberingShipwrightHair:1275141349930438676>",
        type: "Hair",
        price: "3 <:regularHeart:1207793247792013474>",
        images: [
          {
            description: "The Hair (Front)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/6/6a/Slumbering-Shipwright-Hair-front.png/revision/latest/scale-to-width-down/400?cb=20240128041658",
          },
          {
            description: "The Hair (Side)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/a/a3/Hair37-Mid_Mohawk.png/revision/latest/scale-to-width-down/400?cb=20240127090906",
          },
          {
            description: "The Hair (Back)",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/9/99/Slumbering-Shipwright-Hair-back.png/revision/latest/scale-to-width-down/400?cb=20240128041705",
          },
        ],
      },
    ],
  },
  waving_bellmaker: {
    name: "Waving Bellmaker",
    type: "Regular Spirit",
    image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/4/48/Prairie-Spirit-Waving-Bellmaker.png",
    realm: "Daylight Prairie",
    main: {
      description: "Waving Bellmaker Infographics by Ed.7",
      image: "Waving-Bellmaker-Guide-777-Ed.png",
    },
    expression: {
      type: "Emote",
      icon: "<:wavingbellmaker:1205914441330466889>",
      level: [
        {
          title: '"Wave Emote" Level 1',
          image: "Waving-Bellmaker-wave-emote-level-1.gif",
        },
        {
          title: '"Wave Emote" Level 2',
          image: "Waving-Bellmaker-wave-emote-level-2.gif",
        },
        {
          title: '"Wave Emote" Level 3',
          image: "Waving-Bellmaker-wave-emote-level-3.gif",
        },
        {
          title: '"Wave Emote" Level 4',
          image: "Waving-Bellmaker-wave-emote-level-4.gif",
        },
        {
          title: '"Wave Emote" Level 5',
          image: "Waving-Bellmaker-wave-emote-level-5.gif",
        },
        {
          title: '"Wave Emote" Level 6',
          image: "Waving-Bellmaker-wave-emote-level-6.gif",
        },
      ],
    },
    collectibles: [
      {
        name: "Mask",
        icon: "<:WavingBellmakerMask:1275105123223339018>",
        type: "Mask",
        price: "5 <:regularHeart:1207793247792013474>",
        images: [
          {
            description: "The Mask",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/27/Mask03.png/revision/latest/scale-to-width-down/400?cb=20210810231621",
          },
        ],
      },
      {
        name: "Hair",
        icon: "<:WavingBellmakerHair:1275105109579137119>",
        type: "Hair",
        price: "2 <:regularHeart:1207793247792013474>",
        images: [
          {
            description: "The Hair",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/9/92/Hair10-Small_Tuft.png/revision/latest/scale-to-width-down/400?cb=20240123035655",
          },
        ],
      },
    ],
  },
};

export default data;
