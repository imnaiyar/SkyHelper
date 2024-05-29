import { Controller, Get } from "@nestjs/common";
import { BotService } from "../services/bot.service.js";
@Controller("/stats")
export class StatsController {
  constructor(private readonly bot: BotService) {}

  @Get()
  async getGuild(): Promise<any> {
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
}
