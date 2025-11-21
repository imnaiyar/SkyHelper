import { fetchSkyData, PlannerService } from "@/planner";
import type { SkyHelper } from "@/structures";
import { Controller, Get, Inject, Param } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiExcludeController, ApiParam } from "@nestjs/swagger";
import { inspect } from "node:util";

@ApiTags("Admin Routes")
@ApiBearerAuth()
@Controller("/admin")
@ApiExcludeController()
export class AdminController {
  constructor(@Inject("BotClient") private readonly bot: SkyHelper) {}
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
}
