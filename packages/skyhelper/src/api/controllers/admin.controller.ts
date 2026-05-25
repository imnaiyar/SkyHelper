import { fetchSkyData, PlannerService } from "@/planner";
import type { SkyHelper } from "@/structures";
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Param, Patch, Post, Req } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiExcludeController, ApiParam, ApiBody, ApiResponse } from "@nestjs/swagger";
import { inspect } from "node:util";
import { z, toJSONSchema } from "zod/v4";
import { ZodValidator } from "../pipes/zod-validator.pipe.js";
import { ApiKeyModel, generateApiKey } from "@/schemas/ApiKeySchema";
import type { ApiKeySchema } from "@/types/schemas";
import type { AuthRequest } from "../middlewares/auth.middleware.js";

const ApiKeyRateLimitSchema = z.object({
  limit: z.number().int().positive(),
  ttl: z.number().int().positive(),
});

const ApiKeyCreateSchema = z.object({
  name: z.string().min(1),
  rateLimit: ApiKeyRateLimitSchema.optional(),
  isActive: z.boolean().optional(),
});

const ApiKeyUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  rateLimit: z.union([ApiKeyRateLimitSchema, z.null()]).optional(),
  isActive: z.boolean().optional(),
});

const ApiKeyResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  keyPrefix: z.string(),
  isActive: z.boolean(),
  rateLimit: ApiKeyRateLimitSchema.nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

@ApiTags("Admin Routes")
@ApiBearerAuth()
@Controller("/admin")
@ApiExcludeController()
export class AdminController {
  constructor(@Inject("BotClient") private readonly bot: SkyHelper) {}
  private mapApiKey(key: ApiKeySchema) {
    return {
      id: key._id.toString(),
      name: key.name,
      keyPrefix: key.keyPrefix,
      isActive: key.isActive,
      rateLimit: key.rateLimit ?? null,
      createdAt: key.createdAt.toISOString(),
      updatedAt: key.updatedAt.toISOString(),
    };
  }

  @ApiParam({ name: "query", description: "The query to search for", example: "sassy" })
  @Get("planner/:query")
  async getPlannerEntities(@Param("query") query: string) {
    const data = await fetchSkyData(this.bot);

    const results = PlannerService.searchEntitiesByName(query, data);
    return results;
  }

  @ApiParam({ name: "entity", description: "The guid of entity to get", example: "sdfjnf-srb" })
  @Get("planner/get/:entity")
  async getPlannerEntity(@Param("entity") entity: string) {
    const data = await fetchSkyData(this.bot);

    const results = PlannerService.getEntityByGuid(entity, data);
    return inspect(results, { depth: 3 });
  }

  @Get("api-keys")
  @ApiResponse({ status: 200, schema: toJSONSchema(z.array(ApiKeyResponseSchema)) })
  async listApiKeys() {
    const keys = await ApiKeyModel.find().sort({ createdAt: -1 }).exec();
    return keys.map((key) => this.mapApiKey(key));
  }

  @Post("api-keys")
  @ApiBody({ schema: toJSONSchema(ApiKeyCreateSchema) })
  @ApiResponse({
    status: 201,
    schema: toJSONSchema(
      ApiKeyResponseSchema.extend({
        apiKey: z.string(),
      }),
    ),
  })
  async createApiKey(
    @Req() req: AuthRequest,
    @Body(new ZodValidator(ApiKeyCreateSchema)) body: z.infer<typeof ApiKeyCreateSchema>,
  ) {
    const { apiKey, keyHash, keyPrefix, keySalt } = generateApiKey();
    const key = new ApiKeyModel({
      name: body.name,
      keyHash,
      keySalt,
      keyPrefix,
      createdBy: req.user.id,
      rateLimit: body.rateLimit,
      isActive: body.isActive ?? true,
    });
    await key.save();
    return {
      ...this.mapApiKey(key),
      apiKey,
    };
  }

  @Patch("api-keys/:id")
  @ApiParam({ name: "id", description: "API key ID" })
  @ApiBody({ schema: toJSONSchema(ApiKeyUpdateSchema) })
  @ApiResponse({ status: 200, schema: toJSONSchema(ApiKeyResponseSchema) })
  async updateApiKey(
    @Param("id") id: string,
    @Body(new ZodValidator(ApiKeyUpdateSchema)) body: z.infer<typeof ApiKeyUpdateSchema>,
  ) {
    const key = await ApiKeyModel.findById(id).exec();
    if (!key) {
      throw new HttpException("API key not found", HttpStatus.NOT_FOUND);
    }

    if (body.name !== undefined) key.name = body.name;
    if (body.rateLimit !== undefined) {
      key.rateLimit = body.rateLimit ?? undefined;
    }
    if (body.isActive !== undefined) key.isActive = body.isActive;
    await key.save();
    return this.mapApiKey(key);
  }

  @Delete("api-keys/:id")
  @ApiParam({ name: "id", description: "API key ID" })
  @ApiResponse({ status: 200, schema: toJSONSchema(z.object({ id: z.string() })) })
  async deleteApiKey(@Param("id") id: string) {
    const key = await ApiKeyModel.findByIdAndDelete(id).exec();
    if (!key) {
      throw new HttpException("API key not found", HttpStatus.NOT_FOUND);
    }
    return { id: key._id.toString() };
  }
}
