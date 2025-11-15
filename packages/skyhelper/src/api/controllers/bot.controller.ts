import { Controller, Get, Inject } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { SkyHelper as BotService } from "@/structures";
import { BotStatsSchema, SpiritSchema, type BotStats, type SpiritData } from "../types.js";
import type { SeasonalSpiritData, SpiritsData } from "@skyhelperbot/constants/spirits-datas";
import { toJSONSchema, z } from "zod/v4";
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
    schema: toJSONSchema(BotStatsSchema),
  })
  async getStats(): Promise<BotStats> {
    const guilds = this.bot.guilds.size;
    const member = this.bot.guilds.reduce((acc, g) => acc + g.member_count, 0);
    const ping = this.bot.ping;
    const commands = this.bot.applicationCommands.size + 4;
    const application = await this.bot.api.applications.getCurrent();
    const stats = await this.bot.schemas.StatisticsModel.aggregate([
      {
        $facet: {
          commandStats: [
            { $match: { command: { $exists: true } } },
            {
              $group: {
                _id: {
                  date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                  commandName: "$command.name",
                },
                count: { $sum: 1 },
              },
            },

            {
              $project: {
                _id: 0,
                date: "$_id.date",
                commandName: "$_id.commandName",
                count: 1,
              },
            },
            { $sort: { "_id.date": 1, "_id.commandName": 1 } },
          ],
          guildEvents: [
            {
              $match: { guildEvent: { $exists: true } },
            },
            {
              $group: {
                _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } } },
                join: { $sum: { $cond: [{ $eq: ["$guildEvent.event", "join"] }, 1, 0] } },
                leave: { $sum: { $cond: [{ $eq: ["$guildEvent.event", "leave"] }, 1, 0] } },
                maxGuilds: { $max: "$guildEvent.guilds" },
              },
            },
            {
              $project: {
                _id: 0,
                date: "$_id.date",
                guilds: "$maxGuilds",
                join: 1,
                leave: 1,
              },
            },
            { $sort: { date: 1 } },
          ],
        },
      },
    ]).then((r) => r[0]);

    return {
      totalServers: guilds,
      totalMembers: member,
      ping: ping,
      totalUserInstalls: application.approximate_user_install_count ?? 1,
      commands: commands,
      statistics: { commands: stats.commandStats, guildEvents: stats.guildEvents },
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
  getSpirits(): SpiritData[] {
    const spirits = this.bot.spiritsData;
    const toReturn = Object.entries(spirits)
      .filter(([, v]) => isSeasonal(v))
      .map(([k, v]) => {
        const emoji = v.expression ?? { icon: "<:spiritIcon:1206501060303130664>" };
        const id = this.bot.utils.parseEmoji(emoji.icon)?.id;
        const url = id && this.bot.rest.cdn.emoji(id);
        const t = { name: v.name, value: k, ...(url && { icon: url }) };
        return t;
      });
    return toReturn;
  }
}
