import type { Command, SkyHelper } from "@/structures";
import { MessageFlags, MessageReferenceType } from "@discordjs/core";
import { postToHaste, separator, textDisplay } from "@skyhelperbot/utils";
import util from "util";
import { PLANNER_MANAGE_DATA } from "@/modules/commands-data/owner-commands";
import { fetchSkyData, PlannerService } from "@/planner";
import type { ISkyData } from "skygame-data";

export default {
  async autocomplete({ helper, options }) {
    const focusedOption = options.getFocusedOption();
    const focusedValue = focusedOption.value;

    if (focusedOption.name === "entity") {
      try {
        const data = await fetchSkyData(helper.client);
        const results = PlannerService.searchEntitiesByName(focusedValue as string, data);
        await helper.respond({
          choices: results.slice(0, 25).map((result) => ({
            name: `${result.type}: ${result.name}`,
            value: result.guid,
          })),
        });
        return;
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
    const data = await fetchSkyData(helper.client);
    let response;
    switch (subcommand) {
      case "stats": {
        response = getStats(data);
        break;
      }
      case "data": {
        const entityGuid = options.getString("entity", true);
        const depth = options.getInteger("depth") ?? 3;

        response = await getEntity(data, entityGuid, depth);
        break;
      }
      case "refresh": {
        await refreshPlannerData(helper.client);
        response = {
          components: [
            textDisplay("# SkyGame Planner Data Refreshed"),
            separator(true, 1),
            textDisplay("The SkyGame Planner data has been successfully refreshed from the source."),
          ],
        };
        break;
      }
    }

    await helper.editReply({ ...response, flags: MessageFlags.IsComponentsV2 });
  },
  messageRun: async ({ message, args, client }) => {
    const sub = args[0]!.toLowerCase();
    let response;
    switch (sub) {
      case "stats": {
        const data = await fetchSkyData(client);
        response = getStats(data);
        break;
      }
      case "data": {
        const entityGuid = args[1];
        if (!entityGuid) {
          response = { components: [textDisplay("You need to provide an entity GUID.")] };
          break;
        }
        const depth = args[2] ? parseInt(args[2], 10) : 3;

        const data = await fetchSkyData(client);
        response = await getEntity(data, entityGuid, depth);
        break;
      }
      case "refresh": {
        await refreshPlannerData(client);
        response = {
          components: [
            textDisplay("# SkyGame Planner Data Refreshed"),
            separator(true, 1),
            textDisplay("The SkyGame Planner data has been successfully refreshed from the source."),
          ],
        };
        break;
      }
      default: {
        response = {
          components: [textDisplay("Invalid subcommand. Please use 'data', 'stats', or 'refresh'.")],
        };
      }
    }
    await client.api.channels.createMessage(message.channel_id, {
      ...response,
      allowed_mentions: { parse: [], replied_user: false },
      flags: MessageFlags.IsComponentsV2,
      message_reference: { message_id: message.id, channel_id: message.channel_id, type: MessageReferenceType.Default },
    });
    return;
  },
  ...PLANNER_MANAGE_DATA,
} satisfies Command<true>;

function getStats(data: ISkyData) {
  const stats = {
    realms: data.realms.items.length,
    areas: data.areas.items.length,
    spirits: data.spirits.items.length,
    seasons: data.seasons.items.length,
    items: data.items.items.length,
    wingedLights: data.wingedLights.items.length,
    travelingSpirits: data.travelingSpirits.items.length,
    returningSpirits: data.specialVisits.items.length,
    events: data.events.items.length,
    totalNodes: data.nodes.items.length,
  };

  return {
    components: [
      textDisplay("# SkyGame Planner Data Statistics"),
      separator(true, 1),
      textDisplay(
        `- Realms: ${stats.realms}`,
        `- Areas: ${stats.areas}`,
        `- Spirits: ${stats.spirits}`,
        `- Seasons: ${stats.seasons}`,
        `- Items: ${stats.items}`,
        `- Winged Lights: ${stats.wingedLights}`,
        `- Traveling Spirits: ${stats.travelingSpirits}`,
        `- Returning Spirit Visits: ${stats.returningSpirits}`,
        `- Events: ${stats.events}`,
        `- Total Nodes: ${stats.totalNodes}`,
      ),
    ],
  };
}

function getEntity(data: ISkyData, entityGuid: string, depth: number) {
  const entity = PlannerService.getEntityByGuid(entityGuid, data);
  if (!entity) {
    return {
      components: [
        textDisplay("# Entity Not Found"),
        separator(true, 1),
        textDisplay(`No entity found with GUID: ${entityGuid}`),
      ],
    };
  }

  // Create a JSON string with proper formatting and depth
  const jsonData = util.inspect(entity.data, { depth, colors: false, compact: false });

  // Post to haste
  return postToHaste(jsonData).then((hasteUrl) => {
    // Get a descriptive name for the entity
    let entityName = "Unknown";
    if ("name" in entity.data && entity.data.name) {
      entityName = entity.data.name;
    }
    return {
      components: [
        textDisplay(`# ${entity.type}: ${entityName}`),
        separator(true, 1),
        textDisplay(`GUID: \`${entityGuid}\``),
        separator(true, 1),
        textDisplay(`Structure: ${hasteUrl}`),
      ],
    };
  });
}

function refreshPlannerData(client: SkyHelper) {
  return fetchSkyData(client, true);
}
