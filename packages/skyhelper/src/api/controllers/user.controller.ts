import { Body, Controller, Get, HttpException, HttpStatus, Inject, Param, Patch, Req } from "@nestjs/common";
import { SkyHelper as BotService } from "@/structures";
import type { UserInfo } from "../types.js";
import { supportedLang } from "@skyhelperbot/constants";
import { ZodValidator } from "../pipes/zod-validator.pipe.js";
import { z } from "zod";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { Routes } from "@discordjs/core";
const RoleMetadataKeySchema = z.object({
  username: z.string().optional(),
  metadata: z
    .object({
      wings: z.number().max(240).min(1).optional(),
      since: z.string().optional(),
      eden: z.boolean().optional(),
      cr: z.boolean().optional(),
      hangout: z.boolean().optional(),
    })
    .optional(),
});

type RoleMetadataKey = z.infer<typeof RoleMetadataKeySchema>;

const UserIDPredicate = new ZodValidator(z.string().regex(/^\d{17,19}$/, "Must be a valid snowflake ID"), "Invalid 'user' Param");
@Controller("/users")
export class UsersController {
  // eslint-disable-next-line
  constructor(@Inject("BotClient") private readonly bot: BotService) {}

  @Get(":user")
  async getUser(@Param("user", UserIDPredicate) userId: string): Promise<UserInfo> {
    const user = await this.bot.api.users.get(userId).catch(() => null);
    if (!user) return { language: "en-US" };
    const user_settings = await this.bot.schemas.getUser(user);
    return {
      language: user_settings.language?.value || "en-US",
    };
  }

  @Patch(":user")
  async updateUser(
    @Param("user", UserIDPredicate) userId: string,
    @Body(new ZodValidator(z.object({ language: z.string().optional() }))) data: UserInfo,
  ): Promise<UserInfo> {
    const user = await this.bot.api.users.get(userId).catch(() => null);
    if (!user) return { language: "en-US" };
    const user_settings = await this.bot.schemas.getUser(user);
    const language = supportedLang.find((l) => l.value === data.language);
    user_settings.language = language;
    await user_settings.save();
    return {
      language: data.language,
    };
  }

  /**
   * Update user role connection metadata
   */
  @Patch(":user/linked-role")
  async updateUserRoleMetadata(
    @Param("user", UserIDPredicate) userId: string,
    @Body(new ZodValidator(RoleMetadataKeySchema)) data: RoleMetadataKey,
    @Req() req: AuthRequest,
  ) {
    const user = await this.bot.api.users.get(userId).catch(() => null);
    if (!user) throw new HttpException("User not founde", HttpStatus.NOT_FOUND);
    const userData = await this.bot.schemas.getUser(user);

    const body = JSON.stringify({
      platform_name: "Sky:CoTL Profile",
      platform_username: data.username,
      metadata: {
        wings: data.metadata?.wings,
        since: data.metadata?.since,
        cr: data.metadata?.cr ? "1" : "0",
        eden: data.metadata?.eden ? "1" : "0",
        hangout: data.metadata?.hangout ? "1" : "0",
      },
    });
    await fetch(`https://discord.com/api/v10` + Routes.userApplicationRoleConnection(this.bot.user.id), {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${req.session.access_token}`,
        "Content-Type": "application/json",
      },
      body,
    });
    userData.linkedRole = data;
    await userData.save();
    return data;
  }

  @Get(":user/linked-role")
  async getUserRoleMetadata(@Req() req: AuthRequest): Promise<RoleMetadataKey> {
    const b = await fetch(`https://discord.com/api/v10` + Routes.userApplicationRoleConnection(this.bot.user.id), {
      headers: {
        Authorization: `Bearer ${req.session.access_token}`,
      },
      method: "GET",
    });
    const res = await b.json();
    return {
      username: res.platform_username ?? undefined,
      metadata: {
        wings: Number(res.metadata?.wings),
        since: res.metadata?.since as string | undefined,
        cr: (res.metadata?.cr ?? "0") === "1",
        eden: (res.metadata?.eden ?? "0") === "1",
        hangout: (res.metadata?.hangout ?? "0") === "1",
      },
    };
  }
}
