import { Controller, Get, Query, Inject, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { z } from "zod/v4";
import { ZodValidator } from "../pipes/zod-validator.pipe.js";
import { DateTime } from "luxon";
import { getTimesEmbed, buildShardEmbed } from "@/utils/classes/Embeds";
import { getTranslator } from "@/i18n";
import type { SkyHelper } from "@/structures";
import { supportedLang, SkyPlannerData } from "@skyhelperbot/constants";
import utils from "node:util";
const GetShardsParams = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in the format 'YYYY-MM-DD'")
    .optional(),
  noBtn: z.enum(["true", "false"]).optional(),
  user: z.string().optional(),
  locale: z.enum(supportedLang.map((v) => v.value) as [string, ...string[]]).optional(),
});
const GetTimesParams = z.object({
  locale: z.enum(supportedLang.map((v) => v.value) as [string, ...string[]]).optional(),
});
@ApiTags("Application")
@Controller()
export class AppController {
  constructor(@Inject("BotClient") private readonly bot: SkyHelper) {}

  @Get()
  @ApiOperation({
    summary: "Health check endpoint",
    description: "Returns a simple hello world message to verify the API is running",
  })
  @ApiResponse({
    status: 200,
    description: "API is running successfully",
    schema: {
      type: "string",
      example: "Hello World!",
    },
  })
  getHello(): string {
    return "Hello World!";
  }

  @Get("shards-embed")
  @ApiOperation({
    summary: "Get shards embed data",
    description: "Retrieves Discord embed data for shard information on a specific date",
  })
  @ApiQuery({ name: "date", schema: z.toJSONSchema(GetShardsParams.shape.date) })
  @ApiQuery({ name: "noBtn", schema: z.toJSONSchema(GetShardsParams.shape.noBtn) })
  @ApiQuery({ name: "user", schema: z.toJSONSchema(GetShardsParams.shape.user) })
  @ApiQuery({ name: "locale", schema: z.toJSONSchema(GetShardsParams.shape.locale) })
  @ApiResponse({
    status: 200,
    description: "Discord embed object for shard information",
    schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        color: { type: "number" },
        timestamp: { type: "string" },
      },
    },
  })
  getShardsEmbed(@Query(new ZodValidator(GetShardsParams)) query: z.infer<typeof GetShardsParams>) {
    const { date, noBtn, user, locale } = query;
    let shardDate;
    if (date) {
      const [year, month, day] = date.split("-").map(Number);
      shardDate = DateTime.fromObject({ day, month, year }, { zone: "America/Los_Angeles" }).startOf("day");
    } else {
      shardDate = DateTime.now().setZone("America/Los_Angeles").startOf("day");
    }
    return buildShardEmbed(shardDate, getTranslator(locale ?? "en-US"), noBtn === "true", user);
  }

  @Get("times-embed")
  @ApiOperation({
    summary: "Get event times embed data",
    description: "Retrieves Discord embed data for Sky game event times",
  })
  @ApiQuery({ name: "locale", schema: z.toJSONSchema(GetTimesParams.shape.locale) })
  @ApiResponse({
    status: 200,
    description: "Discord embed object for event times",
    schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        color: { type: "number" },
        timestamp: { type: "string" },
      },
    },
  })
  async getTimesEmbed(@Query(new ZodValidator(GetTimesParams)) query: z.infer<typeof GetTimesParams>) {
    const { locale } = query;
    return getTimesEmbed(this.bot, getTranslator(locale ?? "en-US"));
  }

  // TODO: move this to admin protected route

  @Get("planner/:query")
  async getPlannerEntities(@Param("query") query: string) {
    const data = await SkyPlannerData.getSkyGamePlannerData();

    const results = SkyPlannerData.searchEntitiesByName(query, data);
    return results;
  }
  @Get("planner/get/:entity")
  async getPlannerEntity(@Param("entity") entity: string) {
    const data = await SkyPlannerData.getSkyGamePlannerData();

    const results = SkyPlannerData.getEntityByGuid(entity, data);
    return utils.inspect(results, { depth: 3 });
  }
  @Get("planner")
  async getPlannerData() {
    const data = await SkyPlannerData.getSkyGamePlannerData();

    return JSON.parse(JSON.stringify(data, removeCircular()));
  }
}

function removeCircular() {
  const seen = new WeakSet();
  return (_key: string, value: any) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) return; // remove circular ref
      seen.add(value);
    }
    return value;
  };
}
