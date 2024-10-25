import type { SkyHelper as BotService } from "#bot/structures/SkyHelper";
import { Body, Controller, Inject, Post, Req } from "@nestjs/common";
import { type APIGuild, type APIUser, ApplicationIntegrationType, WebhookClient } from "discord.js";
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
    webhook.send({
      content: `User ${user.username} - ${user.global_name} (\`${user.id}\`) has authorized the application`,
    });
    return;
  }
}
