import type { Command } from "@/structures";
import { MessageFlags } from "@discordjs/core";
import { SkyPlannerData } from "@skyhelperbot/constants";
import { postToHaste, separator, textDisplay } from "@skyhelperbot/utils";
import { SKYGAME_PLANNER_DATA } from "@/modules/commands-data/info-commands";
import util from "util";
import { getHomeDisplay } from "../../../handlers/planner.js";
import { DateTime } from "luxon";

export default {
  async autocomplete({ helper, options }) {
    const focusedOption = options.getFocusedOption();
    const focusedValue = focusedOption.value;

    if (focusedOption.name === "entity") {
      try {
        const data = await SkyPlannerData.getSkyGamePlannerData();
        const results = SkyPlannerData.searchEntitiesByName(focusedValue as string, data);

        return helper.respond({
          choices: results.slice(0, 25).map((result) => ({
            name: `${result.type}: ${result.name}`,
            value: result.guid,
          })),
        });
      } catch (error) {
        console.error("Error in autocomplete:", error);
        return helper.respond({ choices: [{ name: "Error searching data", value: "error" }] });
      }
    }

    return helper.respond({ choices: [] });
  },

  async interactionRun({ helper, options }) {
    await helper.defer({ flags: options.getBoolean("hide") ? MessageFlags.Ephemeral : undefined });

    const subcommand = options.getSubcommand();

    // Fetch the data
    const data = await SkyPlannerData.getSkyGamePlannerData();

    if (subcommand === "planner") {
      const comp = await getHomeDisplay(helper.user.id);
      await helper.editReply({ components: comp.components, flags: MessageFlags.IsComponentsV2 });
      return;
    }

    if (subcommand === "stats") {
      const stats = SkyPlannerData.getDataStats(data);

      await helper.editReply({
        components: [
          textDisplay("# SkyGame Planner Data Statistics"),
          separator(true, 1),
          textDisplay(`- Realms: ${stats.realms}`),
          textDisplay(`- Areas: ${stats.areas}`),
          textDisplay(`- Spirits: ${stats.spirits}`),
          textDisplay(`- Seasons: ${stats.seasons}`),
          textDisplay(`- Items: ${stats.items}`),
          textDisplay(`- Winged Lights: ${stats.wingedLights}`),
          textDisplay(`- Traveling Spirits: ${stats.travelingSpirits}`),
          textDisplay(`- Returning Spirit Visits: ${stats.returningSpirits}`),
          textDisplay(`- Events: ${stats.events}`),
          textDisplay(`- Total Nodes: ${stats.totalNodes}`),
        ],
        flags: MessageFlags.IsComponentsV2,
      });
    } else if (subcommand === "events") {
      const events = SkyPlannerData.getEvents(data);

      const components = [textDisplay("# Sky Events"), separator(true, 1)];

      if (events.current.length > 0) {
        components.push(textDisplay("## Current Events"));
        for (const eventInfo of events.current) {
          const startDate = SkyPlannerData.resolveToLuxon(eventInfo.instance.date).toFormat("dd-MM-yyyy");
          const endDate = SkyPlannerData.resolveToLuxon(eventInfo.instance.endDate).toFormat("dd-MM-yyyy");
          components.push(textDisplay(`- **${eventInfo.event.name}** (${startDate} - ${endDate})`));
        }
        components.push(separator(true, 1));
      } else {
        components.push(textDisplay("No events are currently active."));
        components.push(separator(true, 1));
      }

      components.push(textDisplay("## Upcoming Events"));
      if (events.upcoming.length > 0) {
        for (const eventInfo of events.upcoming) {
          const startDate = SkyPlannerData.resolveToLuxon(eventInfo.instance.date).toFormat("dd-MM-yyyy");
          const endDate = SkyPlannerData.resolveToLuxon(eventInfo.instance.endDate).toFormat("dd-MM-yyyy");
          components.push(textDisplay(`- **${eventInfo.event.name}** (${startDate} - ${endDate})`));
        }
      } else {
        components.push(textDisplay("No upcoming events found."));
      }

      await helper.editReply({
        components,
        flags: MessageFlags.IsComponentsV2,
      });
    } else if (subcommand === "data") {
      const entityGuid = options.getString("entity", true);
      const depth = options.getInteger("depth") ?? 8;

      if (entityGuid === "error") {
        await helper.editReply({
          components: [
            textDisplay("# Error"),
            separator(true, 1),
            textDisplay("An error occurred during entity search. Please try again."),
          ],
          flags: MessageFlags.IsComponentsV2,
        });
        return;
      }

      const entity = SkyPlannerData.getEntityByGuid(entityGuid, data);

      if (!entity) {
        await helper.editReply({
          components: [
            textDisplay("# Entity Not Found"),
            separator(true, 1),
            textDisplay(`No entity found with GUID: ${entityGuid}`),
          ],
          flags: MessageFlags.IsComponentsV2,
        });
        return;
      }

      // Create a JSON string with proper formatting and depth
      const jsonData = util.inspect(entity.data, { depth, colors: false, compact: false });

      // Post to haste
      const hasteUrl = await postToHaste(jsonData);

      // Get a descriptive name for the entity
      let entityName = "Unknown";
      if ("name" in entity.data && entity.data.name) {
        entityName = entity.data.name as string;
      }

      await helper.editReply({
        components: [
          textDisplay(`# ${entity.type}: ${entityName}`),
          separator(true, 1),
          textDisplay(`GUID: \`${entityGuid}\``),
          separator(true, 1),
          textDisplay(`I've posted the full data to: ${hasteUrl}`),
          textDisplay("Click the link above to view all the entity data"),
        ],
        flags: MessageFlags.IsComponentsV2,
      });
    } else {
      // Default response if no specific subcommand is selected
      await helper.editReply({
        components: [
          textDisplay("# SkyGame Planner"),
          separator(true, 1),
          textDisplay("Use one of the subcommands to access SkyGame Planner data:"),
          textDisplay("- `/skygame-planner stats` - Get statistics about the data"),
          textDisplay("- `/skygame-planner current-ts` - Get information about the current traveling spirit"),
          textDisplay("- `/skygame-planner events` - Get information about current and upcoming events"),
          textDisplay("- `/skygame-planner data` - Retrieve specific entity data by searching for it"),
        ],
        flags: MessageFlags.IsComponentsV2,
      });
    }
  },
  ...SKYGAME_PLANNER_DATA,
} satisfies Command<true>;
