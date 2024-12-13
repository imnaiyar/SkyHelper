import { Body, Controller, Get, Inject, Param, Patch } from "@nestjs/common";
import { SkyHelper as BotService } from "#structures";
import type { UserInfo } from "../types.js";
import { supportedLang } from "#bot/libs/constants/supportedLang";
import { ZodValidator } from "../pipes/zod-validator.pipe.js";
import { z } from "zod";

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
}
