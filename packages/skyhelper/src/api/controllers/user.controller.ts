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
import { UserInfoSchema } from "../types.js";
import { supportedLang } from "@skyhelperbot/constants";
import { ZodValidator } from "../pipes/zod-validator.pipe.js";
import { z, toJSONSchema } from "zod/v4";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { Routes } from "@discordjs/core";
import { fetchSkyData, PlannerDataService } from "@/planner";
import { ItemType } from "skygame-data";
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
    schema: toJSONSchema(UserInfoSchema),
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid authentication" })
  async getUser(@Param("user", UserIDPredicate) userId: string): Promise<z.infer<typeof UserInfoSchema>> {
    const user = await this.bot.api.users.get(userId).catch(() => null);
    if (!user) return { language: "en-US" };
    const user_settings = await this.bot.schemas.getUser(user);
    return {
      language: user_settings.language?.value ?? "en-US",
    };
  }

  @Get(":user/planner/breakdown")
  @ApiOperation({
    summary: "Get user planner breakdown",
    description: "Retrieves detailed breakdown of user's items and costs",
  })
  @ApiParam({ name: "user", description: "Discord user ID", example: "123456789012345678" })
  @ApiResponse({
    status: 200,
    description: "Planner breakdown retrieved successfully",
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid authentication" })
  async getUserBreakdown(@Param("user", UserIDPredicate) userId: string) {
    const user = await this.bot.api.users.get(userId).catch(() => null);
    if (!user) throw new HttpException("User not found", HttpStatus.NOT_FOUND);

    const user_settings = await this.bot.schemas.getUser(user);
    const plannerData = user_settings.plannerData;

    const skyData = await fetchSkyData(this.bot);

    const resolvedData = PlannerDataService.resolveProgress(skyData, plannerData);
    const breakdown = PlannerDataService.calculateCurrencyBreakdown(resolvedData);
    const sanitizeItem = (item: any) => ({
      name: item.name,
      type: item.type,
      emoji: item.emoji,
      icon: item.icon,
    });

    const sanitizeCost = (cost: any) => ({
      c: cost.c,
      h: cost.h,
      ac: cost.ac,
      sc: cost.sc,
      sh: cost.sh,
      ec: cost.ec,
    });

    const sanitizeInstance = (instance: any) => ({
      cost: sanitizeCost(instance.cost),
      price: instance.price,
      nodes: instance.nodes.map((n: any) => ({
        ...sanitizeCost(n),
        item: n.item ? sanitizeItem(n.item) : undefined,
      })),
      listNodes: instance.listNodes.map((n: any) => ({
        ...sanitizeCost(n),
        quantity: n.quantity,
        item: n.item ? sanitizeItem(n.item) : undefined,
      })),
      iaps: instance.iaps.map((iap: any) => ({
        name: iap.name,
        price: iap.price,
      })),
    });

    const serializeMap = (map: Map<string, any>) => {
      const obj: Record<string, any> = {};
      for (const [key, value] of map) {
        // @ts-expect-error bcs of dynamic keys
        const name = skyData.guids.get(key)?.name ?? key;
        obj[key] = { name, ...sanitizeInstance(value) };
      }
      return obj;
    };

    return {
      total: sanitizeInstance(breakdown.total),
      regular: sanitizeInstance(breakdown.regular),
      seasons: serializeMap(breakdown.seasons),
      events: serializeMap(breakdown.events),
      eventInstances: serializeMap(breakdown.eventInstances),
    };
  }

  @Patch(":user")
  @ApiOperation({
    summary: "Update user settings",
    description: "Updates user preferences like language",
  })
  @ApiParam({ name: "user", description: "Discord user ID", example: "123456789012345678" })
  @ApiBody({
    schema: toJSONSchema(UserInfoSchema),
  })
  @ApiResponse({
    status: 200,
    description: "User settings updated successfully",
    schema: toJSONSchema(UserInfoSchema),
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid authentication" })
  @ApiBadRequestResponse({ description: "Invalid request body" })
  async updateUser(
    @Param("user", UserIDPredicate) userId: string,
    @Body(new ZodValidator(UserInfoSchema)) data: z.infer<typeof UserInfoSchema>,
  ): Promise<z.infer<typeof UserInfoSchema>> {
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
    schema: toJSONSchema(RoleMetadataKeySchema),
  })
  @ApiResponse({
    status: 200,
    description: "Role metadata updated successfully",
    schema: toJSONSchema(RoleMetadataKeySchema),
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
    schema: toJSONSchema(RoleMetadataKeySchema),
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
