import { DisplayTabs, type NavigationState, FilterType, PlannerDataSchema } from "@/types/planner";
import {
  formatCurrencies,
  formatUnlockedItems,
  PlannerDataHelper,
  type PlannerAssetData,
  type UserPlannerData,
} from "@skyhelperbot/constants/skygame-planner";
import { serializeFilters } from "@/handlers/planner-displays/filter.manager";
import type { InteractionHelper } from "@/utils/classes/InteractionUtil";
import type { InteractionOptionResolver } from "@sapphire/discord-utilities";
import {
  ComponentType,
  MessageFlags,
  type APIModalInteractionResponseCallbackData,
  type APIModalSubmitInteraction,
} from "discord-api-types/v10";
import { z } from "zod/v4";
import { button, container, row, separator, textDisplay } from "@skyhelperbot/utils";
import { SkyPlannerData, zone } from "@skyhelperbot/constants";
import { CustomId, store } from "@/utils/customId-store";
import { DateTime } from "luxon";
import type { UserSchema } from "@/types/schemas";
import utils from "@/utils/classes/Utils";

// ============================================================================
// Constants
// ============================================================================

const TIMEOUTS = {
  MODAL: 3 * 60_000, // 3 minutes
  COMPONENT: 2 * 60_000, // 2 minutes
  SHORT_MODAL: 60_000, // 1 minute
} as const;

const MESSAGES = {
  TIMEOUT:
    "✨ *The stars have dimmed...* Your meditation took too long. The portal has closed! Please try summoning your data again. 🕯️",
  INVALID_FILE_HEADER: "🌟 ***Hmm... This constellation doesn't quite align!*** 🌟",
  INVALID_FILE_BODY:
    "It seems the Spirits are having trouble reading your starlight message. The file you've shared appears to be from a different realm! ",
  REQUIRED_FILE_FORMAT: "🕊️ **What I need from you:**",
  JSON_PARSE_ERROR_HEADER: "🌟 **Oops! Your constellation seems a bit jumbled...** 🌟",
  JSON_PARSE_ERROR_BODY:
    "This file seems to have lost its starlight during the journey! The Spirits cannot decipher its message. 📜✨",
  OTHER_USER_WARNING: "🌟 ***These memories belong to another Sky Kid...*** 🌟",
  IMPORT_SUCCESS:
    "✨ ***Your memories have been captured in starlight!*** 🌟\n\n*The Spirits have carefully preserved your journey across the realms. Keep this scroll safe, dear Sky Kid!* 🕯️📜",
  DELETE_SUCCESS: "🌌 ***Your memories have been released to the stars...*** 🌌",
  DELETE_BACKUP: "📜 ***A parting gift from the Spirits...***",
  IMPORT_NOTE:
    "\n-# NOTE: If you are importing data from [sky-planner.com](https://sky-planner.com), some things are not saved by the bot, mainly things related to website specific preferences. These includes but not limited to: Themes, Filters, Map Markers, Closet Settings, etc.",
} as const;

const PLANNER_WEBSITE = {
  URL: "https://sky-planner.com",
  SETTINGS_URL: "https://sky-planner.com/settings",
} as const;

const TYPE_PREFIX_REGEX = /^(TS#|SV)/;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Creates formatted file requirement instructions
 */
function getFileRequirementText(client: InteractionHelper["client"]): string {
  return `${MESSAGES.REQUIRED_FILE_FORMAT}
* Your exported \`.json\` file from the  ${utils.mentionCommand(client, "planner", "data")} (action:export) command, **or**
* The \`.json\` file you received from [sky-planner.com](${PLANNER_WEBSITE.URL})
-# You can get your exported file by going to [sky-planner.com/settings](${PLANNER_WEBSITE.SETTINGS_URL}) and selecting **"Export Data."**`;
}

/**
 * Creates confirmation buttons with cancel and confirm actions
 */
function createConfirmationButtons(userId: string) {
  return row(
    button({
      label: "Cancel",
      custom_id: store.serialize(CustomId.Default, { data: "cancel", user: userId }),
    }),
    button({
      label: "Confirm",
      custom_id: store.serialize(CustomId.Default, { data: "confirm", user: userId }),
      style: 4,
    }),
  );
}

/**
 * Awaits and validates a confirmation response
 */
async function awaitConfirmation(
  helper: InteractionHelper,
  message: any,
  timeout: number = TIMEOUTS.COMPONENT,
): Promise<boolean> {
  const collector = await helper.client
    .awaitComponent({
      message,
      filter: (i) => (i.member?.user ?? i.user!).id === helper.user.id,
      timeout,
    })
    .catch(() => null);

  if (!collector) return false;

  const customId = store.deserialize(collector.data.custom_id);
  return customId.id === CustomId.Default && customId.data.data === "confirm";
}

/**
 * Creates an import modal for planner data
 */
function createImportModal(interactionId: string): APIModalInteractionResponseCallbackData {
  return {
    title: "Import Planner Data",
    custom_id: "import" + interactionId,
    components: [
      {
        type: ComponentType.TextDisplay,
        content: `**Please upload your exported data file**

If you're importing data from [**sky-planner.com**](${PLANNER_WEBSITE.URL}), follow these steps:
1. Go to ⚙️ [**sky-planner.com/settings**](${PLANNER_WEBSITE.SETTINGS_URL})
2.  Select **"Export Data"**
3. Then, **upload the downloaded .json file here** to import your data`,
      },
      {
        type: ComponentType.Label,
        label: "Data File",
        description: "Please provide your saved .json file here",
        component: { type: ComponentType.FileUpload, custom_id: "data_file", max_values: 1 },
      },
    ],
  };
}

/**
 * Creates a delete confirmation modal
 */
function createDeleteModal(interactionId: string): APIModalInteractionResponseCallbackData {
  return {
    title: "Delete Planner Data",
    custom_id: "delete" + interactionId,
    components: [
      {
        type: ComponentType.TextDisplay,
        content: `⚠️ **Warning: This action cannot be undone!** ⚠️
 *The Spirits must know you understand...*

Deleting your planner data will permanently erase all your saved progress
*This is like going to eden...*

**Click submit if you want to proceed**`,
      },
    ],
  };
}

/**
 * Creates export file name and buffer
 */
function createPlannerExport(user: UserSchema) {
  const data = user.plannerData ?? PlannerDataHelper.createEmpty();
  const filename = `SkyHelper_Planner_${DateTime.now().setZone(zone).toFormat("yyyy-MM-dd")}.json`;

  return {
    ref: "attachment://" + filename,
    file: {
      name: filename,
      data: Buffer.from(JSON.stringify({ version: "1.1.0", storageData: data, user: user._id })),
    },
  };
}

/**
 * Handles invalid file error response
 */
async function handleInvalidFileError(
  helper: InteractionHelper,
  submission: APIModalSubmitInteraction,
  error: z.ZodError | SyntaxError | string,
): Promise<void> {
  const isZodError = error instanceof z.ZodError;
  const errorDetails = isZodError
    ? `\n\n-# Technical whispers from the Elder Spirits:\n||>>> -# ${z.prettifyError(error).split("\n").join("\n-# ")}||`
    : "";

  await helper.client.api.interactions.reply(submission.id, submission.token, {
    components: [
      textDisplay(
        isZodError ? MESSAGES.INVALID_FILE_HEADER : MESSAGES.JSON_PARSE_ERROR_HEADER,
        isZodError ? MESSAGES.INVALID_FILE_BODY : typeof error === "string" ? error : MESSAGES.JSON_PARSE_ERROR_BODY,
        `\n${getFileRequirementText(helper.client)}${errorDetails}`,
      ),
    ],
    flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
  });
}

/**
 * Handles confirmation for importing another user's data
 */
async function handleOtherUserConfirmation(
  helper: InteractionHelper,
  submission: APIModalSubmitInteraction,
  dataUserId: string,
): Promise<boolean> {
  const dataUser = await helper.client.api.users.get(dataUserId).catch(() => null);
  if (!dataUser) return true; // Proceed if user cannot be fetched

  const message = await helper.client.api.interactions.editReply(submission.application_id, submission.token, {
    content: [
      MESSAGES.OTHER_USER_WARNING,
      `The Spirits sense that this starlight scroll was woven by **${dataUser.global_name ?? dataUser.username}**. These are *their* planner data, not yours!`,
      "\n*While you can still absorb these memories into your own journey, the Elders want to make sure you understand what this means...*",
      "**Do you wish to proceed?**",
    ].join("\n"),
    components: [
      row(
        button({
          label: "No",
          custom_id: store.serialize(CustomId.Default, { data: "cancel", user: helper.user.id }),
        }),
        button({
          label: "Yes, I Understand.",
          custom_id: store.serialize(CustomId.Default, { data: "confirm", user: helper.user.id }),
          style: 4,
        }),
      ),
    ],
  });

  const confirmed = await awaitConfirmation(helper, message);

  await helper.client.api.interactions.editReply(submission.application_id, submission.token, {
    components: [],
  });

  return confirmed;
}

/**
 * Creates import confirmation components with user data summary
 */
function createImportConfirmationComponents(helper: InteractionHelper, data: PlannerAssetData, storageData: UserPlannerData) {
  const currencies = formatCurrencies(data, storageData);
  const unlocked = formatUnlockedItems(data);

  return [
    container(
      textDisplay("You have:", `- ${currencies}`, `- ${unlocked} unlocked.`, MESSAGES.IMPORT_NOTE),
      separator(),
      textDisplay("### This action will overwrite your current data, please confirm if you wish to proceed."),
      createConfirmationButtons(helper.user.id),
    ),
  ];
}

/**
 * Handles the import action for planner data
 */
async function handleImportAction(helper: InteractionHelper): Promise<void> {
  const modal = createImportModal(helper.int.id);
  await helper.launchModal(modal);

  const submission = await helper.client
    .awaitModal({
      filter: (i) => i.data.custom_id === "import" + helper.int.id,
      timeout: TIMEOUTS.MODAL,
    })
    .catch(() => null);

  if (!submission) {
    await helper.followUp({
      content: MESSAGES.TIMEOUT,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // Extract and fetch file
  const fileComponent = helper.client.utils.getModalComponent(submission, "data_file", ComponentType.FileUpload, true);
  const attachment = submission.data.resolved!.attachments![fileComponent.values[0]!]!;

  // 5 mb
  const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
  if (attachment.size > MAX_IMPORT_BYTES) {
    await handleInvalidFileError(helper, submission, `File larger than 5MB`);
    return;
  }

  const contents = await fetch(attachment.url).then((res) => res.text());

  try {
    // Parse and validate data
    const parsed = PlannerDataSchema.safeParse(JSON.parse(contents));
    if (!parsed.success) {
      await handleInvalidFileError(helper, submission, parsed.error);
      return;
    }

    const data = parsed.data;
    await helper.client.api.interactions.defer(submission.id, submission.token);

    // Check if data belongs to another user
    if (data.user && data.user !== helper.user.id) {
      const confirmed = await handleOtherUserConfirmation(helper, submission, data.user);
      if (!confirmed) return;
    }

    // Enrich and calculate progress
    const enrichedData = SkyPlannerData.enrichDataWithUserProgress(
      await SkyPlannerData.getSkyGamePlannerData(),
      data.storageData,
    );

    // Show confirmation dialog
    const components = createImportConfirmationComponents(helper, enrichedData, data.storageData);

    const message = await helper.client.api.interactions.editReply(submission.application_id, submission.token, {
      components,
      content: "",
      flags: MessageFlags.IsComponentsV2,
    });

    // Await final confirmation
    const confirmed = await awaitConfirmation(helper, message);

    // Remove confirmation buttons
    components[0]?.components.splice(-3, 3);

    if (!confirmed) {
      await helper.client.api.interactions.editReply(submission.application_id, submission.token, {
        components: [textDisplay("Action Cancelled"), ...components],
      });
      return;
    }

    // Save data
    const settings = await helper.client.schemas.getUser(helper.user);
    settings.plannerData = data.storageData;
    await settings.save();

    await helper.client.api.interactions.editReply(submission.application_id, submission.token, {
      components: [textDisplay("Successfully Imported Planner Data"), ...components],
    });
  } catch (err) {
    if (err instanceof SyntaxError) {
      await handleInvalidFileError(helper, submission, err);
    } else {
      throw err;
    }
  }
}

/**
 * Handles the export action for planner data
 */
async function handleExportAction(helper: InteractionHelper): Promise<void> {
  await helper.defer({ flags: MessageFlags.Ephemeral });

  const settings = await helper.client.schemas.getUser(helper.user);
  const { ref, file } = createPlannerExport(settings);

  await helper.editReply({
    components: [textDisplay(MESSAGES.IMPORT_SUCCESS), separator(), { type: ComponentType.File, file: { url: ref } }],
    flags: MessageFlags.IsComponentsV2,
    files: [file],
  });
}

/**
 * Handles the delete action for planner data
 */
async function handleDeleteAction(helper: InteractionHelper): Promise<void> {
  const modal = createDeleteModal(helper.int.id);
  await helper.launchModal(modal);

  const submission = await helper.client
    .awaitModal({
      filter: (i) => i.data.custom_id === "delete" + helper.int.id,
      timeout: TIMEOUTS.SHORT_MODAL,
    })
    .catch(() => null);

  if (!submission) return;

  await helper.client.api.interactions.defer(submission.id, submission.token, { flags: MessageFlags.Ephemeral });

  // Create backup before deletion
  const settings = await helper.client.schemas.getUser(helper.user);
  const { ref, file } = createPlannerExport(settings);

  // Delete data
  settings.plannerData = undefined;
  await settings.save();

  await helper.client.api.interactions.editReply(submission.application_id, submission.token, {
    components: [
      textDisplay(MESSAGES.DELETE_SUCCESS, "\n*All planner data has been permanently deleted*"),
      separator(),
      textDisplay(
        MESSAGES.DELETE_BACKUP,
        `\n*Before your memories faded, the Elders captured them in this scroll. Should you ever wish to return to your previous journey, simply use ${utils.mentionCommand(helper.client, "planner", "data")} (action:import) with the file below to restore everything!*`,
      ),
      { type: ComponentType.File, file: { url: ref } },
    ],
    files: [file],
    flags: MessageFlags.IsComponentsV2,
  });
}

// ============================================================================
// Exported Functions
// ============================================================================

/**
 * Maps search data to navigation state for planner navigation
 * @param data - The search result data
 * @param pdata - The planner asset data
 * @returns Navigation state or null if type is not supported
 */
export function searchHelper(
  data: { type: string; name: string; guid: string },
  pdata: PlannerAssetData,
): Omit<NavigationState, "user"> | null {
  const typeMatch = TYPE_PREFIX_REGEX.exec(data.type);
  const baseType = typeMatch?.[1] ?? data.type;

  // Simple direct mappings
  const directMappings: Record<string, DisplayTabs> = {
    Realm: DisplayTabs.Realms,
    Area: DisplayTabs.Areas,
    Spirit: DisplayTabs.Spirits,
    Season: DisplayTabs.Seasons,
    Event: DisplayTabs.Events,
    Item: DisplayTabs.Items,
    WingedLight: DisplayTabs.WingedLights,
  };

  if (baseType in directMappings) {
    return { t: directMappings[baseType]!, it: data.guid };
  }

  // Complex type mappings
  switch (baseType) {
    case "TS#": {
      const travelingSpirit = pdata.travelingSpirits.find((ts) => ts.guid === data.guid);
      if (!travelingSpirit) return null;

      const trees = [
        travelingSpirit.tree,
        ...(travelingSpirit.spirit.treeRevisions ?? []),
        ...(travelingSpirit.spirit.returns ?? []),
        ...(travelingSpirit.spirit.ts ?? []),
      ];
      const treeIndex = trees.findIndex((tree) => tree.guid === travelingSpirit.guid);
      const index = treeIndex >= 0 ? `tree${treeIndex}` : "";

      return { t: DisplayTabs.Spirits, i: index, it: travelingSpirit.spirit.guid };
    }

    case "SV":
      return { t: DisplayTabs.Spirits, d: "rs", it: data.guid };

    case "IAP": {
      const relatedShops = pdata.shops.filter((shop) => shop.iaps?.some((iap) => iap.guid === data.guid));
      return {
        t: DisplayTabs.Shops,
        d: "shops",
        f: serializeFilters(new Map([[FilterType.Shops, relatedShops.map((shop) => shop.guid)]])),
      };
    }

    case "Shop":
      return {
        t: DisplayTabs.Shops,
        d: "shops",
        f: serializeFilters(new Map([[FilterType.Shops, [data.guid]]])),
      };

    default:
      return null;
  }
}

/**
 * Main handler for planner data management actions
 * @param helper - Interaction helper instance
 * @param options - Command options resolver
 */
export async function plannerData(helper: InteractionHelper, options: InteractionOptionResolver): Promise<void> {
  const action = options.getString("action", true);

  switch (action) {
    case "import":
      await handleImportAction(helper);
      break;

    case "export":
      await handleExportAction(helper);
      break;

    case "delete":
      await handleDeleteAction(helper);
      break;

    default:
      throw new Error(`Unknown planner data action: ${action}`);
  }
}
