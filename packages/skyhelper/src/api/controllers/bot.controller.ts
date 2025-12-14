import { Controller, Get, Inject } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { SkyHelper as BotService } from "@/structures";
import { BotStatsSchema, SpiritSchema, type BotStats, type SpiritData } from "../types.js";
import { toJSONSchema, z } from "zod/v4";
import { fetchSkyData } from "@/planner";
import { SpiritType } from "@/types/planner";
@ApiTags("Bot Statistics")
@Controller("/stats")
export class BotController {
  constructor(@Inject("BotClient") private readonly bot: BotService) {}

  @Get()
  @ApiOperation({
    summary: "Get bot statistics",
    description: "Retrieves current bot statistics including server count, member count, and performance metrics",
  })
  @ApiResponse({
    status: 200,
    description: "Bot statistics retrieved successfully",
    schema: toJSONSchema(BotStatsSchema),
  })
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
      totalUserInstalls: application.approximate_user_install_count ?? 1,
      commands: commands,
    };
  }

  @Get("spirits")
  @ApiOperation({
    summary: "Get available spirits",
    description: "Retrieves list of available seasonal spirits with their metadata",
  })
  @ApiResponse({
    status: 200,
    description: "Spirits list retrieved successfully",
    schema: toJSONSchema(z.array(SpiritSchema)),
  })
  async getSpirits(): Promise<SpiritData[]> {
    const data = await fetchSkyData(this.bot);
    const spirits = data.spirits.items.filter(
      (s) => s.type !== SpiritType.Special && s.type !== SpiritType.Event,
    );
    const toReturn = spirits.map((s) => {
      const emoji = s.emoji ?? "<:spiritIcon:1206501060303130664>";
      const id = this.bot.utils.parseEmoji(emoji)?.id;
      const url = id && this.bot.rest.cdn.emoji(id);
      const t = { name: s.name, value: s.guid, ...(url && { icon: url }) };
      return t;
    });
    return toReturn;
  }
}
