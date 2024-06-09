import { Controller, Get, Inject } from "@nestjs/common";
import { SkyHelper as BotService } from "#structures";
@Controller("/stats")
export class StatsController {
    constructor(@Inject("BotClient") private readonly bot: BotService) {}

    @Get()
    async getGuild(): Promise<any> {
        const guilds = this.bot.guilds.cache.size;
        const member = this.bot.guilds.cache.reduce(
            (acc, g) => acc + g.memberCount,
            0
        );
        const ping = this.bot.ws.ping;
        const commands = (await this.bot.application.commands.fetch()).size + 4;
        return {
            totalServers: guilds,
            totalMembers: member,
            ping: ping,
            commands: commands
        };
    }
}
