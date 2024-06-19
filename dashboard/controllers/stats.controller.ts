import { Controller, Get, Inject } from "@nestjs/common";
import { SkyHelper as BotService } from "#structures";
import type { BotStats, SpiritData } from "../types.js";
import { parseEmoji } from "discord.js";
@Controller("/stats")
export class StatsController {
  // eslint-disable-next-line
  constructor(@Inject("BotClient") private readonly bot: BotService) {}

  @Get()
  async getGuild(): Promise<BotStats> {
    const guilds = this.bot.guilds.cache.size;
    const member = this.bot.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
    const ping = this.bot.ws.ping;
    const commands = (await this.bot.application.commands.fetch()).size + 4;
    return {
      totalServers: guilds,
      totalMembers: member,
      ping: ping,
      commands: commands,
    };
  }
  @Get("spirits")
  async getSpirits(): Promise<SpiritData[]> {
    const spirits = this.bot.spiritsData;
    const toReturn = Object.entries(spirits)
      .filter(([, v]) => v.season)
      .map(([k, v]) => {
        const emoji = v.call || v.emote || v.action || v.stance;
        const id = emoji && parseEmoji(emoji.icon)?.id;
        const url = id && this.bot.emojis.cache.get(id)?.imageURL();
        const t = { name: v.name, value: k, ...(url && { icon: url }) };
        return t;
      });
    return toReturn;
  }
}
