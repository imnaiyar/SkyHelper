import { Body, Controller, Delete, Get, Param, Patch, Post, Inject } from "@nestjs/common";
import { SkyHelper as BotService } from "@/structures";
import { LiveUpdates as Updates, Reminders } from "../managers/index.js";
import getSettings from "../utils/getSettings.js";
import { GuildInfoSchema, ReminderFeatureSchema, type Features, type GuildInfo, type ReminderFeature } from "../types.js";
import { supportedLang } from "@skyhelperbot/constants";
import { z } from "zod";
import { ZodValidator } from "../pipes/zod-validator.pipe.js";
import { ChannelType, type APITextChannel } from "@discordjs/core";
import { PermissionsUtil } from "@/utils/classes/PermissionUtils";
import { ApiBearerAuth, ApiBody, ApiParam, ApiResponse, getSchemaPath } from "@nestjs/swagger";
import { GuildInfoDto, ReminderFeatureDto } from "../types.dto.js";
const GuildIDPredicate = new ZodValidator(
  z.string().regex(/^\d{17,19}$/, "Must be a valid snowflake ID"),
  "Invalid 'guild' Param",
);

const GuilID = (name: string) => ApiParam({ name, type: String, description: "The ID of the guild", required: true });

const FeaturePredicate = new ZodValidator(z.enum(["live-updates", "reminders"]), "Invalid 'feature' Param");

@ApiBearerAuth("auth-token")
@Controller("/guilds/:guild")
export class GuildController {
  constructor(@Inject("BotClient") private readonly bot: BotService) {}

  @GuilID("guild")
  @ApiResponse({ type: GuildInfoDto, description: "The basic guild info" })
  @Get()
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
  @GuilID("guild")
  @ApiBody({ type: GuildInfoDto, description: "The basic guild info" })
  @ApiResponse({
    schema: {
      oneOf: [
        { $ref: getSchemaPath(GuildInfoDto), description: "The update response" },
        { type: "string", example: "null", description: "Guild not found" },
      ],
    },
  })
  @GuilID("guild")
  @ApiBody({ type: GuildInfoDto, description: "The updated guild info" })
  @ApiResponse({ schema: { oneOf: [{ $ref: getSchemaPath(GuildInfoDto) }, { type: "string", example: "null" }] } })
  @Patch()
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

  @GuilID("guild")
  @ApiParam({ name: "feature", enum: ["live-updates", "reminders"] })
  @ApiResponse({
    status: 200,
    description: "Returns the feature data if enabled, otherwise returns null or undefined",
    type: Object,
  })
  @Get("/features/:feature")
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

  @GuilID("guild")
  @ApiParam({ name: "feature", enum: ["live-updates", "reminders"] })
  @ApiResponse({
    schema: {
      oneOf: [
        { type: "string", example: "Success" },
        { type: "string", example: "null" },
      ],
    },
  })
  @Post("/features/:feature")
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

  @ApiParam({ name: "feature", enum: ["live-updates", "reminders"] })
  @ApiResponse({
    schema: {
      oneOf: [
        { $ref: getSchemaPath(ReminderFeatureDto) },
        { type: "object", properties: { times: { type: "string", nullable: true }, shards: { type: "string", nullable: true } } },
        { type: "string", example: "null" },
      ],
    },
    description: "Returns the updated feature data or null if not found",
  })
  @GuilID("guild")
  @Patch("/features/:feature")
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

  @GuilID("guild")
  @ApiParam({ name: "feature", enum: ["live-updates", "reminders"] })
  @ApiResponse({
    schema: {
      oneOf: [
        { type: "string", example: "Success" },
        { type: "string", example: "null" },
      ],
    },
    description: "Returns success status or null if feature deletion failed",
  })
  @Delete("/features/:feature")
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

  @GuilID("guild")
  @ApiResponse({
    schema: {
      oneOf: [
        {
          type: "array",
          description: "Array containing APITextChannel that bot has MangeWebhooks perms in",
        },
        { type: "null" },
      ],
    },
    description: "Returns an array of guild text channels where the bot has appropriate permissions, or null if guild not found",
  })
  @Get("/channels")
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

  @GuilID("guild")
  @ApiResponse({
    schema: {
      oneOf: [
        {
          type: "array",
          description: "Array containing non-managed guild roles",
        },
        { type: "null" },
      ],
    },
    description: "Returns an array of non-managed guild roles, or null if guild not found",
  })
  @Get("/roles")
  async getRoles(@Param("guild", GuildIDPredicate) guild: string) {
    const roles = this.bot.guilds.get(guild)?.roles;
    if (roles == null) return null;

    return roles.filter((r) => !r.managed);
  }
}
