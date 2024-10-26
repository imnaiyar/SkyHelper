import type { SkyHelper as BotService } from "#bot/structures/SkyHelper";
import { Body, Controller, Inject, Post, Req } from "@nestjs/common";
import { type APIEmbed, type APIGuild, type APIUser, ApplicationIntegrationType, WebhookClient } from "discord.js";
enum WebhookTypes {
  PING,
  EVENT,
}
interface ApplicationAuthorizedEventPaylaod {
  integration_type?: ApplicationIntegrationType;
  user: APIUser;
  scopes: string[];
  guild?: APIGuild;
}
type WebhookEvent = {
  type: "APPLICATION_AUTHORIZED";
  timestamp: string;
  data?: ApplicationAuthorizedEventPaylaod;
};
type WebhookPayload = {
  version: number;
  application_id: string;
  type: WebhookTypes;
  event: WebhookEvent;
};
// Handles webhook events from discord
@Controller("/webhook-event")
export class WebhookEventController {
  constructor(@Inject("BotClient") private readonly bot: BotService) {}

  @Post()
  async handleWebhookEvent(@Body() body: WebhookPayload) {
    if (body.event.type !== "APPLICATION_AUTHORIZED") return;
    if (!body.event.data) return;
    const data = body.event.data;
    if (!data.integration_type) return;
    if (data.integration_type !== ApplicationIntegrationType.UserInstall) return;
    const { user } = data;
    const webhook = process.env.GUILD ? new WebhookClient({ url: process.env.GUILD }) : undefined;
    if (!webhook) return;
    const embed: APIEmbed = {
      title: "Application Authorized",
      description: `User ${user.username} - ${user.global_name} (\`${user.id}\`) has authorized the application`,
      color: 0x00ff00,
      timestamp: new Date(body.event.timestamp).toISOString(),
      author: {
        name: "User Authorized",
        icon_url: user.avatar
          ? this.bot.rest.cdn.avatar(user.id, user.avatar)
          : this.bot.rest.cdn.defaultAvatar(Number(BigInt(user.id) >> 22n) % 6),
      },
      footer: {
        text: user.id,
      },
      ...(user.banner && { image: { url: this.bot.rest.cdn.banner(user.id, user.banner) } }),
    };
    webhook.send({
      embeds: [embed],
      username: "User Install",
      avatarURL: this.bot.user.displayAvatarURL(),
    });
    return;
  }
}
