import { Body, Controller, Get, HttpException, HttpStatus, Inject, Param, Patch, Req } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from "@nestjs/swagger";
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

@ApiTags("User Management")
@ApiBearerAuth()
@Controller("/users")
export class UsersController {
  // eslint-disable-next-line
  constructor(@Inject("BotClient") private readonly bot: BotService) {}

  @Get(":user")
  @ApiOperation({
    summary: "Get user information",
    description: "Retrieves user settings and preferences",
  })
  @ApiParam({ name: "user", description: "Discord user ID", example: "123456789012345678" })
  @ApiResponse({
    status: 200,
    description: "User information retrieved successfully",
    schema: {
      type: "object",
      properties: {
        language: { type: "string", example: "en-US" },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid authentication" })
  async getUser(@Param("user", UserIDPredicate) userId: string): Promise<UserInfo> {
    const user = await this.bot.api.users.get(userId).catch(() => null);
    if (!user) return { language: "en-US" };
    const user_settings = await this.bot.schemas.getUser(user);
    return {
      language: user_settings.language?.value || "en-US",
    };
  }

  @Patch(":user")
  @ApiOperation({
    summary: "Update user settings",
    description: "Updates user preferences like language",
  })
  @ApiParam({ name: "user", description: "Discord user ID", example: "123456789012345678" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        language: { type: "string", example: "en-US" },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "User settings updated successfully",
    schema: {
      type: "object",
      properties: {
        language: { type: "string", example: "en-US" },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid authentication" })
  @ApiBadRequestResponse({ description: "Invalid request body" })
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
  @ApiOperation({
    summary: "Update user linked role metadata",
    description: "Updates Discord linked role connection metadata for the user",
  })
  @ApiParam({ name: "user", description: "Discord user ID", example: "123456789012345678" })
  @ApiBody({
    description: "Role metadata to update",
    schema: {
      type: "object",
      properties: {
        username: { type: "string", description: "Platform username" },
        metadata: {
          type: "object",
          properties: {
            wings: { type: "number", minimum: 1, maximum: 240, description: "Number of wings" },
            since: { type: "string", description: "Date since playing" },
            eden: { type: "boolean", description: "Has completed Eden" },
            cr: { type: "boolean", description: "Completed candle runs" },
            hangout: { type: "boolean", description: "Available for hangouts" },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Role metadata updated successfully",
    schema: {
      type: "object",
      properties: {
        username: { type: "string" },
        metadata: { type: "object" },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid authentication" })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiBadRequestResponse({ description: "Invalid request body" })
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
  @ApiOperation({
    summary: "Get user linked role metadata",
    description: "Retrieves Discord linked role connection metadata for the user",
  })
  @ApiParam({ name: "user", description: "Discord user ID", example: "123456789012345678" })
  @ApiResponse({
    status: 200,
    description: "Role metadata retrieved successfully",
    schema: {
      type: "object",
      properties: {
        username: { type: "string" },
        metadata: {
          type: "object",
          properties: {
            wings: { type: "number" },
            since: { type: "string" },
            eden: { type: "boolean" },
            cr: { type: "boolean" },
            hangout: { type: "boolean" },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid authentication" })
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
