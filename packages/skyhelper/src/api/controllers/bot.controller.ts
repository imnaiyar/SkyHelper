import { Controller, Get, Inject } from "@nestjs/common";
import { SkyHelper as BotService } from "@/structures";
import type { BotStats, SpiritData } from "../types.js";
import type { SeasonalSpiritData, SpiritsData } from "@skyhelperbot/constants/spirits-datas";
function isSeasonal(data: SpiritsData): data is SeasonalSpiritData {
  return "ts" in data;
}
@Controller("/stats")
export class BotController {
  constructor(@Inject("BotClient") private readonly bot: BotService) {}

  @Get()
  async getGuild(): Promise<BotStats> {
    const guilds = this.bot.guilds.size;
    const member = this.bot.guilds.reduce((acc, g) => acc + g.member_count, 0);
    const ping = this.bot.ping;
    const commands = this.bot.applicationCommands.size + 4;
    const application = await this.bot.api.applications.getCurrent();

    return {
      totalServers: guilds,
      totalMembers: member,
      ping: ping,
      totalUserInstalls: application.approximate_user_install_count,
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
        const id = emoji && this.bot.utils.parseEmoji(emoji.icon)?.id;
        const url = id && this.bot.rest.cdn.emoji(id);
        const t = { name: v.name, value: k, ...(url && { icon: url }) };
        return t;
      });
    return toReturn;
  }
}
