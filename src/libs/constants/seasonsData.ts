export interface SeasonData {
  name: string;
  realm?: string;
  from: string[];
  icon: string;
  active?: boolean;
  quests?: {
    title: string;
    description?: string;
    image?: string;
  }[];
}

export default {
  nesting: {
    name: "Nesting",
    realm: "Aviary Village",
    icon: "<:SONesting:1229963758680670291>",
    active: true,
    from: ["15-04-2024", "30-06-2024"],
    quests: [
      {
        title: "Quest #1",
        description:
          "Season is currently active.\n- **Start Date**: <t:1713164400:F>\n- **End Date**: <t:1719817140:F>\n- **Duration**: 77 Days\n\n```Relevant Links```\n- **Season of Nesting Price Calculations by Stoat** https://discord.com/channels/575762611111592007/575827924343848960/1229396846313738300\n\n```Quest #1 by theprincessraoni0713```",
        image: "https://cdn.imnaiyar.site/Nesting_Quest_1_theprincessraoni0713.gif",
      },
    ],
  },
  nine_colored_deer: {
    name: "Nine-Colore Deer",
    realm: "Crescent Oasis, Vault of Knowledge",
    icon: "<:ninecoloreddeer:1197412132657053746>",
    from: ["15-01-2024", "31-03-2024"],
    quests: [
      {
        title: "Quest #1",
        description:
          "```Relevant Links```\n- **Season of the Nine-Colored Deer Price Calculations by Stoat** https://discord.com/channels/575762611111592007/585339436322259003/1196801862700109975\n\n```Quest Yet To Be Updated```",
      },
    ],
  },
  revival: {
    name: "Revival",
    realm: "Aviary Village",
    icon: "<:revival:1163480957706321950>",
    from: ["16-10-2023", "31-12-2023"],
    quests: [
      {
        title: "Quest #1",
        description:
          "```Relevant Links```\n**Season of Revival - Aviary Village Map** by em https://discord.com/channels/575762611111592007/585339436322259003/1163470276869242910\n\n```Season of Revival Quest #1 by Clement```",
        image: "https://media.discordapp.net/attachments/867638574571323424/1163891052185387070/Revival_Q1.jpg",
      },
      {
        title: "Quest #2",
        description:
          "```Relevant Links```\n**Season of Revival - Aviary Village Map** by em https://discord.com/channels/575762611111592007/585339436322259003/1163470276869242910\n\n```Season of Revival Quest #2 by Clement```",
        image: "https://media.discordapp.net/attachments/867638574571323424/1184626447046942730/Revival_Quest_2.jpg",
      },
      {
        title: "Quest #3",
        description:
          "```Relevant Links```\n**Season of Revival - Aviary Village Map** by em https://discord.com/channels/575762611111592007/585339436322259003/1163470276869242910\n\n```Season of Revival Quest #3 by Clement```",
        image: "https://media.discordapp.net/attachments/867638574571323424/1184626446094844026/Revival_Quest_3.jpg",
      },
    ],
  },
  moments: {
    name: "Moments",
    realm: "Daylight Prarie",
    icon: "<:moments:1130958731211985019>",
    from: ["17-07-2023", "01-10-2023"],
    quests: [
      {
        title: "Quest #1",
        description:
          "**__Relevent Links__**\n<:moments:1130958731211985019> __Season of Moments Details by Mimi and Sam__: https://discord.com/channels/575762611111592007/575827924343848960/1130395767115366411\n<:moments:1130958731211985019> __Season of Moments price calculations by emme__: https://discord.com/channels/575762611111592007/575827924343848960/1130549534381047838\n```Season of Moments Quest #1 guide by Mimi and Sam```",
        image: "https://media.discordapp.net/attachments/575827924343848960/1132240581284868177/MomentsQuest-01.jpg",
      },
      {
        title: "Quest #2",
        description:
          "**__Relevent Links__**\n<:moments:1130958731211985019> __Season of Moments Details by Mimi and Sam__: https://discord.com/channels/575762611111592007/575827924343848960/1130395767115366411\n<:moments:1130958731211985019> __Season of Moments price calculations by emme__: https://discord.com/channels/575762611111592007/575827924343848960/1130549534381047838\n```Season of Moments Quest #2 guide by Mimi and Sam```",
        image: "https://media.discordapp.net/attachments/867638574571323424/1135953405869826088/IMG_2442.jpg",
      },
      {
        title: "Quest #3",
        description:
          "**__Relevent Links__**\n<:moments:1130958731211985019> __Season of Moments Details by Mimi and Sam__: https://discord.com/channels/575762611111592007/575827924343848960/1130395767115366411\n<:moments:1130958731211985019> __Season of Moments price calculations by emme__: https://discord.com/channels/575762611111592007/575827924343848960/1130549534381047838\n```Season of Moments Quest #3 guide by Mimi and Sam```",
        image: "https://media.discordapp.net/attachments/867638574571323424/1153542173107695718/MomentsQuest3.png",
      },
      {
        title: "Quest #4",
        description:
          "**__Relevent Links__**\n<:moments:1130958731211985019> __Season of Moments Details by Mimi and Sam__: https://discord.com/channels/575762611111592007/575827924343848960/1130395767115366411\n<:moments:1130958731211985019> __Season of Moments price calculations by emme__: https://discord.com/channels/575762611111592007/575827924343848960/1130549534381047838\n```Season of Moments Quest #4 guide by Mimi and Sam```",
        image: "https://media.discordapp.net/attachments/867638574571323424/1153542173615194142/MomentsQuest4.png",
      },
      {
        title: "Quest #5",
        description:
          "**__Relevent Links__**\n<:moments:1130958731211985019> __Season of Moments Details by Mimi and Sam__: https://discord.com/channels/575762611111592007/575827924343848960/1130395767115366411\n<:moments:1130958731211985019> __Season of Moments price calculations by emme__: https://discord.com/channels/575762611111592007/575827924343848960/1130549534381047838\n```Season of Moments Quest #5 guide by Mimi and Sam```",
        image: "https://media.discordapp.net/attachments/867638574571323424/1153542174005276722/MomentsQuest5.jpg",
      },
    ],
  },
  passage: {
    name: "Passage",
    realm: "Isle of Dawn",
    icon: "<:passage:1130958698571911239>",
    from: ["17-04-2023", "02-07-2023"],
    quests: [
      {
        title: "Quest #1",
        description:
          "```Season of Passage Quest #1 guide by Clement```\n **__Relevent Links__**\nLocation of Passage Stone by Clement: https://discord.com/channels/575762611111592007/575827924343848960/1097416905750495242\n\nSeason of Passage guides compilation by Clement : https://discord.com/channels/575762611111592007/575827924343848960/1097422433981567046",
        image: "https://media.discordapp.net/attachments/867638574571323424/1131558700432232488/Passage_Seasonal_Quest_01.jpg",
      },
      {
        title: "Quest #2",
        description:
          "```Season of Passage Quest #2 guide by Clement``` **__Relevent Links__**\nLocation of Passage Stone by Clement: https://discord.com/channels/575762611111592007/575827924343848960/1097416905750495242\n\nSeason of Passage guides compilation by Clement : https://discord.com/channels/575762611111592007/575827924343848960/1097422433981567046",
        image: "https://media.discordapp.net/attachments/867638574571323424/1131558717918285884/Passage_Seasonal_Quest_02.jpg",
      },
      {
        title: "Quest #3",
        description:
          "```Season of Passage Quest #3 guide by Clement``` **__Relevent Links__**\nLocation of Passage Stone by Clement: https://discord.com/channels/575762611111592007/575827924343848960/1097416905750495242\n\nSeason of Passage guides compilation by Clement : https://discord.com/channels/575762611111592007/575827924343848960/1097422433981567046",
        image: "https://media.discordapp.net/attachments/867638574571323424/1131558736239009863/Passage_Quest_3.jpg",
      },
      {
        title: "Quest #4",
        description:
          "```Season of Passage Quest #4 guide by Clement``` **__Relevent Links__**\nLocation of Passage Stone by Clement: https://discord.com/channels/575762611111592007/575827924343848960/1097416905750495242\n\nSeason of Passage guides compilation by Clement : https://discord.com/channels/575762611111592007/575827924343848960/1097422433981567046",
        image: "https://media.discordapp.net/attachments/867638574571323424/1131555420658487327/passage_quest4.jpg",
      },
      {
        title: "Quest #5",
        description:
          "```Season of Passage Quest #5 guide by Clement``` **__Relevent Links__**\nLocation of Passage Stone by Clement: https://discord.com/channels/575762611111592007/575827924343848960/1097416905750495242\n\nSeason of Passage guides compilation by Clement : https://discord.com/channels/575762611111592007/575827924343848960/1097422433981567046",
        image: "https://media.discordapp.net/attachments/867638574571323424/1131558753532125224/Passage_Seasonal_Quest_05.jpg",
      },
    ],
  },
  remembrance: {
    name: "Remembrance",
    realm: "Vault of Knowledge",
    icon: "<:remembrance:1130958673959719062>",
    from: ["16-01-2023", "02-04-2023"],
    quests: [
      {
        title: "Quest #1",
        description:
          "```Season of Remembrance Quest #1 guide by Clement```\n **__Relevent Links__**\nHow to get to the Repository of Refuge by Clement: https://discord.com/channels/575762611111592007/575827924343848960/1064457604568453190",
        image: "https://media.discordapp.net/attachments/867638574571323424/1131662738020634804/Seasonal_Quest_Guide_1.jpg",
      },
      {
        title: "Quest #2",
        description:
          "```Season of Remembrance Quest #2 guide by Clement```\n **__Relevent Links__**\nHow to get to the Repository of Refuge by Clement: https://discord.com/channels/575762611111592007/575827924343848960/1064457604568453190",
        image: "https://media.discordapp.net/attachments/867638574571323424/1131662754135154800/Quest_2.jpg",
      },
      {
        title: "Quest #3",
        description:
          "```Season of Remembrance Quest #3 guide by Clement```\n **__Relevent Links__**\nHow to get to the Repository of Refuge by Clement: https://discord.com/channels/575762611111592007/575827924343848960/1064457604568453190",
        image: "https://media.discordapp.net/attachments/867638574571323424/1131662772162281522/Quest_3.jpg",
      },
      {
        title: "Quest #4",
        description:
          "```Season of Remembrance Quest #4 guide by Clement```\n **__Relevent Links__**\nHow to get to the Repository of Refuge by Clement: https://discord.com/channels/575762611111592007/575827924343848960/1064457604568453190",
        image: "https://media.discordapp.net/attachments/867638574571323424/1131662790050992128/Quest_4.jpg",
      },
      {
        title: "Quest #5",
        description:
          "```Season of Remembrance Quest #5 guide by Clement```\n **__Relevent Links__**\nHow to get to the Repository of Refuge by Clement: https://discord.com/channels/575762611111592007/575827924343848960/1064457604568453190",
        image: "https://media.discordapp.net/attachments/867638574571323424/1131662807016939601/Quest_5.jpg",
      },
    ],
  },
  aurora: {
    name: "AURORA",
    realm: "Valley of Triumph",
    icon: "<:aurora:1130958641189621771>",
    from: ["17-10-2022", "02-01-2023"],
    quests: [
      {
        title: "Quest #1",
        description:
          "```Season of Aurora Quest #1 guide by Clement```\n__**Relevent Links**__\nHow to get to Aurora seasonal area by Clement: https://discord.com/channels/575762611111592007/575827924343848960/1031474080571990026 (Method 1 only worked during the season is now not available)\n\nSeason of Aurora guide compilation by Clement: https://discord.com/channels/575762611111592007/575827924343848960/1031462864894038016",
        image: "https://media.discordapp.net/attachments/867638574571323424/1132025563738034176/Quest_1.jpg",
      },
      {
        title: "Quest #2",
        description:
          "```Season of Aurora Quest #2 guide by Clement```\n__**Relevent Links**__\nHow to get to Aurora seasonal area by Clement: https://discord.com/channels/575762611111592007/575827924343848960/1031474080571990026 (Method 1 only worked during the season is now not available)\n\nSeason of Aurora guide compilation by Clement: https://discord.com/channels/575762611111592007/575827924343848960/1031462864894038016",
        image: "https://media.discordapp.net/attachments/867638574571323424/1132025604884136159/Quest_2.jpg",
      },
      {
        title: "Quest #3",
        description:
          "```Season of Aurora Quest #3 guide by Clement```\n__**Relevent Links**__\nHow to get to Aurora Season area by Clement: https://discord.com/channels/575762611111592007/575827924343848960/1031474080571990026 (Method 1 only worked during the season is now not available)\n\nSeason of Aurora guide compilation by Clement: https://discord.com/channels/575762611111592007/575827924343848960/1031462864894038016",
        image: "https://media.discordapp.net/attachments/867638574571323424/1132025686253654047/Quest_4.jpg",
      },
      {
        title: "Quest #4",
        description:
          "```Season of Aurora Quest #4 guide by Clement```\n__**Relevent Links**__\nHow to get to Aurora seasonal area by Clement: https://discord.com/channels/575762611111592007/575827924343848960/1031474080571990026 (Method 1 only worked during the season is now not available)\n\nSeason of Aurora guide compilation by Clement: https://discord.com/channels/575762611111592007/575827924343848960/1031462864894038016",
        image: "https://media.discordapp.net/attachments/867638574571323424/1132025686253654047/Quest_4.jpg",
      },
      {
        title: "Quest #5 - Musical Voyage",
        description:
          "```Season of Aurora Quest #5```\n**__Prepare for the Musical Voyage__**\nTo complete the final quest of Aurora, you simply need to attend the concert at least once if you haven't already.\n\nTo attend the concert you'll need the Wings of Aurora (<:aurora:1130958641189621771>) to teleport you to the concert area. If you don't have the wings, you can ask a friend who has it to teleport you there or you can request help in <#591777850726547477>.\n\nThe concert has six time slots, each lasting for about 50 minutes.\n\n __Concert times:__ (These timestamps are in your local time!)\n> <t:1682838027:t> 》<t:1682852427:t> 》<t:1682866827:t> 》<t:1682881227:t> 》<t:1682895627:t> 》<t:1682910027:t>\n🔎 More Details: <https://bit.ly/SkyGamesCom> and <http://thatskygame.com/worldrecord>\n\n__**Relevent Links**__\nHow to get to Aurora seasonal area by Clement: https://discord.com/channels/575762611111592007/575827924343848960/1031474080571990026 (Method 1 only worked during the season is now not available)\n\nSeason of Aurora guide compilation by Clement: https://discord.com/channels/575762611111592007/575827924343848960/1031462864894038016",
      },
    ],
  },
  shattering: {
    name: "Shattering",
    icon: "<:shattering:1130961257097334895>",
    from: ["11-07-2022", "26-09-2022"],
    quests: [
      {
        title: "Quest #1",
        description:
          "Post Season of Shattering, completing Shattering quests now requires a red shard event. To check today's shard type, use the '</shards:1142231977328648364>' command. You can also specify a future date to inquire about red shards.\n\nAfter successfully completing a red shard event, you'll have a chance to interact with the Void of Shattering. Clicking on it will teleport you to the Void, where you can engage with the Void guide to activate additional quests. You can repeat this process multiple times in a day.\n\nEach quest in this series rewards a distinct memory, each containing a winged light. It's important to note that once you've completed all Shattering quests, memories obtained from subsequent red shard events will be entirely random, preventing you from selecting a specific memory. Each red shard day will get a single random memory.\n\n**__Relevent Links__**\nAll about Shards by Nami: https://discord.com/channels/575762611111592007/585339436322259003/998518828055154728\n\nTips on how to SOLO the Shard quests by StarDream: https://discord.com/channels/575762611111592007/575827924343848960/996129498783293490\n\nFinding Shard events using in-game cues by Adome: https://discord.com/channels/575762611111592007/585339436322259003/996267192205201408\n\nCompilation of Shattering seasonal guides by Clement: https://discord.com/channels/575762611111592007/575827924343848960/995967135329308672\n\nFAQs about Shards by Nami: https://discord.com/channels/575762611111592007/585339436322259003/998520119330357298\n\n```Season of Shattering quest guide by Clement```",
        image: "https://media.discordapp.net/attachments/867638574571323424/1132044192831508611/Shattering_quest.jpg",
      },
    ],
  },
  performance: {
    name: "Performance",
    realm: "Valley of Triumph",
    icon: "<:performance:1130958595345895444>",
    from: ["11-04-2022", "26-06-2022"],
    quests: [
      {
        title: "Quest #1",
        description:
          "```Season of Performance Quest #1 guide by Clement```\n\n**__Relevent Links__**\n\nSeason of Performance guides compilation by Clement: https://discord.com/channels/575762611111592007/575827924343848960/962976441262288916",
        image:
          "https://media.discordapp.net/attachments/867638574571323424/1132069754635550831/08_Seasonal_Quest_Guide_-_Quest_1.jpg",
      },
      {
        title: "Quest #2",
        description:
          "```Season of Performance Quest #2 guide by Clement```\n\n**__Relevent Links__**\n\nSeason of Performance guides compilation by Clement: https://discord.com/channels/575762611111592007/575827924343848960/962976441262288916",
        image:
          "https://media.discordapp.net/attachments/867638574571323424/1132069774910828614/09_Seasonal_Quest_Guide_-_Quest_2.jpg",
      },
      {
        title: "Quest #3",
        description:
          "```Season of Performance Quest #3 guide by Clement```\n\n**__Relevent Links__**\n\nSeason of Performance guides compilation by Clement: https://discord.com/channels/575762611111592007/575827924343848960/962976441262288916",
        image:
          "https://media.discordapp.net/attachments/867638574571323424/1132069846289502248/10_Seasonal_Quest_Guide_-_Quest_3.png",
      },
      {
        title: "Quest #4",
        description:
          "```Season of Performance Quest #4 guide by Clement```\n\n**__Relevent Links__**\n\nSeason of Performance guides compilation by Clement: https://discord.com/channels/575762611111592007/575827924343848960/962976441262288916\n\nGuide on the Harmony Hall by Clement: https://discord.com/channels/575762611111592007/575827924343848960/978195789908160532\n\nHow to get to the Harmony Hall(by <@493048848005070869>)https://discord.com/channels/575762611111592007/575827924343848960/978652215860408350",
        image: "https://media.discordapp.net/attachments/867638574571323424/1132069812089139290/Performance_quest_4.jpg",
      },
      {
        title: "Quest #5",
        description:
          "```Season of Performance Quest #5 guide by Clement```\n\n**__Relevent Links__**\n\nSeason of Performance guides compilation by Clement: https://discord.com/channels/575762611111592007/575827924343848960/962976441262288916\n\nGuide on the Harmony Hall by Clement: https://discord.com/channels/575762611111592007/575827924343848960/978195789908160532\n\nHow to get to the Harmony Hall(by <@493048848005070869>)https://discord.com/channels/575762611111592007/575827924343848960/978652215860408350",
        image: "https://media.discordapp.net/attachments/867638574571323424/1132069861133140038/Performance_quest_5.jpg",
      },
    ],
  },
  abyss: {
    name: "Abyss",
    realm: "Golden Wasteland",
    icon: "<:abyss:1130958569748045845>",
    from: ["17-01-2022", "27-03-2022"],
    quests: [
      {
        title: "Quest #1",
        description:
          "```Season of Abyss Quest #1 Guide by Clement```\n\n**__Relevent Links__**\nHow to get to the Treasure Reef by Clement: https://discord.com/channels/575762611111592007/575827924343848960/932545027211665429\nMap of Treasure Reef(Surface) by Clement: https://discord.com/channels/575762611111592007/575827924343848960/932547429759328286\nMap of Treasure Reef(Underground) by Clement: https://discord.com/channels/575762611111592007/575827924343848960/932549750757158972\nSea creatures of Abyss by (Al): https://discord.com/channels/575762611111592007/575827924343848960/953550735340097547\nGuide on diving feature by Clement: https://discord.com/channels/575762611111592007/575827924343848960/932551129747841054",
        image: "https://media.discordapp.net/attachments/867638574571323424/1132235932171509853/ABYSS_QUEST_1.jpg",
      },
      {
        title: "Quest #2",
        description:
          "```Season of Abyss Quest #2 Guide by Clement```\n\n**__Relevent Links__**\nHow to get to the Treasure Reef by Clement: https://discord.com/channels/575762611111592007/575827924343848960/932545027211665429\nMap of Treasure Reef(Surface) by Clement: https://discord.com/channels/575762611111592007/575827924343848960/932547429759328286\nMap of Treasure Reef(Underground) by Clement: https://discord.com/channels/575762611111592007/575827924343848960/932549750757158972\nSea creatures of Abyss by (Al): https://discord.com/channels/575762611111592007/575827924343848960/953550735340097547\nGuide on diving feature by Clement: https://discord.com/channels/575762611111592007/575827924343848960/932551129747841054",
        image: "https://media.discordapp.net/attachments/867638574571323424/1132235952178352218/Abyss_quest_2.jpg",
      },
      {
        title: "Quest #3",
        description:
          "```Season of Abyss Quest #3 Guide by Clement```\n\n**__Relevent Links__**\nHow to get to the Treasure Reef by Clement: https://discord.com/channels/575762611111592007/575827924343848960/932545027211665429\nMap of Treasure Reef(Surface) by Clement: https://discord.com/channels/575762611111592007/575827924343848960/932547429759328286\nMap of Treasure Reef(Underground) by Clement: https://discord.com/channels/575762611111592007/575827924343848960/932549750757158972\nSea creatures of Abyss by (Al): https://discord.com/channels/575762611111592007/575827924343848960/953550735340097547\nGuide on diving feature by Clement: https://discord.com/channels/575762611111592007/575827924343848960/932551129747841054",
        image: "https://media.discordapp.net/attachments/867638574571323424/1132235994498879548/Abyss_quest_3.jpg",
      },
      {
        title: "Quest #4",
        description:
          "```Season of Abyss Quest #4 Guide by Clement```\n\n**__Relevent Links__**\nHow to get to the Treasure Reef by Clement: https://discord.com/channels/575762611111592007/575827924343848960/932545027211665429\nMap of Treasure Reef(Surface) by Clement: https://discord.com/channels/575762611111592007/575827924343848960/932547429759328286\nMap of Treasure Reef(Underground) by Clement: https://discord.com/channels/575762611111592007/575827924343848960/932549750757158972\nSea creatures of Abyss by (Al): https://discord.com/channels/575762611111592007/575827924343848960/953550735340097547\nGuide on diving feature by Clement: https://discord.com/channels/575762611111592007/575827924343848960/932551129747841054",
        image: "https://media.discordapp.net/attachments/867638574571323424/1132236033447165983/Abyss_quest_4.jpg",
      },
      {
        title: "Quest #5",
        description:
          "```Season of Abyss Quest #5 Guide by Clement```\n\n**__Relevent Links__**\nHow to get to the Treasure Reef by Clement: https://discord.com/channels/575762611111592007/575827924343848960/932545027211665429\nMap of Treasure Reef(Surface) by Clement: https://discord.com/channels/575762611111592007/575827924343848960/932547429759328286\nMap of Treasure Reef(Underground) by Clement: https://discord.com/channels/575762611111592007/575827924343848960/932549750757158972\nSea creatures of Abyss by (Al): https://discord.com/channels/575762611111592007/575827924343848960/953550735340097547\nGuide on diving feature by Clement: https://discord.com/channels/575762611111592007/575827924343848960/932551129747841054",
        image: "https://media.discordapp.net/attachments/867638574571323424/1132236054238347337/Abyss_quest_5.jpg",
      },
    ],
  },
  flight: {
    name: "Flight",
    realm: "Daylight Prairie",
    icon: "<:flight:1130958544276045945>",
    from: ["04-10-2021", "19-10-2021"],
    quests: [
      {
        title: "Quest #1",
        description:
          "```Season of Flight Quest #1 Guide by Clement```\n\n__**Relevent Links**__\nHow to get to the Wind Paths by Clement: https://discord.com/channels/575762611111592007/575827924343848960/894480614449897482\nMap of the Wind Paths by Clement: https://discord.com/channels/575762611111592007/575827924343848960/894479710359265331\nTunnel Map by Clement: https://discord.com/channels/575762611111592007/575827924343848960/894480277282361406\nMap of the Cloud Tunnels(Final Version) by Clement: https://discord.com/channels/575762611111592007/575827924343848960/916547616643350579",
        image: "https://media.discordapp.net/attachments/867638574571323424/1132249773357940787/Flight_quest_1.png",
      },
      {
        title: "Quest #2",
        description:
          "```Season of Flight Quest #2 Guide by Clement```\n\n__**Relevent Links**__\nHow to get to the Wind Paths by Clement: https://discord.com/channels/575762611111592007/575827924343848960/894480614449897482\nMap of the Wind Paths by Clement: https://discord.com/channels/575762611111592007/575827924343848960/894479710359265331\nTunnel Map by Clement: https://discord.com/channels/575762611111592007/575827924343848960/894480277282361406\nMap of the Cloud Tunnels(Final Version) by Clement: https://discord.com/channels/575762611111592007/575827924343848960/916547616643350579",
        image: "https://media.discordapp.net/attachments/867638574571323424/1132249776344281088/Flight_quest_2.png",
      },
      {
        title: "Quest #3",
        description:
          "```Season of Flight Quest #3 Guide by Clement```\n\n__**Relevent Links**__\nHow to get to the Wind Paths by Clement: https://discord.com/channels/575762611111592007/575827924343848960/894480614449897482\nMap of the Wind Paths by Clement: https://discord.com/channels/575762611111592007/575827924343848960/894479710359265331\nTunnel Map by Clement: https://discord.com/channels/575762611111592007/575827924343848960/894480277282361406\nMap of the Cloud Tunnels(Final Version) by Clement: https://discord.com/channels/575762611111592007/575827924343848960/916547616643350579",
        image: "https://media.discordapp.net/attachments/867638574571323424/1132249774242943067/Flight_quest_3.png",
      },
      {
        title: "Quest #4",
        description:
          "```Season of Flight Quest #4 Guide by Clement```\n\n__**Relevent Links**__\nHow to get to the Wind Paths by Clement: https://discord.com/channels/575762611111592007/575827924343848960/894480614449897482\nMap of the Wind Paths by Clement: https://discord.com/channels/575762611111592007/575827924343848960/894479710359265331\nTunnel Map by Clement: https://discord.com/channels/575762611111592007/575827924343848960/894480277282361406\nMap of the Cloud Tunnels(Final Version) by Clement: https://discord.com/channels/575762611111592007/575827924343848960/916547616643350579",
        image: "https://media.discordapp.net/attachments/867638574571323424/1132249774872084580/Flight_quest_4.png",
      },
      {
        title: "Quest #5",
        description:
          "```Season of Flight Quest #5 Guide by Clement```\n\n__**Relevent Links**__\nHow to get to the Wind Paths by Clement: https://discord.com/channels/575762611111592007/575827924343848960/894480614449897482\nMap of the Wind Paths by Clement: https://discord.com/channels/575762611111592007/575827924343848960/894479710359265331\nTunnel Map by Clement: https://discord.com/channels/575762611111592007/575827924343848960/894480277282361406\nMap of the Cloud Tunnels(Final Version) by Clement: https://discord.com/channels/575762611111592007/575827924343848960/916547616643350579",
        image: "https://media.discordapp.net/attachments/867638574571323424/1132249776998600704/Flight_quest_5.png",
      },
    ],
  },
  the_little_prince: {
    name: "The Little Prince",
    realm: "Vault of Knowledge",
    icon: "<:littleprince:1130958521253502987>",
    from: ["06-07-2021", "19-09-2021"],
    quests: [
      {
        title: "Quest #1",
        description:
          "```Season of the Little Prince Quest #1 Guide by Clement```\n\n**__Relevent Links__**\nSeason of the Little Prince Guides Compilation by Clement: https://discord.com/channels/575762611111592007/575827924343848960/861871424709197835\nMap of Starlight Desert by Clement: https://discord.com/channels/575762611111592007/575827924343848960/861865089111949322\nHow to get to the Starlight Desert by Clement: https://discord.com/channels/575762611111592007/575827924343848960/861865089111949322",
        image: "https://media.discordapp.net/attachments/867638574571323424/1132403267628970165/Little_prince_quest_1.png",
      },
      {
        title: "Quest #2",
        description:
          "```Season of the Little Prince Quest #2 Guide by Clement```\n\n**__Relevent Links__**\nSeason of the Little Prince Guides Compilation by Clement: https://discord.com/channels/575762611111592007/575827924343848960/861871424709197835\nMap of Starlight Desert by Clement: https://discord.com/channels/575762611111592007/575827924343848960/861865089111949322\nHow to get to the Starlight Desert by Clement: https://discord.com/channels/575762611111592007/575827924343848960/861865089111949322",
        image: "https://media.discordapp.net/attachments/867638574571323424/1132403267033366729/Little_prince_quest_2.png",
      },
      {
        title: "Quest #3",
        description:
          "```Season of the Little Prince Quest #3 Guide by Clement```\n\n**__Relevent Links__**\nSeason of the Little Prince Guides Compilation by Clement: https://discord.com/channels/575762611111592007/575827924343848960/861871424709197835\nMap of Starlight Desert by Clement: https://discord.com/channels/575762611111592007/575827924343848960/861865089111949322\nHow to get to the Starlight Desert by Clement: https://discord.com/channels/575762611111592007/575827924343848960/861865089111949322",
        image: "https://media.discordapp.net/attachments/867638574571323424/1132403268400709723/Little_prince_quest_3.png",
      },
      {
        title: "Quest #4",
        description:
          "```Season of the Little Prince Quest #4 Guide by Clement```\n\n**__Relevent Links__**\nSeason of the Little Prince Guides Compilation by Clement: https://discord.com/channels/575762611111592007/575827924343848960/861871424709197835\nMap of Starlight Desert by Clement: https://discord.com/channels/575762611111592007/575827924343848960/861865089111949322\nHow to get to the Starlight Desert by Clement: https://discord.com/channels/575762611111592007/575827924343848960/861865089111949322",
        image: "https://media.discordapp.net/attachments/867638574571323424/1132403269105360896/Little_prince_quest_4.png",
      },
      {
        title: "Quest #5",
        description:
          "```Season of the Little Prince Quest #5 Guide by Clement```\n\n**__Relevent Links__**\nSeason of the Little Prince Guides Compilation by Clement: https://discord.com/channels/575762611111592007/575827924343848960/861871424709197835\nMap of Starlight Desert by Clement: https://discord.com/channels/575762611111592007/575827924343848960/861865089111949322\nHow to get to the Starlight Desert by Clement: https://discord.com/channels/575762611111592007/575827924343848960/861865089111949322",
        image: "https://media.discordapp.net/attachments/867638574571323424/1132403269856133190/Little_prince_quest_5.png",
      },
      {
        title: "Quest #6",
        description:
          "```Season of the Little Prince Quest #6 Guide by Clement```\n\n**__Relevent Links__**\nSeason of the Little Prince Guides Compilation by Clement: https://discord.com/channels/575762611111592007/575827924343848960/861871424709197835\nMap of Starlight Desert by Clement: https://discord.com/channels/575762611111592007/575827924343848960/861865089111949322\nHow to get to the Starlight Desert by Clement: https://discord.com/channels/575762611111592007/575827924343848960/861865089111949322",
        image: "https://media.discordapp.net/attachments/867638574571323424/1132403270804058222/Little_prince_quest_6.png",
      },
      {
        title: "Quest #7",
        description:
          "```Season of the Little Prince Quest #7 Guide by Clement```\n\n**__Relevent Links__**\nSeason of the Little Prince Guides Compilation by Clement: https://discord.com/channels/575762611111592007/575827924343848960/861871424709197835\nMap of Starlight Desert by Clement: https://discord.com/channels/575762611111592007/575827924343848960/861865089111949322\nHow to get to the Starlight Desert by Clement: https://discord.com/channels/575762611111592007/575827924343848960/861865089111949322",
        image: "https://media.discordapp.net/attachments/867638574571323424/1132403271659684001/Little_prince_quest_7.png",
      },
    ],
  },
  assembly: {
    name: "Assembly",
    realm: "Hidden FOrest",
    icon: "<:assembly:1130958465351811173>",
    from: ["05-04-2021", "13-06-2021"],
    quests: [
      {
        title: "Quest #1",
        description:
          "```Season of Assembly Quest #1 Guide by Clement```\n\n**__Relevent Links__**\nSummary of Scavenger Quests by Mimi: https://discord.com/channels/575762611111592007/575819064698470417/848886201216925727\nHow to get to the Treehouse by Clement: https://discord.com/channels/575762611111592007/575827924343848960/828525607100743722",
        image: "https://media.discordapp.net/attachments/867638574571323424/1132971527952924744/06_Seasonal_Quest_Guide_1.png",
      },
      {
        title: "Quest #2",
        description:
          "```Season of Assembly Quest Guide 2 by Clement```\n\n**__Relevent Links__**\nSummary of Scavenger Quests by Mimi: https://discord.com/channels/575762611111592007/575819064698470417/848886201216925727\nHow to get to the Treehouse by Clement: https://discord.com/channels/575762611111592007/575827924343848960/828525607100743722",
        image:
          "https://media.discordapp.net/attachments/867638574571323424/1132971528586281071/07_Seasonal_Quest_Guide_2.png.png",
      },
      {
        title: "Quest #3",
        description:
          "```Season of Assembly Quest Guide 3 by Clement```\n\n**__Relevent Links__**\nSummary of Scavenger Quests by Mimi: https://discord.com/channels/575762611111592007/575819064698470417/848886201216925727\nHow to get to the Treehouse by Clement: https://discord.com/channels/575762611111592007/575827924343848960/828525607100743722",
        image:
          "https://media.discordapp.net/attachments/867638574571323424/1132971529320271982/08_Seasonal_Quest_Guide_3_New.png",
      },
      {
        title: "Quest #4",
        description:
          "```Season of Assembly Quest Guide 4 by Clement```\n\n**__Relevent Links__**\nSummary of Scavenger Quests by Mimi: https://discord.com/channels/575762611111592007/575819064698470417/848886201216925727\nHow to get to the Treehouse by Clement: https://discord.com/channels/575762611111592007/575827924343848960/828525607100743722",
        image: "https://media.discordapp.net/attachments/867638574571323424/1132971530146562048/09_Seasonal_Quest_Guide_4.png",
      },
      {
        title: "Quest #5",
        description:
          "```Season of Assembly Quest Guide 5 by Clement```\n\n**__Relevent Links__**\nSummary of Scavenger Quests by Mimi: https://discord.com/channels/575762611111592007/575819064698470417/848886201216925727\nHow to get to the Treehouse by Clement: https://discord.com/channels/575762611111592007/575827924343848960/828525607100743722",
        image: "https://media.discordapp.net/attachments/867638574571323424/1132971531140599808/10_Seasonal_Quest_Guide_5.png",
      },
      {
        title: "Quest #6",
        description:
          "```Season of Assembly Quest #6 Guide by Clement```\n\n**__Relevent Links__**\nSummary of Scavenger Quests by Mimi: https://discord.com/channels/575762611111592007/575819064698470417/848886201216925727\nHow to get to the Treehouse by Clement: https://discord.com/channels/575762611111592007/575827924343848960/828525607100743722",
        image: "https://media.discordapp.net/attachments/867638574571323424/1132971532063359026/11_Seasonal_Quest_Guide_6.png",
      },
    ],
  },
  dreams: {
    name: "Dreams",
    realm: "Valley of Triumph",
    icon: "<:dreams:1130958442232815646>",
    from: ["04-01-2020", "15-03-2020"],
    quests: [
      {
        title: "Quest",
        description:
          "```Season of Dreams Comprehensive Map by Clement```\n_seasonal quests location at the bottom right in the guide_",
        image:
          "https://media.discordapp.net/attachments/867638574571323424/1135652973217845399/Welcome_to_the_Village_of_Dreams_Final_Version.jpg",
      },
    ],
  },
  prophecy: {
    name: "Prophecy",
    realm: "Isle of Dawn",
    icon: "<:prophecy:1130958414655279304>",
    from: ["05-10-2020", "13-10-2020"],
    quests: [
      {
        title: "Quest #1",
        description: "```Trial of Water by Clement```",
        image:
          "https://media.discordapp.net/attachments/867638574571323424/1136000294313021581/Season_of_Prophecy_-_Trial_1_Trial_of_Water_Full.png",
      },
      {
        title: "Quest #2",
        description: "```Trial of Earth by Clement```",
        image: "https://media.discordapp.net/attachments/867638574571323424/1136000295026045028/Earth_TRIAL.png",
      },
      {
        title: "Quest #3",
        description: "```Trial of Air by Clement```",
        image:
          "https://media.discordapp.net/attachments/867638574571323424/1136000327750008892/Season_of_Prophecy_-_Trial_3_Trial_of_Air_Full.jpg",
      },
      {
        title: "Quest #4",
        description: "```Trial of Fire by Clement```",
        image: "https://media.discordapp.net/attachments/867638574571323424/1136000295537754282/Fire_trial.png",
      },
    ],
  },
  sanctuary: {
    name: "Sanctuary",
    realm: "Daylight Prairie",
    icon: "<:sanctuary:1130958391347515573>",
    from: ["13-07-2020", "21-09-2020"],
    quests: [
      {
        title: "Quest #1",
        description: "```Season of Sanctuary Quest #1 by Aladdin```",
        image:
          "https://media.discordapp.net/attachments/867638574571323424/1139564383970787429/BellQuest1_20200908_153240817_1.mp4",
      },
      {
        title: "Quest #2",
        description: "```Season of Sanctuary Quest #2 by Aladdin```",
        image:
          "https://media.discordapp.net/attachments/867638574571323424/1139564380917338142/BellQuest2_20200908_153341995_1.mp4",
      },
      {
        title: "Quest #3",
        description: "```Season of Sanctuary Quest #3 by Aladdin```",
        image:
          "https://media.discordapp.net/attachments/867638574571323424/1139564381680718005/BellQuest3_20200908_153113449_1.mp4",
      },
      {
        title: "Quest #4",
        description: "```Season of Sanctuary Quest #4 by Aladdin```",
        image:
          "https://media.discordapp.net/attachments/867638574571323424/1139564383194845234/BellQuest4_20200908_153437991_1.mp4",
      },
      {
        title: "Quest #5",
        description: "```Season of Sanctuary Quest #6 by Aladdin```",
        image:
          "https://media.discordapp.net/attachments/867638574571323424/1139564382486003743/BellQuest5_20200908_153517182_1.mp4",
      },
      {
        title: "Quest #6",
        description: "```Season of Sanctuary Quest #6 by Aladdin```",
        image:
          "https://media.discordapp.net/attachments/867638574571323424/1139644885457182840/BellQuest_6_20200908_152835766_1.mp4",
      },
    ],
  },
  enchantment: {
    name: "Enchantment",
    realm: "Isle of Dawn",
    icon: "<:enchantment:1130958367674867742>",
    from: ["20-04-2020", "21-06-2020"],
    quests: [
      {
        title: "Quest #1",
        description:
          "```Season of Enchanthment Quest #1 (Red Light) by Clement```\n**__Relevent Links__**\nHow to Get to the Forgotten Ark by Clement https://discord.com/channels/575762611111592007/585339436322259003/1006901886206607480",
        image: "https://media.discordapp.net/attachments/867638574571323424/1140024469084188793/5_Red_Light_Location.png",
      },
      {
        title: "Quest #2",
        description:
          "```Season of Enchanthment Quest #2 (Blue Light) by Clement```\n**__Relevent Links__**\nHow to Get to the Forgotten Ark by Clement https://discord.com/channels/575762611111592007/585339436322259003/1006901886206607480",
        image: "https://media.discordapp.net/attachments/867638574571323424/1140024468417298502/4_Blue_Light_Location.png",
      },
      {
        title: "Quest #3",
        description:
          "```Season of Enchanthment Quest #3 (Cyan Light) by Clement```\n**__Relevent Links__**\nHow to Get to the Forgotten Ark by Clement https://discord.com/channels/575762611111592007/585339436322259003/1006901886206607480",
        image: "https://media.discordapp.net/attachments/867638574571323424/1140024466152357928/1_Cyan_Light.png",
      },
      {
        title: "Quest #4",
        description:
          "```Season of Enchanthment Quest #4 (Green Light) by Clement```\n**__Relevent Links__**\nHow to Get to the Forgotten Ark by Clement https://discord.com/channels/575762611111592007/585339436322259003/1006901886206607480",
        image: "https://media.discordapp.net/attachments/867638574571323424/1140024466752155718/2_Green_Light_Location.png",
      },
      {
        title: "Quest #5",
        description:
          "```Season of Enchanthment Quest #5 (Purple Light) by Clement```\n**__Relevent Links__**\nHow to Get to the Forgotten Ark by Clement https://discord.com/channels/575762611111592007/585339436322259003/1006901886206607480",
        image: "https://media.discordapp.net/attachments/867638574571323424/1140024520149848144/6_Purple_Light_Location.jpg",
      },
      {
        title: "Quest #6",
        description:
          "```Season of Enchanthment Quest #6 (Orange Light) by Clement```\n**__Relevent Links__**\nHow to Get to the Forgotten Ark by Clement https://discord.com/channels/575762611111592007/585339436322259003/1006901886206607480",
        image: "https://media.discordapp.net/attachments/867638574571323424/1140024467435815002/3_Orange_Light_Location.png",
      },
    ],
  },
  rhythm: {
    name: "Rhythm",
    icon: "<:rhythm:1S130958345352777849>",
    from: ["24-01-2020", "05-04-2020"],
  },
  belonging: {
    name: "Belonging",
    icon: "<:belonging:1130958323823423509>",
    from: ["18-11-2019", "12-01-2020"],
  },
  lightseeker: {
    name: "Lightseeker",
    icon: "<:lightseekers:1130958300293365870>",
    from: ["23-09-2019", "10-11-2019"],
  },
  gratitude: {
    name: "Gratitude",
    icon: "<:gratitude:1130958261349261435>",
    from: ["19-07-2019", "02-09-2019"],
  },
} satisfies { [key: string]: SeasonData };
