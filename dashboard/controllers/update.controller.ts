import { Body, Controller, Get, HttpException, HttpStatus, Inject, Patch, Req } from "@nestjs/common";
import { SkyHelper as BotService } from "#structures";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import type { EventData, TSData } from "../types.js";
import { formatDate, parseDate } from "../utils/formatDate.js";
import { DailyQuestsSchema } from "#src/database/index";
@Controller("/update")
export class UpdateController {
  // @ts-ignore
  // eslint-disable-next-line
  constructor(@Inject("BotClient") private readonly bot: BotService) {}

  // TS
  @Get("ts")
  async getTS(): Promise<TSData> {
    const data = await this.bot.getTS();
    return {
      spirit: data.value,
      visitDate: parseDate(data.visitDate).toISOString(),
      spiritImage: data.spiritImage,
      index: data.index.toString(),
    };
  }
  @Patch("ts")
  async updateTS(@Req() req: AuthRequest, @Body() body: TSData): Promise<TSData> {
    await this.bot.checkAdmin(req.session);
    const data = await this.bot.getTS();
    const spirit = this.bot.spiritsData[body.spirit];
    if (!spirit) throw new HttpException(`No spirit found for the given value "${body.spirit}"`, HttpStatus.NOT_FOUND);
    const values = {
      name: spirit.name,
      value: body.spirit,
      spiritImage: body.spiritImage,
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
  async updateEvent(@Req() req: AuthRequest, @Body() body: EventData): Promise<EventData> {
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
  // TODO
  @Get("quests")
  async getQuests(): Promise<DailyQuestsSchema> {
    const data = await this.bot.database.getDailyQuests();
    return data;
  }
}
