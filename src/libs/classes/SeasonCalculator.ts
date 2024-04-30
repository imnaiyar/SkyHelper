import { User, AttachmentBuilder, GuildMember } from "discord.js";
import SeasonProgressCard from "#libs/classes/SeasonProgressCard";
export default class {
    private season: string;
    private author: GuildMember;
    private totalCurrency: number;
    private requiredCurrency: number;
    private remainingDays: number;
    private progressLevel: number;
    constructor(private data: any) {
        this.data = data;
    }
    public async buildCard(): Promise<AttachmentBuilder> {
      const card = new SeasonProgressCard()
      .setName(this.author.nickname ?? this.author.displayName)
      .setProgress(this.progressLevel)
    }
}
