import type { SkyHelper } from "@/structures";
import { buildCalendarResponse } from "@/utils/classes/Embeds";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import Utils from "@/utils/classes/Utils";
import { ComponentType, MessageFlags, type APIEmbed, type APIModalSubmitInteraction } from "@discordjs/core";
import {
  calculateCurrencyBreakdown,
  enrichDataWithUserProgress,
  formatCurrencies,
  getSkyGamePlannerData,
  PlannerDataHelper,
} from "@skyhelperbot/constants/skygame-planner";
import { resolveColor } from "@skyhelperbot/utils";
import { DateTime } from "luxon";
import { handlePlannerNavigation } from "./planner.js";
import { DisplayTabs } from "@/types/planner";

export async function handleShardsCalendarModal(helper: InteractionHelper) {
  const date = Utils.getTextInput(helper.int as APIModalSubmitInteraction, "date-month", true);
  const dateRegex = /^(0[1-9]|1[0-2])-\d{4}$/;
  const [month, year] = date.value.split("-").map(Number);
  const testDate = DateTime.fromObject({ month, year });
  if (!dateRegex.test(date.value) || !testDate.isValid) {
    await helper.reply({
      content: helper.t("commands:SHARDS_CALENDAR.RESPONSES.INVALID_DATE", {
        DATE: date.value,
      }),
      flags: 64,
    });
    return;
  }

  const data = buildCalendarResponse(helper.t, helper.client, helper.user.id, { month, year, index: 0 });
  await helper.update({ ...data, flags: MessageFlags.IsComponentsV2 });
  return;
}

export async function handleErrorModal(helper: InteractionHelper) {
  await helper.reply({
    content: helper.t("errors:ERROR_MODAL.SUCCESS"),
    flags: 64,
  });
  const { int, client } = helper as { int: APIModalSubmitInteraction; client: SkyHelper };
  const commandUsed = client.utils.getTextInput(int, "commandUsed")?.value;
  const whatHappened = client.utils.getTextInput(int, "whatHappened")?.value;
  const errorId = client.utils.getTextInput(int, "errorId")?.value;
  const guild = client.guilds.get(int.guild_id ?? "");
  const embed: APIEmbed = {
    title: "BUG REPORT",
    fields: [
      { name: "Command Used", value: `\`${commandUsed}\`` },
      {
        name: "User",
        value: `${helper.user.username} \`[${helper.user.id}]\``,
      },
      {
        name: "Server",
        value: `${guild?.name} \`[${int.guild?.id}]\``,
      },
      { name: "What Happened", value: `${whatHappened}` },
    ],
    color: resolveColor("Blurple"),
    timestamp: new Date().toISOString(),
  };
  const errorWb = process.env.BUG_REPORTS ? Utils.parseWebhookURL(process.env.BUG_REPORTS) : null;
  if (errorWb) {
    await client.api.webhooks.execute(errorWb.id, errorWb.token, {
      username: "Bug Report",
      content: `Error ID: \`${errorId}\``,
      embeds: [embed],
    });
  }
}

// TODO: Handle this later
export async function breakdownModalDisplay(helper: InteractionHelper, type: string) {
  const settings = await helper.client.schemas.getUser(helper.user);
  const data = enrichDataWithUserProgress(await getSkyGamePlannerData(), settings.plannerData);
  const breakdowns = calculateCurrencyBreakdown(data);
}

export async function handleCurrencyModifyModal(helper: InteractionHelper) {
  const { client, int } = helper;
  if (!helper.isModalSubmit(int)) throw new Error("Not modal submit");
  await helper.deferUpdate();

  const basicCurrencies = ["candles", "hearts", "ac"] as const;
  const [candles, hearts, acs] = basicCurrencies.map((id) =>
    parseFloat(client.utils.getModalComponent(int, id, ComponentType.TextInput, true).value),
  );
  const seasonComp = client.utils.getModalComponent(int, (id) => id.startsWith("season/"), ComponentType.TextInput);
  const seasonData = seasonComp
    ? {
        guid: seasonComp.custom_id.split("/")[1]!,
        values: seasonComp.value.split("/").map((num) => parseInt(num)) as [number, number],
      }
    : null;

  const eventComp = client.utils.getModalComponent(int, (id) => id.startsWith("event/"), ComponentType.TextInput);
  const eventData = eventComp
    ? {
        guid: eventComp.custom_id.split("/")[1]!,
        tickets: parseInt(eventComp.value),
      }
    : null;

  const validations = [
    { name: "candles", value: candles },
    { name: "hearts", value: hearts },
    { name: "ac", value: acs },
    ...(seasonData ? [{ name: "season currency", value: seasonData.values[0] + seasonData.values[1] }] : []),
    ...(eventData ? [{ name: "event currency", value: eventData.tickets }] : []),
  ];

  const invalidFields = validations.filter((v) => Number.isNaN(v.value)).map((v) => v.name);

  const settings = await client.schemas.getUser(helper.user);
  const plannerData = settings.plannerData ?? PlannerDataHelper.createEmpty();

  if (!Number.isNaN(candles)) plannerData.currencies.candles = candles ?? 0;
  if (!Number.isNaN(hearts)) plannerData.currencies.hearts = hearts ?? 0;
  if (!Number.isNaN(acs)) plannerData.currencies.ascendedCandles = acs ?? 0;

  if (seasonData && !Number.isNaN(seasonData.values[0]) && !Number.isNaN(seasonData.values[1])) {
    plannerData.currencies.seasonCurrencies[seasonData.guid] = {
      candles: seasonData.values[0],
      hearts: seasonData.values[1],
    };
    settings.markModified("plannerData.currencies.seasonCurrencies");
  }

  if (eventData && !Number.isNaN(eventData.tickets)) {
    plannerData.currencies.eventCurrencies[eventData.guid] = {
      tickets: eventData.tickets,
    };
    settings.markModified("plannerData.currencies.eventCurrencies");
  }
  await settings.save();

  const [skyData, navData] = await Promise.all([
    getSkyGamePlannerData(),
    handlePlannerNavigation({ t: DisplayTabs.Home }, helper.user, client),
  ]);

  const formatted = formatCurrencies(skyData, plannerData);

  await helper.editReply(navData);
  await helper.followUp({
    content: [
      "# Updated Currencies:\n",
      `You have:\n${formatted}`,
      invalidFields.length &&
        `-# ⚠️ The following currencies were not updated due to invalid numbers: ${invalidFields.join(", ")}`,
    ]
      .filter(Boolean)
      .join("\n\n"),
    flags: 64,
  });
}
