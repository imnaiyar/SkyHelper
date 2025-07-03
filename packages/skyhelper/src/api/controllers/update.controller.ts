import { Body, Controller, Get, HttpException, HttpStatus, Inject, Patch } from "@nestjs/common";
import { SkyHelper as BotService } from "@/structures";
import { EventDataSchema, TSDataSchema, type EventData, type TSData } from "../types.js";
import type { DailyQuestsSchema } from "@/types/schemas";
import { ZodValidator } from "../pipes/zod-validator.pipe.js";
import { z } from "zod";
import { ApiBearerAuth, ApiBody, ApiResponse } from "@nestjs/swagger";
import { EventDataDto, TSDataDto } from "../types.dto.js";
import { createDtoFromZod } from "../createDto.js";

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

class QuestsDTO extends createDtoFromZod(QuestsSchema) {}
@ApiBearerAuth("auth-token")
@Controller("/update")
export class UpdateController {
  constructor(@Inject("BotClient") private readonly bot: BotService) {}

  // TS
  @Get("ts")
  async getTS(): Promise<TSData> {
    const data = await this.bot.schemas.getTS();
    return {
      spirit: data.value,
      visitDate: data.visitDate,
      index: data.index.toString(),
    };
  }

  @ApiBody({ type: TSDataDto, description: "The TS data to update" })
  @ApiResponse({ status: 200, description: "Returns the updated TS data", type: TSDataDto })
  @Patch("ts")
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

  @ApiResponse({ status: 200, description: "Returns the current special even data", type: EventDataDto })
  // Events
  @Get("events")
  async getEvents(): Promise<EventData> {
    const data = await this.bot.schemas.getEvent();
    return {
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
    };
  }

  @ApiBody({ type: EventDataDto, description: "The event data to update" })
  @ApiResponse({ status: 200, description: "Returns the updated event data", type: EventDataDto })
  @Patch("events")
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

  @ApiResponse({
    status: 200,
    description: "Returns the daily quests data",
    type: QuestsDTO,
  })
  @Get("quests")
  async getQuests(): Promise<DailyQuestsSchema> {
    const data = await this.bot.schemas.getDailyQuests();
    return data;
  }

  @ApiBody({ type: QuestsDTO, description: "The daily quests data to update" })
  @ApiResponse({
    status: 200,
    description: "Returns the updated daily quests data",
    type: QuestsDTO,
  })
  @Patch("quests")
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
