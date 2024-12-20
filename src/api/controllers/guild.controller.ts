import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Inject } from "@nestjs/common";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { SkyHelper as BotService } from "#structures";
import { LiveTimes as Times, LiveShard as Shard, Reminders } from "../managers/index.js";
import { ChannelType } from "discord.js";
import getSettings from "../utils/getSettings.js";
import { GuildInfoSchema, ReminderFeatureSchema, type Features, type GuildInfo } from "../types.js";
import { supportedLang } from "#bot/libs/constants/supportedLang";
import { z } from "zod";
import { ZodValidator } from "../pipes/zod-validator.pipe.js";
const GuildIDPredicate = new ZodValidator(
  z.string().regex(/^\d{17,19}$/, "Must be a valid snowflake ID"),
  "Invalid 'guild' Param",
);
const FeaturePredicate = new ZodValidator(z.enum(["shards-live", "times-live", "reminders"]), "Invalid 'feature' Param");

@Controller("/guilds/:guild")
export class GuildController {
  // eslint-disable-next-line
  constructor(@Inject("BotClient") private readonly bot: BotService) {}

  @Get()
  async getGuild(@Param("guild", GuildIDPredicate) guild: string): Promise<GuildInfo | "null"> {
    const data = this.bot.guilds.cache.get(guild);

    if (data == null) return "null";
    const settings = await getSettings(this.bot, guild);
    const actives: Array<keyof Features> = [];
    if (settings?.reminders.active) actives.push("reminders");
    if (settings?.autoTimes.active) actives.push("times-live");
    if (settings?.autoShard.active) actives.push("shards-live");
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
    const g = this.bot.guilds.cache.get(guild);
    const settings = g && (await this.bot.database.getSettings(g));
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
    @Param("guild", GuildIDPredicate) guild: string,
    @Param("feature", FeaturePredicate) feature: string,
  ): Promise<Features[keyof Features] | null | undefined> {
    let response;
    switch (feature) {
      case "times-live":
        response = await Times.get(this.bot, guild);
        break;
      case "shards-live":
        response = await Shard.get(this.bot, guild);
        break;
      case "reminders":
        response = await Reminders.get(this.bot, guild);
    }
    return response;
  }

  @Post("/features/:feature")
  async enableFeature(
    @Req() req: AuthRequest,
    @Param("guild", GuildIDPredicate) guild: string,
    @Param("feature", FeaturePredicate) feature: string,
  ) {
    await this.bot.checkPermissions(req.session, guild);
    let response;
    switch (feature) {
      case "times-live":
        response = await Times.post(this.bot, guild);
        break;
      case "shards-live":
        response = await Shard.post(this.bot, guild);
        break;
      case "reminders":
        response = await Reminders.post(this.bot, guild);
    }
    return response;
  }

  @Patch("/features/:feature")
  async updateFeature(
    @Req() req: AuthRequest,
    @Param("guild", GuildIDPredicate) guild: string,
    @Param("feature", FeaturePredicate) feature: string,
    @Body(new ZodValidator(z.union([ReminderFeatureSchema, z.object({ channel: z.string().optional() })])))
    body: Partial<Features[keyof Features]>,
  ) {
    await this.bot.checkPermissions(req.session, guild);
    let response;
    switch (feature) {
      case "times-live":
        response = await Times.patch(this.bot, guild, body);
        break;
      case "shards-live":
        response = await Shard.patch(this.bot, guild, body);
        break;
      case "reminders":
        response = await Reminders.patch(this.bot, guild, body);
        break;
    }
    return response;
  }

  @Delete("/features/:feature")
  async disableFeature(
    @Param("guild", GuildIDPredicate) guild: string,
    @Param("feature", FeaturePredicate) feature: string,
    @Req() req: AuthRequest,
  ) {
    await this.bot.checkPermissions(req.session, guild);
    let response;
    switch (feature) {
      case "times-live":
        response = await Times.delete(this.bot, guild);
        break;
      case "shards-live":
        response = await Shard.delete(this.bot, guild);
        break;
      case "reminders":
        response = await Reminders.delete(this.bot, guild);
    }
    return response;
  }

  @Get("/channels")
  async getChannels(@Param("guild", GuildIDPredicate) guild: string) {
    const g = this.bot.guilds.cache.get(guild);
    const channels = await g?.channels.fetch();
    if (!g || channels == null) return null;
    const member = await g?.members.fetchMe();
    return [
      ...channels
        .filter((ch) => ch?.type === ChannelType.GuildText && member.permissionsIn(ch).has(["ViewChannel", "ManageWebhooks"]))
        .values(),
    ];
  }

  @Get("/roles")
  async getRoles(@Param("guild", GuildIDPredicate) guild: string) {
    const roles = await this.bot.guilds.cache.get(guild)?.roles.fetch();
    if (roles == null) return null;

    return [...roles.values()];
  }
}
