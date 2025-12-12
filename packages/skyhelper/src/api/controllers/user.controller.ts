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
import { PlannerDataService } from "@/planner";
import { fetchSkyData } from "@/planner";
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

  @Get("planner/breakdown")
  @ApiOperation({
    summary: "Get user planner breakdown",
    description: "Retrieves detailed breakdown of user's planner items, currencies spent, and statistics",
  })
  @ApiParam({ name: "user", description: "Discord user ID", example: "123456789012345678" })
  @ApiResponse({
    status: 200,
    description: "Planner breakdown retrieved successfully",
  })
  @ApiUnauthorizedResponse({ description: "Missing or invalid authentication" })
  @ApiNotFoundResponse({ description: "User not found" })
  async getPlannerBreakdown(@Req() req: AuthRequest) {
    const userData = await this.bot.schemas.getUser(req.user);
    if (!userData.plannerData) {
      throw new HttpException("No planner data found for this user", HttpStatus.NOT_FOUND);
    }

    // Fetch sky data and resolve progress
    const skyData = await fetchSkyData(this.bot);
    const resolvedData = PlannerDataService.resolveProgress(skyData, userData.plannerData);

    // Calculate breakdown
    const breakdown = PlannerDataService.calculateCurrencyBreakdown(resolvedData);
    const progress = PlannerDataService.calculateUserProgress(resolvedData);

    // Transform breakdown data for web consumption
    const transformBreakdown = (cost: any) => ({
      cost: {
        candles: cost.cost.c || 0,
        hearts: cost.cost.h || 0,
        seasonCandles: cost.cost.sc || 0,
        seasonHearts: cost.cost.sh || 0,
        ascendedCandles: cost.cost.ac || 0,
        eventCurrency: cost.cost.ec || 0,
      },
      price: cost.price || 0,
      items: {
        nodes: cost.nodes.map((node: any) => ({
          guid: node.guid,
          name: node.item?.name || "Unknown",
          cost: {
            candles: node.c || 0,
            hearts: node.h || 0,
            seasonCandles: node.sc || 0,
            seasonHearts: node.sh || 0,
            ascendedCandles: node.ac || 0,
            eventCurrency: node.ec || 0,
          },
          spirit: node.root?.tree?.spirit
            ? {
                guid: node.root.tree.spirit.guid,
                name: node.root.tree.spirit.name,
                imageUrl: node.root.tree.spirit.imageUrl,
              }
            : null,
        })),
        shopItems: cost.listNodes.map((listNode: any) => ({
          guid: listNode.guid,
          name: listNode.item?.name || "Unknown",
          quantity: listNode.quantity || 1,
          cost: {
            candles: listNode.c || 0,
            hearts: listNode.h || 0,
            seasonCandles: listNode.sc || 0,
            seasonHearts: listNode.sh || 0,
            ascendedCandles: listNode.ac || 0,
            eventCurrency: listNode.ec || 0,
          },
          shop: listNode.itemList?.shop?.name || "Unknown Shop",
        })),
        iaps: cost.iaps.map((iap: any) => ({
          guid: iap.guid,
          name: iap.name,
          price: iap.price || 0,
        })),
      },
    });

    // Transform seasons
    const seasons = Array.from(breakdown.seasons.entries()).map(([guid, cost]) => {
      const season = resolvedData.seasons.items.find((s) => s.guid === guid);
      return {
        guid,
        name: season?.name || "Unknown Season",
        number: season?.number,
        imageUrl: season?.imageUrl,
        ...transformBreakdown(cost),
      };
    });

    // Transform events
    const events = Array.from(breakdown.events.entries()).map(([guid, cost]) => {
      const event = resolvedData.events.items.find((e) => e.guid === guid);
      return {
        guid,
        name: event?.name || "Unknown Event",
        imageUrl: event?.imageUrl,
        ...transformBreakdown(cost),
      };
    });

    // Transform event instances
    const eventInstances = Array.from(breakdown.eventInstances.entries()).map(([guid, cost]) => {
      const eventInstance = resolvedData.eventInstances.items.find((ei) => ei.guid === guid);
      return {
        guid,
        name: eventInstance?.name || eventInstance?.event?.name || "Unknown Event Instance",
        eventName: eventInstance?.event?.name,
        date: eventInstance?.date?.toISO(),
        imageUrl: eventInstance?.event?.imageUrl,
        ...transformBreakdown(cost),
      };
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
      },
      progress,
      currencies: userData.plannerData.currencies,
      breakdown: {
        total: transformBreakdown(breakdown.total),
        regular: transformBreakdown(breakdown.regular),
        seasons,
        events,
        eventInstances,
      },
    };
  }
}
