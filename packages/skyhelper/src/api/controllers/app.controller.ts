import { Controller, Get, Query, Inject } from "@nestjs/common";
import { ZodValidator } from "../pipes/zod-validator.pipe.js";
import { DateTime } from "luxon";
import { getTimesEmbed, buildShardEmbed } from "@/utils/classes/Embeds";
import { getTranslator } from "@/i18n";
import type { SkyHelper } from "@/structures";
import { ApiQuery } from "@nestjs/swagger";
import { GetShardsParamsDto, GetTimesParamsDto } from "../types.dto.js";
import { GetShardsParams, GetTimesParams } from "../types.js";
import type { z } from "zod";

@Controller()
export class AppController {
  constructor(@Inject("BotClient") private readonly bot: SkyHelper) {}
  @Get()
  getHello(): string {
    return "Hello World!";
  }

  @ApiQuery({ type: GetShardsParamsDto })
  @Get("shards-embed")
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
  @ApiQuery({ type: GetTimesParamsDto })
  @Get("times-embed")
  async getTimesEmbed(@Query(new ZodValidator(GetTimesParams)) query: z.infer<typeof GetTimesParams>) {
    const { locale } = query;

    return getTimesEmbed(this.bot, getTranslator(locale ?? "en-US"));
  }
}
