import spiritsData from "../src/libs/constants/spirits-datas/index.js";

describe("spiritsData", () => {
  it("the object should contain correct data set", () => {
    expect(spiritsData).toBeInstanceOf(Object);
    // Verify that each key corresponds to a SpiritsData object
    for (const key in spiritsData) {
      expect(spiritsData[key]).toHaveProperty("name");
      expect(spiritsData[key]).toHaveProperty("type");
    }
  });

  it("should contain correct data for specific spirit", () => {
    const shaman = spiritsData["shaman"];
    expect(shaman).toBeDefined();

    expect(shaman.name).toBe("Greeting Shaman");
    expect(shaman.type).toBe("Seasonal Spirit");
    expect(shaman.image).toBe(
      "https://static.wikia.nocookie.net/sky-children-of-the-light/images/3/3e/Gratitude-Spirit-Greeting-Shaman.png",
    );
    expect(shaman.realm).toBe("Vault of Knowledge");
    // @ts-expect-error
    expect(shaman.season).toBe("Gratitude");
    // @ts-expect-error
    expect(shaman.ts).toEqual({
      eligible: true,
      returned: true,
      total: "3",
      dates: ["May 26, 2022 (#62)", "July 23, 2020 (#14)", "July 03, 2023 (SV#3)"],
    });
    // @ts-expect-error
    expect(shaman.tree).toEqual({
      by: "Clement",
      total: "112 :RegularCandle: 13 :RegularHeart: 2 :AC:",
      image: "Greeting_Shaman_Tree.png",
    });
    // @ts-expect-error
    expect(shaman.location).toEqual({
      by: "Clement",
      image: "Greeting_Shaman_Location.png",
    });

    expect(shaman.emote).toEqual({
      icon: "<:greetingShaman:1153511559490965664>",
      level: [
        {
          title: '"Kung Fu Emote" Level 1',
          image: "Greeting-Shaman-kung-fu-emote-level-1.gif",
        },
        {
          title: '"Kung Fu Emote" Level 2',
          image: "Greeting-Shaman-kung-fu-emote-level-2.gif",
        },
        {
          title: '"Kung Fu Emote" Level 3',
          image: "Greeting-Shaman-kung-fu-emote-level-3.gif",
        },
        {
          title: '"Kung Fu Emote" Level 4',
          image: "Greeting-Shaman-kung-fu-emote-level-4.gif",
        },
      ],
    });

    expect(shaman.cosmetics).toEqual([
      {
        name: "Mask",
        images: [
          {
            description: "The Mask",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/b/b7/Mask16-Seasonal_SoG_2019.png",
          },
        ],
        isSP: true,
        icon: "<:ShamanMask:1272141932579127357>",
        price: "54 <:RegularCandle:1207793250895794226>",
      },
      {
        name: "Instrument",
        images: [
          {
            description: "The Instrument",
            image:
              "https://static.wikia.nocookie.net/sky-children-of-the-light/images/1/18/Gratitude-Greeting-Shaman-Large_bell.png",
          },
          {
            description: "Playing the Instrument",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/4/4d/Instrument-Large_Bell-Seasonal.png",
          },
          {
            description: "Instrument on the Back",
            image: "https://static.wikia.nocookie.net/sky-children-of-the-light/images/2/2c/Gratitude_lg_bell_on_back.png",
          },
        ],
        icon: "<:ShamanInstrument:1272141953798242327>",
        price: "45 <:RegularCandle:1207793250895794226>",
        isSP: true,
      },
    ]);
  });
});
