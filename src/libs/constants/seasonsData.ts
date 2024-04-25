export interface SeasonData {
  name: string;
  realm?: string;
  icon: string;
  quests?: {
    title: string;
    description?: string;
    image?: string;
  }[];
}

export default {} as { [key: string]: SeasonData };
