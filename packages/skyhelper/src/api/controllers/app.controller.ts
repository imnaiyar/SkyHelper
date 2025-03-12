import { Controller, Get, Query, Inject } from "@nestjs/common";
import { z } from "zod";
import { ZodValidator } from "../pipes/zod-validator.pipe.js";
import { DateTime } from "luxon";
import { getTimesEmbed, buildShardEmbed } from "@/utils/classes/Embeds";
import { getTranslator } from "@/i18n";
import type { SkyHelper } from "@/structures";
import { supportedLang } from "@skyhelperbot/constants";
const GetShardsParams = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in the format 'YYYY-MM-DD'")
    .optional(),
  noBtn: z.boolean().optional(),
  user: z.string().optional(),
  locale: z.enum(supportedLang.map((v) => v.value) as [string, ...string[]]).optional(),
});
const GetTimesParams = z.object({
  locale: z.enum(supportedLang.map((v) => v.value) as [string, ...string[]]).optional(),
});
@Controller()
export class AppController {
  constructor(@Inject("BotClient") private readonly bot: SkyHelper) {}
  @Get()
  getHello(): string {
    return "Hello World!";
  }

  // Following are for getting scheduled jobs functions
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
    return buildShardEmbed(shardDate, getTranslator(locale ?? "en-US"), noBtn, user);
  }

  @Get("times-embed")
  async getTimesEmbed(@Query(new ZodValidator(GetTimesParams)) query: z.infer<typeof GetTimesParams>) {
    const { locale } = query;
    return getTimesEmbed(this.bot, getTranslator(locale ?? "en-US"));
  }
}
