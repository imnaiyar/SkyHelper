import type { SkyHelper as BotService } from "@/structures";
import { Body, Controller, Inject, Post, Res } from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";
import { type APIEmbed, MessageFlags, ApplicationWebhookEventType, type APIWebhookEvent } from "@discordjs/core";
import type { Response } from "express";
import BlackList from "@/schemas/BlackList";

// Handles webhook events from discord
@Controller("/webhook-event")
@ApiExcludeController() // Exclude this from public docs, only meant for discord
export class WebhookEventController {
  constructor(@Inject("BotClient") private readonly bot: BotService) {}

  @Post()
  async handleWebhookEvent(@Body() body: APIWebhookEvent, @Res() res: Response) {
    res.status(204).send();
    // Ideally only this application authrization event will be sent as it's the only one that's subscribed, but return still for safety
    if (
      body.event.type !== ApplicationWebhookEventType.ApplicationAuthorized &&
      body.event.type !== ApplicationWebhookEventType.ApplicationDeauthorized
    ) {
      return;
    }
    if (!body.event.data) return;
    const data = body.event.data;
    const { user } = data;
    const webhook = process.env.GUILD ? this.bot.utils.parseWebhookURL(process.env.GUILD) : undefined;
    if ("guild" in data && data.guild) this._checkBlacklisted(data.guild.id, user.id);
    const isDeauthorized = body.event.type === ApplicationWebhookEventType.ApplicationDeauthorized;
    if (!webhook) return;

    let description = `User ${user.username} - ${user.global_name} (\`${user.id}\`) has ${isDeauthorized ? "deauthorized" : "authorized"} the application`;
    const type =
      "integration_type" in data
        ? data.integration_type /* 0 will be false anyway, so no need to check explicitly */
          ? "UserInstall"
          : "GuildInstall"
        : "Oauth2";
    description += `\n\n**Type:** \`${isDeauthorized ? "Deauthorized" : type}\``;
    if ("scopes" in data && data.scopes) {
      description += `\n**Scopes:** ${data.scopes.map((sc) => `\`${sc}\``).join(" ")}`;
    }
    if ("guild" in data && data.guild) {
      description += `\n**Guild:** ${data.guild.name} (\`${data.guild.id}\`)`;
    }
    if (isDeauthorized || ("integration_type" in data && data.integration_type)) {
      const appl = await this.bot.api.applications.getCurrent();
      description += `\nTotal Authorized: ${appl.approximate_user_install_count}`;
    }
    const embed: APIEmbed = {
      title: "Application Authorized",
      description,
      color: 0x00ff00,
      timestamp: new Date(body.event.timestamp).toISOString(),
      author: {
        name: "User " + (isDeauthorized ? "Deauthorized" : "Install"),
        icon_url: user.avatar
          ? this.bot.rest.cdn.avatar(user.id, user.avatar)
          : this.bot.rest.cdn.defaultAvatar(Number(BigInt(user.id) >> 22n) % 6),
      },
      footer: {
        text: user.id,
      },
      ...(user.banner && { image: { url: this.bot.rest.cdn.banner(user.id, user.banner) } }),
    };
    await this.bot.api.webhooks.execute(webhook.id, webhook.token, {
      embeds: [embed],
      username: type,
      avatar_url: this.bot.utils.getUserAvatar(this.bot.user),
    });

    return;
  }

  private async _checkBlacklisted(guildId: string, inviterId: string): Promise<void> {
    const guild = this.bot.guilds.get(guildId);
    if (!guild) return;
    const blacklisted = await BlackList.findByIdAndUpdate(guild.id).catch(() => null);
    if (!blacklisted) return;
    const channel = await this.bot.api.users.createDM(inviterId);
    await this.bot.api.channels
      .createMessage(channel.id, {
        content: `You attempted to invite me to a blacklisted server, the server ${guild.name} is blacklisted from inviting me for the reason \`${blacklisted.reason ?? "No reason provided"}\`. For that, I've left the server. If you think this is a mistake, you can appeal by joining our support server [here](${this.bot.config.Support}).`,
      })
      .catch(() => {});
    await this.bot.api.users.leaveGuild(guild.id).catch(() => {});
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
          value: blacklisted.reason ?? "No reason provided",
        },
        {
          name: "Blacklisted Date",
          value: `${blacklisted.Date ?? "Unknown"}`,
        },
      ],
    };
    const webhook = process.env.GUILD ? this.bot.utils.parseWebhookURL(process.env.GUILD) : undefined;
    if (!webhook) return;
    await this.bot.api.webhooks.execute(webhook.id, webhook.token, {
      username: "Blacklist Server",
      avatar_url: this.bot.utils.getUserAvatar(this.bot.user),
      embeds: [embed],
      flags: MessageFlags.SuppressEmbeds,
    });
  }
}
