import SeasonProgressCard from "../src/bot/libs/classes/SeasonProgressCard";

describe("Season Progress Card", () => {
  let instance: SeasonProgressCard;

  beforeEach(() => {
    instance = new SeasonProgressCard();
  });

  it("should set the progress correctly", () => {
    instance.setProgress(75);
    expect((instance as any).progress).toBe(75);
  });

  it("should set the name correctly", () => {
    instance.setName("NyR");
    expect((instance as any).name).toBe("NyR");
  });

  it("should set the season name correctly", () => {
    instance.setSeason("Season of Moments");
    expect((instance as any).season).toBe("Season of Moments");
  });

  it("should not allow progress to exceed 99.999%", async () => {
    instance.setProgress(150);
    await instance.build(); // invoking build to trigger the truncating
    expect((instance as any).progress).toBe(99.999);
  });

  it("should trim the name if it is longer than 20 characters", async () => {
    instance.setName("ThisIsAVeryLongUsernameThatExceedsTwentyCharacters");
    await instance.build(); // invoking build will trigger the name chectruncating");
  });

  it("should build the card buffer", async () => {
    const buffer = await instance.build();
    expect(buffer).toBeInstanceOf(Buffer);
  });

  it("should generate a buffer even if no thumbnail image is provided", async () => {
    instance.setThumbnailImage(null as unknown as string); // explicitly set thumbnail image to null
    const buffer = await instance.build();
    expect(buffer).toBeInstanceOf(Buffer);
  });
});
