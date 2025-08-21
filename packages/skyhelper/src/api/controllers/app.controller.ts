import { Controller, Get, Query, Inject } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { z } from "zod";
import { ZodValidator } from "../pipes/zod-validator.pipe.js";
import { DateTime } from "luxon";
import { getTimesEmbed, buildShardEmbed } from "@/utils/classes/Embeds";
import { getTranslator } from "@/i18n";
import type { SkyHelper } from "@/structures";
import { supportedLang } from "@skyhelperbot/constants";
import { GetShardsParamsDto, GetTimesParamsDto } from "../dto/index.js";
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
  @ApiQuery({ name: "date", type: String, required: false, description: "Date in YYYY-MM-DD format", example: "2024-01-15" })
  @ApiQuery({ name: "noBtn", type: String, required: false, description: "Exclude buttons from embed", enum: ["true", "false"] })
  @ApiQuery({ name: "user", type: String, required: false, description: "User ID for personalized content" })
  @ApiQuery({ name: "locale", type: String, required: false, description: "Language locale", example: "en-US" })
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
  async getShardsEmbed(@Query(new ZodValidator(GetShardsParams)) query: z.infer<typeof GetShardsParams>) {
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
  @ApiQuery({ name: "locale", type: String, required: false, description: "Language locale", example: "en-US" })
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
}
