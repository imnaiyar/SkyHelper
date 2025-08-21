import { Controller, Get, Inject } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { SkyHelper as BotService } from "@/structures";
import type { BotStats, SpiritData } from "../types.js";
import type { SeasonalSpiritData, SpiritsData } from "@skyhelperbot/constants/spirits-datas";
function isSeasonal(data: SpiritsData): data is SeasonalSpiritData {
  return "ts" in data;
}
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
    schema: {
      type: "object",
      properties: {
        totalServers: { type: "number", example: 150 },
        totalMembers: { type: "number", example: 50000 },
        ping: { type: "number", example: 45 },
        commands: { type: "number", example: 25 },
        totalUserInstalls: { type: "number", example: 1000 },
      },
    },
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
      totalUserInstalls: application.approximate_user_install_count || 1,
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
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", example: "Abyss Spirit" },
          value: { type: "string", example: "abyss-spirit" },
          icon: { type: "string", example: "https://cdn.discordapp.com/emojis/1206501060303130664.png" },
        },
      },
    },
  })
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
