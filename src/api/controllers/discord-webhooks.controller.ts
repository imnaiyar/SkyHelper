import type { SkyHelper as BotService } from "#bot/structures/SkyHelper";
import { Body, Controller, HttpCode, Inject, Post, Req, Res } from "@nestjs/common";
import { type APIEmbed, type APIGuild, type APIUser, ApplicationIntegrationType, WebhookClient } from "discord.js";
import type { Response } from "express";
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
  async handleWebhookEvent(@Body() body: WebhookPayload, @Res() res: Response) {
    res.status(204).send();
    // Ideally only this application authrization event will be sent as it's the only one that's subscribed, but return still for safety
    if (body.event.type !== "APPLICATION_AUTHORIZED") return;
    if (!body.event.data) return;
    const data = body.event.data;
    const { user } = data;
    const webhook = process.env.GUILD ? new WebhookClient({ url: process.env.GUILD }) : undefined;
    if (!webhook) return;

    // TODO: Add a check for banned guilds here, as authorizing user is included in the payload so it's easier to inform

    let description = `User ${user.username} - ${user.global_name} (\`${user.id}\`) has authorized the application`;
    description += `\n\n**Type:** \`${
      "integration_type" in data
        ? data.integration_type /* 0 will be false anyway, so no need to check explicitly */
          ? "UserInstall"
          : "GuildInstall"
        : "Oauth2"
    }\``;
    description += `\n**Scopes:** \`${data.scopes}\``;
    if (data.guild) {
      description += `\n**Guild:** ${data.guild.name} (\`${data.guild.id}\`)`;
    }
    const embed: APIEmbed = {
      title: "Application Authorized",
      description,
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
