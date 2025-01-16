import type { SkyHelper as BotService } from "#bot/structures/SkyHelper";
import { Body, Controller, Inject, Post, Res } from "@nestjs/common";
import { type APIEmbed, type APIGuild, type APIUser, ApplicationIntegrationType, MessageFlags, WebhookClient } from "discord.js";
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

    let description = `User ${user.username} - ${user.global_name} (\`${user.id}\`) has authorized the application`;
    description += `\n\n**Type:** \`${
      "integration_type" in data
        ? data.integration_type /* 0 will be false anyway, so no need to check explicitly */
          ? "UserInstall"
          : "GuildInstall"
        : "Oauth2"
    }\``;
    description += `\n**Scopes:** ${data.scopes.map((sc) => `\`${sc}\``).join(" ")}`;
    if (data.guild) {
      description += `\n**Guild:** ${data.guild.name} (\`${data.guild.id}\`)`;
    }
    if (data.integration_type) {
      const appl = await this.bot.application.fetch();
      description += `\nTotal Authorized: ${appl.approximateUserInstallCount}`;
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
    if (data.guild) this._checkBlacklisted(data.guild.id, user.id);

    return;
  }

  private async _checkBlacklisted(guildId: string, inviterId: string): Promise<void> {
    const guild = this.bot.guilds.cache.get(guildId);
    if (!guild) return;
    const blacklisted = await this.bot.database.guildBlackList.findOne({ Guild: guild.id }).catch(() => null);
    if (!blacklisted) return;
    await this.bot.users
      .send(
        inviterId,
        `You attempted to invite me to a blacklisted server, the server ${guild.name} is blacklisted from inviting me for the reason \`${blacklisted.Reason || "No reason provided"}\`. For that, I've left the server. If you think this is a mistake, you can appeal by joining our support server [here](${this.bot.config.Support}).`,
      )
      .catch(() => {});
    await guild.leave();
    const embed: APIEmbed = {
      author: { name: "Blacklisted Server" },
      description: "Someone tried to invite me to a blacklisted server.",
      fields: [
        {
          name: "Blacklisted Guild Name",
          value: guild.name + " " + `(${guild.id})`,
        },
        {
          name: "Reason",
          value: blacklisted.Reason || "No reason provided",
        },
        {
          name: "Blacklisted Date",
          value: `${blacklisted.Date || "Unknown"}`,
        },
      ],
    };
    const webhook = process.env.GUILD ? new WebhookClient({ url: process.env.GUILD }) : undefined;
    if (!webhook) return;
    webhook.send({
      username: "Blacklist Server",
      avatarURL: this.bot.user.displayAvatarURL(),
      embeds: [embed],
      flags: MessageFlags.SuppressEmbeds,
    });
  }
}
