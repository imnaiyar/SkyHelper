import { Body, Controller, Get, Inject, Patch } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from "@nestjs/swagger";
import { SkyHelper as BotService } from "@/structures";
import type { DailyQuestsSchema } from "@/types/schemas";
import { ZodValidator } from "../pipes/zod-validator.pipe.js";
import { toJSONSchema, z } from "zod/v4";

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

@ApiTags("Event Management")
@ApiBearerAuth()
@Controller("/update")
export class UpdateController {
  constructor(@Inject("BotClient") private readonly bot: BotService) {}

  @Get("quests")
  @ApiOperation({
    summary: "Get daily quests data",
    description: "Retrieves current daily quests information",
  })
  @ApiResponse({
    status: 200,
    description: "Daily quests data retrieved successfully",
    schema: toJSONSchema(QuestsSchema),
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
    schema: toJSONSchema(QuestsSchema),
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
