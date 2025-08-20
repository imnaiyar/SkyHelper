import type { SkyHelper } from "@/structures";
import { buildCalendarResponse } from "@/utils/classes/Embeds";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import Utils from "@/utils/classes/Utils";
import { MessageFlags, type APIEmbed, type APIModalSubmitInteraction } from "@discordjs/core";
import { resolveColor } from "@skyhelperbot/utils";
import { DateTime } from "luxon";

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
  const guild = client.guilds.get(int.guild_id || "");
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
