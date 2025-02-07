import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Inject } from "@nestjs/common";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
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

@Controller("/guilds/:guild")
export class GuildController {
  constructor(@Inject("BotClient") private readonly bot: BotService) {}

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

  @Get("/roles")
  async getRoles(@Param("guild", GuildIDPredicate) guild: string) {
    const roles = this.bot.guilds.get(guild)?.roles;
    if (roles == null) return null;

    return roles.filter((r) => !r.managed);
  }
}
