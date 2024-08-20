import { Body, Controller, Get, Inject, Param, Patch } from "@nestjs/common";
import { SkyHelper as BotService } from "#structures";
import type { UserInfo } from "../types.js";
import { supportedLang } from "#bot/libs/constants/supportedLang";
@Controller("/users")
export class UsersController {
  // eslint-disable-next-line
  constructor(@Inject("BotClient") private readonly bot: BotService) {}

  @Get(":user")
  async getUser(@Param("user") userId: string): Promise<UserInfo> {
    const user = await this.bot.users.fetch(userId).catch(() => null);
    if (!user) return { language: "en-US" };
    const user_settings = await this.bot.database.getUser(user);
    return {
      language: user_settings.language?.value || "en-US",
    };
  }

  @Patch(":user")
  async updateUser(@Param("user") userId: string, @Body() data: UserInfo): Promise<UserInfo> {
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
