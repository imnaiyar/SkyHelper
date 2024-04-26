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
    name: "Season of Nesting",
    realm: "Aviary Village",
    icon: "<:SONesting:1229963758680670291>",
    active: true,
    from: ["15-04-2024", "30-06-2024"],
    quests: [
      {
        title: "Quest 1",
        image: "",
      },
    ],
  },
} as { [key: string]: SeasonData };
