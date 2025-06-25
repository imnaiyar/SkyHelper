import type {
  APIActionRowComponent,
  APIComponentInMessageActionRow,
  APIMessage,
  APIMessageComponent,
  InteractionType,
  RESTPostAPIChannelMessageJSONBody,
} from "discord-api-types/v10";
import { store } from "./customId-store.js";
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

  /**
   * The page, paginator should start from
   * * default: 0
   */
  startPage?: number;
};

type PaginatorExtraParams = {
  /**
   * Current index the paginator is on
   */
  index: number;

  /**
   * Total number of pages the paginator is handling
   */
  total_page: number;
};
export async function paginate<U, T extends U[]>(
  helper: InteractionHelper,
  data: T,
  callback: (
    data: T,
    navBtns: APIActionRowComponent<APIComponentInMessageActionRow>,
    extra: PaginatorExtraParams,
  ) => RESTPostAPIChannelMessageJSONBody,
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
    startPage = 0,
  } = options;
  const totalPages = Math.ceil(data.length / per_page);
  let page = startPage;

  const createPageContent = (): RESTPostAPIChannelMessageJSONBody => {
    const start = page * per_page;
    const end = start + per_page;
    const navBtns: APIActionRowComponent<APIComponentInMessageActionRow> = {
      type: 1,
      id: 57, // for identification
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
    return callback(data.slice(start, end) as T, navBtns, { index: page, total_page: totalPages });
  };

  let message: APIMessage;
  if (helper.replied || helper.deferred) {
    message = await helper.editReply(createPageContent());
  } else {
    message = (await helper.reply(createPageContent())).resource!.message!;
  }

  const collector = client.componentCollector({
    message,
    filter: (i) => (user ? (i.member?.user || i.user!).id === user : true),
    idle,
    componentType: 2,
  });

  collector.on("collect", async (interaction) => {
    const { id, data: d } = store.deserialize(interaction.data.custom_id);
    if (id !== 19) return;

    if (!["nav_next", "xxyyzzkkll"].includes(d.data!)) return; // check for data here so that idle state can be reset even for other interaction

    if (d.data === "nav_next") {
      page = Math.min(page + 1, totalPages - 1);
    } else if (d.data === "xxyyzzkkll") {
      page = Math.max(page - 1, 0);
    }
    await client.api.interactions.updateMessage(interaction.id, interaction.token, createPageContent());
  });

  collector.on("end", async (_r, reason) => {
    if (reason === "no disable") return; // collector was stopped in some other place and like doesn't want it to disable the button or make changes to the message

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
      if (comp.type === 1 && comp.id === 57) return comp;
      if ("components" in comp) {
        const found = findRowWithId(comp.components);
        if (found) return found;
      }
    }
    return undefined;
  }

  return collector;
}
