import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req,
    Inject
} from "@nestjs/common";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { SkyHelper as BotService } from "#structures";
import {
    LiveTimes as Times,
    LiveShard as Shard,
    Reminders
} from "../managers/index.js";
import { ChannelType } from "discord.js";
import getSettings from "../utils/getSettings.js";
@Controller("/guilds/:guild")
export class GuildController {
    constructor(@Inject("BotClient") private readonly bot: BotService) {}

    @Get()
    async getGuild(@Param("guild") guild: string): Promise<any> {
        const data = this.bot.guilds.cache.get(guild);

        if (data == null) return "null";
        const settings = await getSettings(this.bot, guild);
        const actives = [];
        if (settings?.reminders.active) actives.push("reminders");
        if (settings?.autoShard.active) actives.push("times-live");
        if (settings?.autoTimes.active) actives.push("shards-live");
        return {
            id: data.id,
            name: data.name,
            icon: data.icon,
            enabledFeatures: actives
        };
    }

    @Get("/features/:feature")
    async getFeature(
        @Param("guild") guild: string,
        @Param("feature") feature: string
    ) {
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
        @Param("guild") guild: string,
        @Param("feature") feature: string
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
        @Param("guild") guild: string,
        @Param("feature") feature: string,
        @Body() body: Partial<any>
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
        @Param("guild") guild: string,
        @Param("feature") feature: string,
        @Req() req: AuthRequest
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
    async getChannels(@Param("guild") guild: string) {
        const g = this.bot.guilds.cache.get(guild);
        const channels = await g?.channels.fetch();
        if (!g || channels == null) return null;
        const member = await g?.members.fetchMe();
        return [
            ...channels
                .filter(
                    ch =>
                        ch?.type === ChannelType.GuildText &&
                        member
                            .permissionsIn(ch)
                            .has(["ViewChannel", "ManageWebhooks"])
                )
                .values()
        ];
    }

    @Get("/roles")
    async getRoles(@Param("guild") guild: string) {
        const roles = await this.bot.guilds.cache.get(guild)?.roles.fetch();
        if (roles == null) return null;

        return [...roles.values()];
    }
}
