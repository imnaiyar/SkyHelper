import { DisplayTabs, type NavigationState, FilterType, PlannerDataSchema } from "@/types/planner";
import { PlannerDataHelper, type PlannerAssetData } from "@skyhelperbot/constants/skygame-planner";
import { serializeFilters } from "@/handlers/planner-displays/filter.manager";
import type { InteractionHelper } from "@/utils/classes/InteractionUtil";
import type { InteractionOptionResolver } from "@sapphire/discord-utilities";
import { ComponentType, MessageFlags, type APIModalInteractionResponseCallbackData } from "discord-api-types/v10";
import { emoji, z } from "zod/v4";
import { button, container, row, separator, textDisplay } from "@skyhelperbot/utils";
import { currency, emojis, SkyPlannerData, zone } from "@skyhelperbot/constants";
import { CustomId, store } from "@/utils/customId-store";
import { DateTime } from "luxon";
import type { UserSchema } from "@/types/schemas";
import Utils from "@/utils/classes/Utils";

export function searchHelper(
  data: { type: string; name: string; guid: string },
  pdata: PlannerAssetData,
): Omit<NavigationState, "user"> | null {
  // Handle type prefixes for special cases
  const typeRegex = /^(TS#|SV)/;
  const typeMatch = typeRegex.exec(data.type);
  const baseType = typeMatch ? typeMatch[1] : data.type;

  switch (baseType) {
    case "Realm":
      return { t: DisplayTabs.Realms, it: data.guid };

    case "Area":
      return { t: DisplayTabs.Areas, it: data.guid };

    case "Spirit":
      return { t: DisplayTabs.Spirits, it: data.guid };

    case "Season":
      return { t: DisplayTabs.Seasons, it: data.guid };

    case "Event":
      return { t: DisplayTabs.Events, it: data.guid };

    case "Item":
      return { t: DisplayTabs.Items, it: data.guid };

    case "TS#": {
      const t = pdata.travelingSpirits.find((ts) => ts.guid === data.guid);
      const index = t
        ? `tree${[t.tree, ...(t.spirit.treeRevisions ?? []), ...(t.spirit.returns ?? []), ...(t.spirit.ts ?? [])].findIndex((x) => x.guid === t.guid).toString()}`
        : "";
      // Traveling Spirit - navigate to Spirits tab with with ts tree selected
      return { t: DisplayTabs.Spirits, i: index, it: t?.spirit.guid };
    }

    case "SV":
      // Returning Spirit (Special Visit) - navigate to Spirits tab with RS display
      return { t: DisplayTabs.Spirits, d: "rs", it: data.guid };

    case "IAP": {
      const shops = pdata.shops.filter((s) => s.iaps?.some((i) => i.guid === data.guid));
      return { t: DisplayTabs.Shops, d: "shops", f: serializeFilters(new Map([[FilterType.Shops, shops.map((s) => s.guid)]])) };
    }
    case "Shop":
      // Shop - navigate to Shops tab with specific shop filter
      return {
        t: DisplayTabs.Shops,
        d: "shops",
        f: serializeFilters(new Map([[FilterType.Shops, [data.guid]]])),
      };

    case "WingedLight":
      return { t: DisplayTabs.WingedLights, it: data.guid };

    default:
      return null;
  }
}

export async function plannerData(helper: InteractionHelper, options: InteractionOptionResolver) {
  const action = options.getString("action", true);

  if (action === "import") {
    const modal: APIModalInteractionResponseCallbackData = {
      title: "Import Planner Data",
      custom_id: "import" + helper.int.id,
      components: [
        {
          type: ComponentType.TextDisplay,
          content: `**Please upload your exported data file**

If you're importing data from [**sky-planner.com**](https://sky-planner.com), follow these steps:
1. Go to ⚙️ [**sky-planner.com/settings**](https://sky-planner.com/settings)
2.  Select **“Export Data”**
3. Then, **upload the downloaded .json file here** to import your data`,
        },
        {
          type: ComponentType.Label,
          label: "Data File",
          description: "Please provide your savend .json file here",
          component: { type: ComponentType.FileUpload, custom_id: "data_file", max_values: 1 },
        },
      ],
    };
    await helper.launchModal(modal);
    const submission = await helper.client
      .awaitModal({
        filter: (i) => i.data.custom_id === "import" + helper.int.id,
        timeout: 3 * 6e4,
      })
      .catch(() => null);

    if (!submission) {
      await helper.followUp({
        content:
          "✨ *The stars have dimmed...* Your meditation took too long. The portal has closed! Please try summoning your data again. 🕯️",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const file = helper.client.utils.getModalComponent(submission, "data_file", ComponentType.FileUpload, true);
    const attachement = submission.data.resolved!.attachments![file.values[0]!]!;
    const contents = await fetch(attachement.url).then((b) => b.text());
    try {
      const parsed = PlannerDataSchema.safeParse(JSON.parse(contents));
      if (!parsed.success) {
        await helper.client.api.interactions.reply(submission.id, submission.token, {
          components: [
            textDisplay(
              "🌟 ***Hmm... This constellation doesn't quite align!*** 🌟",

              "It seems the Spirits are having trouble reading your starlight message. The file you've shared appears to be from a different realm! ",

              `\n🕊️ **What I need from you:**
* Your exported \`.json\` file from the  ${Utils.mentionCommand(helper.client, "planner", "data")} (action:export) command, **or**
* The \`.json\` file you received from [**sky-planner.com**](https://sky-planner.com/)
-# You can get your exported file by going to [**sky-planner.com/settings**](https://sky-planner.com/settings) and selecting **“Export Data.”**` +
                `\n\n-# Technical whispers from the Elder Spirits:\n||>>> -# ${z.prettifyError(parsed.error).split("\n").join("\n-# ")}||`,
            ),
          ],
          flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
        });
      }
      const data = parsed.data;
      await helper.client.api.interactions.defer(submission.id, submission.token);
      const dd = SkyPlannerData.enrichDataWithUserProgress(await SkyPlannerData.getSkyGamePlannerData(), data?.storageData);
      const progress = SkyPlannerData.calculateUserProgress(dd);
      const unlocked = [
        progress.items.unlocked > 0 ? `${progress.items.unlocked} items` : null,
        progress.iaps.bought > 0 ? `${progress.iaps.bought} IAPs` : null,
        progress.wingedLights.unlocked > 0 ? `${progress.wingedLights.unlocked} Winged Lights` : null,
        progress.nodes.unlocked > 0 ? `${progress.nodes.unlocked} Spirit Tree Nodes` : null,
      ]
        .filter(Boolean)
        .map((s) => `**${s}**`)
        .join(", ");
      const { candles, hearts, seasonCurrencies, eventCurrencies, ascendedCandles, giftPasses } = data!.storageData.currencies;
      const scs = Object.entries(seasonCurrencies);
      const evnts = Object.entries(eventCurrencies);
      const utils = helper.client.utils;
      const currencies = [
        `${candles} ${utils.formatEmoji(currency.c)}`,
        `${hearts} ${utils.formatEmoji(currency.h)}`,
        `${ascendedCandles} ${utils.formatEmoji(currency.ac)}`,
        `${giftPasses} ${utils.formatEmoji(emojis.spicon, "GiftPass")}`,
        scs.length
          ? "\n- Seasonal Currencies\n  - " +
            scs
              .map((s) => {
                const season = dd.seasons.find((ssn) => ssn.guid === s[0]);
                const sc = s[1];
                return `${utils.formatEmoji(season?.emoji)}: ${sc.candles} ${utils.formatEmoji(currency.sc)} ${sc.hearts} ${utils.formatEmoji(currency.sh)}`;
              })
              .join("\n  - ")
          : "",
        evnts.length
          ? "\n- Event Currencies\n  - " +
            evnts
              .map((ev) => {
                const event = dd.events.find((e) => e.guid === ev[0]);
                const { tickets } = ev[1];
                return `**${event?.shortName ?? event?.name ?? "Unknown"}**: ${tickets} ${utils.formatEmoji(currency.ec)}`;
              })
              .join("\n  - ")
          : "",
      ]
        .filter(Boolean)
        .join(" ");
      const components = [
        container(
          textDisplay(
            "You have:",
            `- ${currencies}`,
            `- ${unlocked} unlocked.`,
            "\n-# NOTE: If you are importing data from [sky-planner.com](https://sky-planner.com), some things are not saved by the bot, mainly things related to website specific preferences. These includes but not limited to: Themes, Filters, Map Markers, Closet Settings, etc.",
          ),
          separator(),
          textDisplay("### This action will overwrite your current data, please confirm if you wish to proceed."),
          row(
            button({ label: "Cancel", custom_id: store.serialize(CustomId.Default, { data: "cancel", user: helper.user.id }) }),
            button({
              label: "Confirm",
              custom_id: store.serialize(CustomId.Default, { data: "confirm", user: helper.user.id }),
              style: 4,
            }),
          ),
        ),
      ];

      const m = await helper.client.api.interactions.editReply(submission.application_id, submission.token, {
        components,
        flags: MessageFlags.IsComponentsV2,
      });

      const response = await helper.client
        .awaitComponent({
          message: m,
          filter: (i) => (i.member?.user ?? i.user!).id === helper.user.id,
          timeout: 2 * 6e4,
        })
        .catch(() => null);
      const customid = response ? store.deserialize(response.data.custom_id) : null;

      components[0]?.components.splice(-3, 3);
      if (!response || customid?.id !== CustomId.Default || customid.data.data === "cancel") {
        await helper.client.api.interactions.editReply(submission.application_id, submission.token, {
          components: [textDisplay("Action Cancelled"), ...components],
        });
        return;
      }
      const settings = await helper.client.schemas.getUser(helper.user);
      settings.plannerData = data?.storageData;
      await settings.save();
      await helper.client.api.interactions.updateMessage(response.id, response.token, {
        components: [textDisplay("Successfuly Imported Planner Data"), ...components],
      });
      await helper.client.api.interactions.followUp(response.application_id, response.token, {
        content: "Successfully Imported Planner Data",
        flags: MessageFlags.Ephemeral,
      });
      return;
    } catch (err) {
      // JSON parse failed, meaning not a valid json file
      if (err instanceof SyntaxError) {
        await helper.client.api.interactions.reply(submission.id, submission.token, {
          components: [
            textDisplay(
              "🌟 **Oops! Your constellation seems a bit jumbled...** 🌟",

              "This file seems to have lost its starlight during the journey! The Spirits cannot decipher its message. 📜✨",

              `🕊️ **What I need from you:**
* Your exported \`.json\` file from the ${Utils.mentionCommand(helper.client, "planner", "data")} (action:export) command, **or**
* The \`.json\` file you received from at [**sky-planner.com**](https://sky-planner.com/)
-# You can get your exported file by going to [**sky-planner.com/settings**](https://sky-planner.com/settings) and selecting **“Export Data.”**`,
            ),
          ],
          flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
        });
      } else {
        throw err;
      }
    }
  }

  if (action === "export") {
    await helper.defer();
    const settings = await helper.client.schemas.getUser(helper.user);
    const { ref, file } = createPlannerExport(settings);
    await helper.editReply({
      components: [
        textDisplay(
          "✨ ***Your memories have been captured in starlight!*** 🌟\n\n*The Spirits have carefully preserved your journey across the realms. Keep this scroll safe, dear Sky Kid!* 🕯️📜",
        ),
        separator(),
        { type: ComponentType.File, file: { url: ref } },
      ],
      flags: MessageFlags.IsComponentsV2,
      files: [file],
    });
    return;
  }

  if (action === "delete") {
    const modal: APIModalInteractionResponseCallbackData = {
      title: "Delete Planner Data",
      custom_id: "delete" + helper.int.id,
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

    await helper.launchModal(modal);

    const submission = await helper.client
      .awaitModal({
        filter: (i) => i.data.custom_id === "delete" + helper.int.id,
        timeout: 6e4,
      })
      .catch(() => null);

    if (!submission) return;

    await helper.client.api.interactions.defer(submission.id, submission.token);

    // Perform the deletion
    const settings = await helper.client.schemas.getUser(helper.user);
    const { ref, file } = createPlannerExport(settings);
    settings.plannerData = undefined;
    await settings.save();

    await helper.client.api.interactions.editReply(submission.application_id, submission.token, {
      components: [
        textDisplay(
          "🌌 ***Your memories have been released to the stars...*** 🌌",
          "\n*All planner data has been permanently deleted*",
        ),
        separator(),
        textDisplay(
          "📜 ***A parting gift from the Spirits...***",
          `\n*Before your memories faded, the Elders captured them in this scroll. Should you ever wish to return to your previous journey, simply use ${Utils.mentionCommand(helper.client, "planner", "data")} (action:import) with the file below to restore everything!*`,
        ),
        { type: ComponentType.File, file: { url: ref } },
      ],
      files: [file],
      flags: MessageFlags.IsComponentsV2,
    });
    return;
  }
}

function createPlannerExport(user: UserSchema) {
  const data = user.plannerData ?? PlannerDataHelper.createEmpty();
  const filename = `SkyHelper_Planner_${DateTime.now().setZone(zone).toFormat("yyyy-MM-dd")}.json`;
  return {
    ref: "attachment://" + filename,
    file: { name: filename, data: Buffer.from(JSON.stringify({ version: "1.1.0", storageData: data })) },
  };
}
