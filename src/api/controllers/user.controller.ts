import { Body, Controller, Get, HttpException, HttpStatus, Inject, Param, Patch, Put, Req } from "@nestjs/common";
import { SkyHelper as BotService } from "#structures";
import type { UserInfo } from "../types.js";
import { supportedLang } from "#bot/libs/constants/supportedLang";
import { ZodValidator } from "../pipes/zod-validator.pipe.js";
import { z } from "zod";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

const UserIDPredicate = new ZodValidator(z.string().regex(/^\d{17,19}$/, "Must be a valid snowflake ID"), "Invalid 'user' Param");
@Controller("/users")
export class UsersController {
  // eslint-disable-next-line
  constructor(@Inject("BotClient") private readonly bot: BotService) {}

  @Get(":user")
  async getUser(@Param("user", UserIDPredicate) userId: string): Promise<UserInfo> {
    const user = await this.bot.users.fetch(userId).catch(() => null);
    if (!user) return { language: "en-US" };
    const user_settings = await this.bot.database.getUser(user);
    return {
      language: user_settings.language?.value || "en-US",
    };
  }

  @Patch(":user")
  async updateUser(
    @Param("user", UserIDPredicate) userId: string,
    @Body(new ZodValidator(z.object({ language: z.string().optional() }))) data: UserInfo,
  ): Promise<UserInfo> {
    const user = await this.bot.users.fetch(userId).catch(() => null);
    if (!user) return { language: "en-US" };
    const user_settings = await this.bot.database.getUser(user);
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
  @Put(":user/linked-role")
  async updateUserRoleMetadata(
    @Param("user", UserIDPredicate) userId: string,
    @Body(new ZodValidator(RoleMetadataKeySchema)) data: RoleMetadataKey,
    @Req() req: AuthRequest,
  ) {
    const user = await this.bot.users.fetch(userId).catch(() => null);
    if (!user) throw new HttpException("User not founde", HttpStatus.NOT_FOUND);
    const userData = await this.bot.database.getUser(user);
    await fetch(`https://discord.com/api/v10/users/@me/applications/${this.bot.user.id}/role-connection`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${req.session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Sky:CoTL Profile",
        username: data.username,
        metadata: data.metadata,
      }),
    });
    userData.linkedRole = data;
    await userData.save();
    return data;
  }
}

const RoleMetadataKeySchema = z.object({
  username: z.string().optional(),
  metadata: z
    .object({
      wings: z.number().max(220).min(1).optional(),
      playingSince: z.string().optional(),
      wlr: z.boolean().optional(),
      cr: z.boolean().optional(),
    })
    .optional(),
});

type RoleMetadataKey = z.infer<typeof RoleMetadataKeySchema>;
