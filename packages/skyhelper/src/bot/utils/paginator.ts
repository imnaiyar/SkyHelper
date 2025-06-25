import type {
  APIActionRowComponent,
  APIComponentInMessageActionRow,
  APIMessage,
  APIMessageComponent,
  APIMessageTopLevelComponent,
  InteractionType,
  RESTPostAPIChannelMessageJSONBody,
} from "discord-api-types/v10";
import { store } from "./customId-store.js";
import { row } from "@skyhelperbot/utils";
import type { InteractionHelper } from "./classes/InteractionUtil.js";
import type { InteractionCollector } from "./classes/Collector.js";
// Replicate "lodash.get" function

const _get = (obj: any, _path: string) => {
  return _path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
};

type PaginatorOptions = {
  /**
   * Max number of items per page.
   * * default: 10
   */
  per_page?: number;

  /**
   * Label on the next button
   * * default: "Next"
   */
  next_label?: string;

  /**
   * Label on the previous button
   * * default: "Previous"
   */
  previous_label?: string;

  /**
   * User ID to restrict pagination to.
   * If not provided, anyone can interact with the paginator.
   */
  user?: string;

  /**
   * Time in milliseconds before the paginator times out.
   * * default: 60000 (1 minute)
   */
  idle?: number;

  /**
   * Whether to disable nav button from the message when the paginator ends.
   * * default: true
   */
  disableOnEnd?: boolean;
};
export async function paginate<U, T extends U[]>(
  helper: InteractionHelper,
  data: T,
  callback: (data: T, navBtns: APIActionRowComponent<APIComponentInMessageActionRow>) => RESTPostAPIChannelMessageJSONBody,
  options: PaginatorOptions = {},
): Promise<InteractionCollector<2, InteractionType.MessageComponent>> {
  const { client } = helper;
  const {
    per_page = 10,
    next_label = "Next",
    previous_label = "Previous",
    user = null,
    idle = 6e4,
    disableOnEnd = true,
  } = options;
  const totalPages = Math.ceil(data.length / per_page);
  let page = 0;

  const createPageContent = (): RESTPostAPIChannelMessageJSONBody => {
    const start = page * per_page;
    const end = start + per_page;
    const navBtns: APIActionRowComponent<APIComponentInMessageActionRow> = {
      type: 1,
      id: 1, // for identification
      components: [
        {
          type: 2,
          label: previous_label,
          style: 2,
          custom_id: store.serialize(19, { data: "xxyyzzkkll", user }),
          disabled: page === 0,
        },
        {
          type: 2,
          label: `Page ${page + 1}/${totalPages}`,
          style: 3,
          custom_id: "dsvdf",
          disabled: true,
        },
        {
          type: 2,
          label: next_label,
          style: 2,
          custom_id: store.serialize(19, { data: "nav_next", user }),
          disabled: page === totalPages - 1,
        },
      ],
    };
    return callback(data.slice(start, end) as T, navBtns);
  };

  let message: APIMessage;
  if (helper.replied || helper.deferred) {
    message = await helper.editReply(createPageContent());
  } else {
    message = (await helper.reply(createPageContent())).resource!.message!;
  }

  const collector = client.componentCollector({
    message,
    filter: (i) => {
      const { id, data: d } = store.deserialize(i.data.custom_id);
      if (id !== 19) return false;
      if (!["nav_next", "xxyyzzkkll"].includes(d.data!)) return false;
      if (user && (i.member?.user || i.user!).id !== user) return false; // Check if the interaction is from the specified user
      return true;
    },
    idle,
    componentType: 2,
  });

  collector.on("collect", async (interaction) => {
    const { id, data: d } = store.deserialize(interaction.data.custom_id);
    if (id !== 19) throw new Error("Invalid custom ID for paginator");
    if (d.data === "nav_next") {
      page = Math.min(page + 1, totalPages - 1);
    } else if (d.data === "xxyyzzkkll") {
      page = Math.max(page - 1, 0);
    }
    await client.api.interactions.updateMessage(interaction.id, interaction.token, createPageContent());
  });

  collector.on("end", async () => {
    if (!disableOnEnd) return;

    const m = await helper.fetchReply().catch(() => null);
    if (!m) return;

    const components = m.components!;
    const navRow = findRowWithId(components);
    if (!navRow) return;
    for (const comp of navRow.components) {
      comp.disabled = true;
    }

    await helper.editReply({ components });
  });

  // Recursively search for a row component with id: 1
  function findRowWithId(components: APIMessageComponent[]): APIActionRowComponent<APIComponentInMessageActionRow> | undefined {
    for (const comp of components) {
      if (comp.type === 1 && comp.id === 1) return comp;
      if ("components" in comp) {
        const found = findRowWithId(comp.components);
        if (found) return found;
      }
    }
    return undefined;
  }

  return collector;
}
