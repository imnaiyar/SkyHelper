import { Body, Controller, Get, HttpException, HttpStatus, Inject, Patch, Req } from "@nestjs/common";
import { SkyHelper as BotService } from "#structures";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { EventDataSchema, TSDataSchema, type EventData, type TSData } from "../types.js";
import { formatDate, parseDate } from "../utils/formatDate.js";
import type { DailyQuestsSchema } from "#bot/database/index";
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

@Controller("/update")
export class UpdateController {
  constructor(@Inject("BotClient") private readonly bot: BotService) {}

  // TS
  @Get("ts")
  async getTS(): Promise<TSData> {
    const data = await this.bot.getTS();
    return {
      spirit: data.value,
      visitDate: parseDate(data.visitDate).toISOString(),
      index: data.index.toString(),
    };
  }
  @Patch("ts")
  async updateTS(@Req() req: AuthRequest, @Body(new ZodValidator(TSDataSchema)) body: TSData): Promise<TSData> {
    await this.bot.checkAdmin(req.session);
    const data = await this.bot.getTS();
    const spirit = this.bot.spiritsData[body.spirit];
    if (!spirit) throw new HttpException(`No spirit found for the given value "${body.spirit}"`, HttpStatus.NOT_FOUND);
    const values = {
      name: spirit.name,
      value: body.spirit,
      index: parseInt(body.index),
      visitDate: formatDate(new Date(body.visitDate)),
    };
    Object.assign(data, values);
    await data.save();
    return body;
  }

  // Events
  @Get("events")
  async getEvents(): Promise<EventData> {
    const data = await this.bot.getEvent();
    return {
      name: data.name,
      startDate: parseDate(data.startDate).toISOString(),
      endDate: parseDate(data.endDate).toISOString(),
    };
  }

  @Patch("events")
  async updateEvent(@Req() req: AuthRequest, @Body(new ZodValidator(EventDataSchema)) body: EventData): Promise<EventData> {
    await this.bot.checkAdmin(req.session);
    const data = await this.bot.getEvent();
    const values = {
      name: body.name,
      startDate: formatDate(new Date(body.startDate)),
      endDate: formatDate(new Date(body.endDate)),
    };
    Object.assign(data, values);
    await data.save();
    return body;
  }

  @Get("quests")
  async getQuests(): Promise<DailyQuestsSchema> {
    const data = await this.bot.database.getDailyQuests();
    return data;
  }

  @Patch("quests")
  async patchQuests(
    @Req() req: AuthRequest,
    @Body(new ZodValidator(QuestsSchema)) body: z.infer<typeof QuestsSchema>,
  ): Promise<DailyQuestsSchema> {
    await this.bot.checkAdmin(req.session);
    const questSettings = await this.bot.database.getDailyQuests();
    questSettings.quests = body.quests;
    questSettings.rotating_candles = body.rotating_candles;
    questSettings.seasonal_candles = body.seasonal_candles;
    questSettings.last_message = body.last_message;
    questSettings.last_updated = body.last_updated;
    await questSettings.save();
    return questSettings;
  }
}
