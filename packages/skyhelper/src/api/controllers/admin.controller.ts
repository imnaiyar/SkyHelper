import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiExcludeController, ApiParam } from "@nestjs/swagger";
import { SkyPlannerData } from "@skyhelperbot/constants";
import { inspect } from "node:util";

@ApiTags("Admin Routes")
@ApiBearerAuth()
@Controller("/admin")
@ApiExcludeController()
export class AdminController {
  @ApiParam({ name: "query", description: "The query to search for", example: "sassy" })
  @Get("planner/:query")
  async getPlannerEntities(@Param("query") query: string) {
    const data = await SkyPlannerData.getSkyGamePlannerData();

    const results = SkyPlannerData.searchEntitiesByName(query, data);
    return results;
  }

  @ApiParam({ name: "entity", description: "The guid of entity to get", example: "sdfjnf-srb" })
  @Get("planner/get/:entity")
  async getPlannerEntity(@Param("entity") entity: string) {
    const data = await SkyPlannerData.getSkyGamePlannerData();

    const results = SkyPlannerData.getEntityByGuid(entity, data);
    return inspect(results, { depth: 3 });
  }
}
