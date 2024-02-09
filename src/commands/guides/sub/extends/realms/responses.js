module.exports = {
  responses: {
    summary_isle: {
      content:
        "# Isle of Dawn\nOften shortened to Isle, is a cool-toned desolate desert with scattered traces of civilization. It is the first Realm the player can enter, serving as the tutorial of Sky. Unique from every other Realm, Isle of Dawn is one large map with no loading screens (excluding the side areas, such as Cave of Prophecies and Passage Stone). In addition, Isle does not have a Social Space; its spawn point only holds the Spirit Tombstones of the base-game Isle of Dawn Spirits.\n\nIsle of Dawn holds 3 Regular Spirits, and 12 Seasonal Spirits.\n\n### Different Areas",
      embeds: [
        {
          title: "Mural Cave",
          description: `The Mural Cave is a small tunnel inside a hill with several bunches of white candles. Lighting them will reveal Murals on the walls of the tunnel that narrate the story of Sky. Jumping down from the cliff at the exit will lead you to the Sand Dunes.\n- This area holds a single Child of Light (Winged Light).\n\n_Source: [Isle_of_Dawn#Mural_Cave](<https://sky-children-of-the-light.fandom.com/wiki/Isle_of_Dawn#Mural_Cave>)_`,
          image: "https://cdn.discordapp.com/attachments/867638574571323424/1205601695820812298/Isle_MuralCave1.webp",
        },
        {
          title: "Sand Dunes",
          description: `The Sand Dunes is a barren desert littered with stone monuments and traces of ancient civilization. It makes up the majority of Isle of Dawn and serves as the main tutorial where the player learns the main mechanics of Sky. \nOff towards the left shore, there is a secluded tunnel with a linear path leading to a room with a miniature boat holding three Lightseeker Lights. In the center, the large triangular Passage Stone has white candles on one side that reveal Murals, and another side holding a campfire to meditate at to access the Passage Stone. Note that this meditation circle is only accessible once the player has progressed to at least Hidden Forest. To the right side of the plateau is the entrance to the Cave of Prophecies, a hidden area in an opening within the clouds. The portal is blocked off by a Spirit Gate requiring 2 Regular Spirits from Hidden Forest to be relived.The Sand Dunes is a barren desert littered with stone monuments and traces of ancient civilization. It makes up the majority of Isle of Dawn and serves as the main tutorial where the player learns the main mechanics of Sky. Sand Dunes hold a multitude of hidden secret areas with collectibles.\nOff towards the left shore, there is a secluded tunnel with a linear path leading to a room with a miniature boat holding three Lightseeker Lights. In the center, the large triangular Passage Stone has white candles on one side that reveal Murals, and another side holding a campfire to meditate at to access the Passage Stone. Note that this meditation circle is only accessible once the player has progressed to at least Hidden Forest. To the right side of the plateau is the entrance to the Cave of Prophecies, a hidden area in an opening within the clouds. The portal is blocked off by a Spirit Gate requiring 2 Regular Spirits from Hidden Forest to be relived.\n\n_Source: [Isle_of_Dawn#Sand_Dunes](<https://sky-children-of-the-light.fandom.com/wiki/Isle_of_Dawn#Sand_Dunes>)_`,
          image: "https://cdn.discordapp.com/attachments/867638574571323424/1205601695384735795/Isle_SandDunes1.webp",
        },
        {
          title: "Passage Stone",
          description:
            "The Passage Stone is the stone ramp in the middle of sand dunes in Isle of Dawn. Updated with the Season of Passage in Patch 0.21.0 with the addition of a campfire - where the actual area is found. All the quests, spirits, and activities can be found in this area. To enter the Passage Stone, hea-d to the middle of Isle of Dawn, where a bonfire with a meditation circle allows you to rest until nightfall. To unlock the meditation circle, the account would have had to progressed through at least Hidden Forest. Experience the memories of four young Spirits, and share in the passages that brought them together as they navigate their way towards community.\n\n_Source:[Isle_of_Dawn#Passage_Stone](<https://sky-children-of-the-light.fandom.com/wiki/Isle_of_Dawn#Passage_Stone>)_",
          image:
            "https://cdn.discordapp.com/attachments/867638574571323424/1205601694600396881/Isle_PassageStone1.webp",
        },
        {
          title: "Cave of Prophecies",
          description:
            "The Cave of Prophecies is a seasonal area added to Isle of Dawn, introduced along with the Season of Prophecy in Patch 0.11.0. All the quests, spirits, and activities can be found in this area. To enter the Cave of Prophecies, head to the top right edge of Isle of Dawn, where an opening in the clouds will begin your adventure. There is a Spirit Gate that requires 2 Regular Spirits from the Hidden Forest relived.[Isle_of_Dawn#Mural_Cave](<https://sky-children-of-the-light.fandom.com/wiki/Isle_of_Dawn#Cave_of_Prophecies>)",
          image:
            "https://cdn.discordapp.com/attachments/867638574571323424/1205601693652221962/Isle_CaveOfProphecies.webp",
        },
        {
          title: "Isle Temple",
          description: "The Isle Temple is a large cathedral home to the Elder of the Isle. To reach the Isle Temple, head for the rising cliff to the north of the Sand Dunes and fly onwards, following the wind which leads you to the Isle Temple. The interior of the Temple is small, only holding white candles which summon Murals, and a large gate requiring two buttons to be lit. Lighting them will open the gate, leading you to the main room of the Temple with the Elder of the Isle's altar. Lighting the altar's candles will activate a meditation circle, letting the player meet the Isle Elder in a cutscene. After the cutscene, the door ahead will open as Birds rush into the Temple. From the door, take off into the clouds and glide onto the next Realm, Daylight Prairie.\n\n_Source: [Isle_of_Dawn#Isle_Temple](<https://sky-children-of-the-light.fandom.com/wiki/Isle_of_Dawn#Isle_Temple>)_",
          image: "https://media.discordapp.net/attachments/867638574571323424/1205601693216153650/Isle_Temple1.webp",
        },
      ],
    },
  },
  getSummary(value) {
    return this.responses[value] || null;
  },
};
