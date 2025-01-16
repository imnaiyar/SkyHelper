import { Controller, Get, Inject } from "@nestjs/common";
import { SkyHelper as BotService } from "#structures";
import type { BotStats, SpiritData } from "../types.js";
import { parseEmoji } from "discord.js";
import type { SeasonalSpiritData, SpiritsData } from "#libs/constants/spirits-datas/type";
function isSeasonal(data: SpiritsData): data is SeasonalSpiritData {
  return "ts" in data;
}
@Controller("/stats")
export class StatsController {
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
      .filter(([, v]) => isSeasonal(v) && v.season)
      .map(([k, v]) => {
        const emoji = v.expression || { icon: "<:spiritIcon:1206501060303130664>" };
        const id = emoji && parseEmoji(emoji.icon)?.id;
        const url = id && this.bot.emojis.cache.get(id)?.imageURL();
        const t = { name: v.name, value: k, ...(url && { icon: url }) };
        return t;
      });
    return toReturn;
  }
}
