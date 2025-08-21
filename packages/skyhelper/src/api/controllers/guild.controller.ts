import { Body, Controller, Delete, Get, Param, Patch, Post, Inject } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from "@nestjs/swagger";
import { SkyHelper as BotService } from "@/structures";
import { LiveUpdates as Updates, Reminders } from "../managers/index.js";
import getSettings from "../utils/getSettings.js";
import { GuildInfoSchema, ReminderFeatureSchema, type Features, type GuildInfo, type ReminderFeature } from "../types.js";
import { supportedLang } from "@skyhelperbot/constants";
import { z } from "zod";
import { ZodValidator } from "../pipes/zod-validator.pipe.js";
import { ChannelType, type APITextChannel } from "@discordjs/core";
import { PermissionsUtil } from "@/utils/classes/PermissionUtils";
const GuildIDPredicate = new ZodValidator(
  z.string().regex(/^\d{17,19}$/, "Must be a valid snowflake ID"),
  "Invalid 'guild' Param",
);
const FeaturePredicate = new ZodValidator(z.enum(["live-updates", "reminders"]), "Invalid 'feature' Param");

@ApiTags("Guild Management")
@ApiBearerAuth()
@Controller("/guilds/:guild")
export class GuildController {
  constructor(@Inject("BotClient") private readonly bot: BotService) {}

  @Get()
  @ApiOperation({
    summary: "Get guild information",
    description: "Retrieves detailed information about a Discord guild/server",
  })
  @ApiParam({ name: "guild", description: "Discord guild ID", example: "123456789012345678" })
  @ApiResponse({
    status: 200,
    description: "Guild information retrieved successfully",
    schema: {
      type: "object",
      properties: {
        id: { type: "string", example: "123456789012345678" },
        name: { type: "string", example: "Sky Helper Community" },
        icon: { type: "string", nullable: true },
        prefix: { type: "string", example: "!" },
        language: { type: "string", example: "en-US" },
        announcement_channel: { type: "string" },
        beta: { type: "boolean", example: false },
        enabledFeatures: { type: "array", items: { type: "string" } },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Guild not found",
    schema: {
      type: "string",
      example: "null",
    },
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid authentication" })
  async getGuild(@Param("guild", GuildIDPredicate) guild: string): Promise<GuildInfo | "null"> {
    const data = this.bot.guilds.get(guild);

    if (data == null) return "null";
    const settings = await getSettings(this.bot, guild);
    const actives: Array<keyof Features> = ["reminders", "live-updates"];
    return {
      id: data.id,
      name: data.name,
      icon: data.icon,
      prefix: settings?.prefix,
      language: settings?.language?.value ?? "en-US",
      announcement_channel: settings?.annoucement_channel ?? undefined,
      beta: settings?.beta,
      enabledFeatures: actives,
    };
  }
  @Patch()
  @ApiOperation({
    summary: "Update guild settings",
    description: "Updates guild-specific bot settings like prefix, language, and beta features",
  })
  @ApiParam({ name: "guild", description: "Discord guild ID", example: "123456789012345678" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        prefix: { type: "string", example: "!" },
        announcement_channel: { type: "string" },
        beta: { type: "boolean", example: false },
        language: { type: "string", example: "en-US" },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Guild settings updated successfully",
    schema: {
      type: "object",
      properties: {
        prefix: { type: "string" },
        beta: { type: "boolean" },
        language: { type: "string" },
        announcement_channel: { type: "string" },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Guild not found",
    schema: {
      type: "string",
      example: "null",
    },
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid authentication" })
  @ApiBadRequestResponse({ description: "Invalid request body" })
  async updateGuild(
    @Param("guild", GuildIDPredicate) guild: string,
    @Body(new ZodValidator(GuildInfoSchema)) body: GuildInfo,
  ): Promise<GuildInfo | "null"> {
    const g = this.bot.guilds.get(guild);
    const settings = g && (await this.bot.schemas.getSettings(g));
    if (!settings) return "null";
    settings.prefix = body.prefix ?? "";
    settings.beta = body.beta || false;
    settings.annoucement_channel = body.announcement_channel ?? "";
    const language = supportedLang.find((l) => l.value === body.language);
    settings.language = language;
    await settings.save();
    return {
      prefix: settings.prefix,
      beta: settings.beta,
      language: settings.language?.value ?? "en-US",
      announcement_channel: settings.annoucement_channel ?? undefined,
    };
  }

  @Get("/features/:feature")
  @ApiOperation({
    summary: "Get feature settings",
    description: "Retrieves settings for a specific bot feature (live-updates or reminders)",
  })
  @ApiParam({ name: "guild", description: "Discord guild ID", example: "123456789012345678" })
  @ApiParam({ name: "feature", description: "Feature name", enum: ["live-updates", "reminders"] })
  @ApiResponse({
    status: 200,
    description: "Feature settings retrieved successfully",
    schema: {
      anyOf: [{ $ref: "#/components/schemas/LiveUpdatesDto" }, { $ref: "#/components/schemas/ReminderFeatureDto" }],
    },
  })
  @ApiResponse({
    status: 200,
    description: "Feature not found or guild not found",
    schema: { type: "null" },
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid authentication" })
  async getFeature(
    @Param("guild", GuildIDPredicate) guild: keyof Features,
    @Param("feature", FeaturePredicate) feature: string,
  ): Promise<Features[keyof Features] | null | undefined> {
    let response;
    switch (feature) {
      case "live-updates":
        response = await Updates.get(this.bot, guild);
        break;
      case "reminders":
        response = await Reminders.get(this.bot, guild);
    }
    return response;
  }

  @Post("/features/:feature")
  @ApiOperation({
    summary: "Enable feature",
    description: "Enables a specific bot feature for the guild",
  })
  @ApiParam({ name: "guild", description: "Discord guild ID", example: "123456789012345678" })
  @ApiParam({ name: "feature", description: "Feature name", enum: ["live-updates", "reminders"] })
  @ApiResponse({
    status: 201,
    description: "Feature enabled successfully",
    schema: {
      anyOf: [{ $ref: "#/components/schemas/LiveUpdatesDto" }, { $ref: "#/components/schemas/ReminderFeatureDto" }],
    },
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid authentication" })
  async enableFeature(@Param("guild", GuildIDPredicate) guild: string, @Param("feature", FeaturePredicate) feature: string) {
    let response;
    switch (feature) {
      case "live-updates":
        response = await Updates.post(this.bot, guild);
        break;
      case "reminders":
        response = await Reminders.post(this.bot, guild);
    }
    return response;
  }

  @Patch("/features/:feature")
  @ApiOperation({
    summary: "Update feature settings",
    description: "Updates settings for a specific bot feature",
  })
  @ApiParam({ name: "guild", description: "Discord guild ID", example: "123456789012345678" })
  @ApiParam({ name: "feature", description: "Feature name", enum: ["live-updates", "reminders"] })
  @ApiBody({
    description: "Feature settings to update",
    schema: {
      anyOf: [{ $ref: "#/components/schemas/LiveUpdatesDto" }, { $ref: "#/components/schemas/ReminderFeatureDto" }],
    },
  })
  @ApiResponse({
    status: 200,
    description: "Feature settings updated successfully",
    schema: {
      anyOf: [{ $ref: "#/components/schemas/LiveUpdatesDto" }, { $ref: "#/components/schemas/ReminderFeatureDto" }],
    },
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid authentication" })
  @ApiBadRequestResponse({ description: "Invalid request body" })
  async updateFeature(
    @Param("guild", GuildIDPredicate) guild: string,
    @Param("feature", FeaturePredicate) feature: string,
    @Body(
      new ZodValidator(
        z.union([ReminderFeatureSchema, z.object({ times: z.string().nullable(), shards: z.string().nullable() })]),
      ) as any,
    )
    body: Partial<Features[keyof Features]>,
  ) {
    let response;
    switch (feature) {
      case "live-updates":
        response = await Updates.patch(this.bot, guild, body);
        break;
      case "reminders":
        response = await Reminders.patch(this.bot, guild, body as ReminderFeature);
        break;
    }
    return response;
  }

  @Delete("/features/:feature")
  @ApiOperation({
    summary: "Disable feature",
    description: "Disables a specific bot feature for the guild",
  })
  @ApiParam({ name: "guild", description: "Discord guild ID", example: "123456789012345678" })
  @ApiParam({ name: "feature", description: "Feature name", enum: ["live-updates", "reminders"] })
  @ApiResponse({
    status: 200,
    description: "Feature disabled successfully",
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid authentication" })
  async disableFeature(
    @Param("guild", GuildIDPredicate) guild: string,
    @Param("feature", FeaturePredicate) feature: keyof Features,
  ) {
    let response;
    switch (feature) {
      case "live-updates":
        response = await Updates.delete(this.bot, guild);
        break;
      case "reminders":
        response = await Reminders.delete(this.bot, guild);
    }
    return response;
  }

  @Get("/channels")
  @ApiOperation({
    summary: "Get guild channels",
    description: "Retrieves list of text channels where the bot has manage webhooks permission",
  })
  @ApiParam({ name: "guild", description: "Discord guild ID", example: "123456789012345678" })
  @ApiResponse({
    status: 200,
    description: "Channels retrieved successfully",
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          type: { type: "number" },
          position: { type: "number" },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Guild not found",
    schema: { type: "null" },
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid authentication" })
  async getChannels(@Param("guild", GuildIDPredicate) guild: string) {
    const g = this.bot.guilds.get(guild);
    const channels = g?.channels;
    if (!g || channels == null) return null;
    const member = g.clientMember;
    const memberPerm = (ch: APITextChannel) => PermissionsUtil.overwriteFor(member, ch, this.bot);
    return [
      ...channels
        .filter((ch) => ch?.type === ChannelType.GuildText && memberPerm(ch).has(["ViewChannel", "ManageWebhooks"]))
        .values(),
    ];
  }

  @Get("/roles")
  @ApiOperation({
    summary: "Get guild roles",
    description: "Retrieves list of non-managed roles in the guild",
  })
  @ApiParam({ name: "guild", description: "Discord guild ID", example: "123456789012345678" })
  @ApiResponse({
    status: 200,
    description: "Roles retrieved successfully",
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          color: { type: "number" },
          position: { type: "number" },
          permissions: { type: "string" },
          managed: { type: "boolean" },
          mentionable: { type: "boolean" },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Guild not found",
    schema: { type: "null" },
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid authentication" })
  async getRoles(@Param("guild", GuildIDPredicate) guild: string) {
    const roles = this.bot.guilds.get(guild)?.roles;
    if (roles == null) return null;

    return roles.filter((r) => !r.managed);
  }
}
