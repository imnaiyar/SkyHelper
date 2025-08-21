import { Body, Controller, Get, HttpException, HttpStatus, Inject, Patch } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from "@nestjs/swagger";
import { SkyHelper as BotService } from "@/structures";
import { EventDataSchema, TSDataSchema, type EventData, type TSData } from "../types.js";
import type { DailyQuestsSchema } from "@/types/schemas";
import { ZodValidator } from "../pipes/zod-validator.pipe.js";
import { z } from "zod";

const QuestSchema = z.object({
  title: z.string(),
  date: z.string(),
  description: z.string().optional(),
  images: z.array(
    z.object({
      url: z.string(),
      by: z.string(),
      source: z.string().optional(),
    }),
  ),
});

const QuestsSchema = z.object({
  quests: z.array(QuestSchema),
  last_updated: z.string(),
  last_message: z.string().optional(),
  rotating_candles: QuestSchema,
  seasonal_candles: QuestSchema.optional(),
});

@ApiTags("Game Data Updates")
@ApiBearerAuth()
@Controller("/update")
export class UpdateController {
  constructor(@Inject("BotClient") private readonly bot: BotService) {}

  // TS
  @Get("ts")
  @ApiOperation({
    summary: "Get current Traveling Spirit data",
    description: "Retrieves information about the current Traveling Spirit",
  })
  @ApiResponse({
    status: 200,
    description: "Traveling Spirit data retrieved successfully",
    schema: {
      type: "object",
      properties: {
        spirit: { type: "string", example: "abyss-spirit" },
        visitDate: { type: "string", example: "15-01-2024" },
        index: { type: "string", example: "1" },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid authentication" })
  async getTS(): Promise<TSData> {
    const data = await this.bot.schemas.getTS();
    return {
      spirit: data.value,
      visitDate: data.visitDate,
      index: data.index.toString(),
    };
  }

  @Patch("ts")
  @ApiOperation({
    summary: "Update Traveling Spirit data",
    description: "Updates the current Traveling Spirit information",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        spirit: { type: "string", example: "abyss-spirit" },
        visitDate: { type: "string", example: "15-01-2024" },
        index: { type: "string", example: "1" },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Traveling Spirit data updated successfully",
    schema: {
      type: "object",
      properties: {
        spirit: { type: "string", example: "abyss-spirit" },
        visitDate: { type: "string", example: "15-01-2024" },
        index: { type: "string", example: "1" },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid authentication" })
  @ApiBadRequestResponse({ description: "Invalid request body" })
  @ApiNotFoundResponse({ description: "Spirit not found" })
  async updateTS(@Body(new ZodValidator(TSDataSchema)) body: TSData): Promise<TSData> {
    const data = await this.bot.schemas.getTS();
    const spirit = this.bot.spiritsData[body.spirit];
    if (!spirit) throw new HttpException(`No spirit found for the given value "${body.spirit}"`, HttpStatus.NOT_FOUND);
    const values = {
      name: spirit.name,
      value: body.spirit,
      index: parseInt(body.index),
      visitDate: body.visitDate,
    };
    Object.assign(data, values);
    await data.save();
    return body;
  }

  // Events
  @Get("events")
  @ApiOperation({
    summary: "Get current event data",
    description: "Retrieves information about the current active event",
  })
  @ApiResponse({
    status: 200,
    description: "Event data retrieved successfully",
    schema: {
      type: "object",
      properties: {
        name: { type: "string", example: "Days of Bloom" },
        startDate: { type: "string", example: "15-01-2024" },
        endDate: { type: "string", example: "29-01-2024" },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid authentication" })
  async getEvents(): Promise<EventData> {
    const data = await this.bot.schemas.getEvent();
    return {
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
    };
  }

  @Patch("events")
  @ApiOperation({
    summary: "Update event data",
    description: "Updates the current event information",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        name: { type: "string", example: "Days of Bloom" },
        startDate: { type: "string", example: "15-01-2024" },
        endDate: { type: "string", example: "29-01-2024" },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Event data updated successfully",
    schema: {
      type: "object",
      properties: {
        name: { type: "string", example: "Days of Bloom" },
        startDate: { type: "string", example: "15-01-2024" },
        endDate: { type: "string", example: "29-01-2024" },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid authentication" })
  @ApiBadRequestResponse({ description: "Invalid request body" })
  async updateEvent(@Body(new ZodValidator(EventDataSchema)) body: EventData): Promise<EventData> {
    const data = await this.bot.schemas.getEvent();
    const values = {
      name: body.name,
      startDate: body.startDate,
      endDate: body.endDate,
    };
    Object.assign(data, values);
    await data.save();
    return body;
  }

  @Get("quests")
  @ApiOperation({
    summary: "Get daily quests data",
    description: "Retrieves current daily quests information",
  })
  @ApiResponse({
    status: 200,
    description: "Daily quests data retrieved successfully",
    schema: {
      type: "object",
      description: "Daily quests schema object",
    },
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid authentication" })
  async getQuests(): Promise<DailyQuestsSchema> {
    const data = await this.bot.schemas.getDailyQuests();
    return data;
  }

  @Patch("quests")
  @ApiOperation({
    summary: "Update daily quests data",
    description: "Updates the daily quests information",
  })
  @ApiBody({
    description: "Daily quests data to update",
    schema: {
      type: "object",
      properties: {
        quests: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              date: { type: "string" },
              description: { type: "string" },
              images: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    url: { type: "string" },
                    by: { type: "string" },
                    source: { type: "string" },
                  },
                },
              },
            },
          },
        },
        last_updated: { type: "string" },
        last_message: { type: "string" },
        rotating_candles: { type: "object" },
        seasonal_candles: { type: "object" },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Daily quests data updated successfully",
    schema: {
      type: "object",
      description: "Updated daily quests schema object",
    },
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid authentication" })
  @ApiBadRequestResponse({ description: "Invalid request body" })
  async patchQuests(@Body(new ZodValidator(QuestsSchema)) body: z.infer<typeof QuestsSchema>): Promise<DailyQuestsSchema> {
    const questSettings = await this.bot.schemas.getDailyQuests();
    questSettings.quests = body.quests;
    questSettings.rotating_candles = body.rotating_candles;
    questSettings.seasonal_candles = body.seasonal_candles;
    questSettings.last_message = body.last_message;
    questSettings.last_updated = body.last_updated;
    await questSettings.save();
    return questSettings;
  }
}
