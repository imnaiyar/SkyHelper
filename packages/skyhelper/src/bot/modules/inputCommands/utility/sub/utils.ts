import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import { CustomId } from "@/utils/customId-store";
import {
  ComponentType,
  MessageFlags,
  type APIActionRowComponent,
  type APIButtonComponent,
  type APIEmbed,
  type APIModalInteractionResponseCallbackData,
  type APIModalSubmitInteraction,
} from "@discordjs/core";
import type { InteractionOptionResolver } from "@sapphire/discord-utilities";
import { container, separator, textDisplay } from "@skyhelperbot/utils";
import { readFile } from "node:fs/promises";

const pkg = await readFile("package.json", "utf-8").then((res) => JSON.parse(res));
const version = pkg.version;
export async function getSuggestion(helper: InteractionHelper, options: InteractionOptionResolver) {
  const { client, t } = helper;
  const attachment = options.getAttachment("attachment");
  const modal: APIModalInteractionResponseCallbackData = {
    custom_id: `suggestionModal-${helper.int.id}`,
    title: t("commands:UTILS.RESPONSES.SUGGESTION_MODAL_TITLE"),
    components: [
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "title",
            label: t("commands:UTILS.RESPONSES.SUGGESTION_TITLE"),
            placeholder: t("commands:UTILS.RESPONSES.TITLE_PLACEHOLDER"),
            style: 1,
          },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 4,
            custom_id: "suggestion",
            label: t("commands:UTILS.RESPONSES.SUGGESTION"),
            style: 2,
            placeholder: t("commands:UTILS.RESPONSES.SUGGESTION_PLACEHOLDER"),
          },
        ],
      },
    ],
  };

  await helper.launchModal(modal);

  const filter = (i: APIModalSubmitInteraction) => i.data.custom_id === `suggestionModal-${helper.int.id}`;
  const modalInt = await client.awaitModal({ filter, timeout: 2 * 6e4 }).catch((err) => {
    if (err.message === "timeout") {
      helper.followUp({ content: "Did not recieve any response. Cancelling...", flags: 64 }).catch(() => {});
      return null;
    } else {
      throw err;
    }
  });
  if (!modalInt) return;
  const modalHelper = new InteractionHelper(modalInt, client);
  const ti = client.utils.getTextInput(modalInt, "title", true).value;
  const sugg = client.utils.getTextInput(modalInt, "suggestion", true).value;
  const embed: APIEmbed = {
    author: {
      name: `${modalHelper.user.username} made a suggestion`,
      icon_url: client.utils.getUserAvatar(modalHelper.user),
    },
    fields: [
      { name: "Title", value: ti },
      { name: "Suggestion/Bug Report/ Others", value: sugg },
    ],
    footer: {
      text: "SkyHelper",
      icon_url: client.utils.getUserAvatar(client.user),
    },
  };
  if (attachment) {
    embed.image = { url: attachment.url };
  }
  const guild = client.guilds.get(modalInt.guild_id || "");
  modalHelper
    .reply({
      content: t("commands:UTILS.RESPONSES.RECIEVED"),
      embeds: [embed],
      flags: 64,
    })
    .then(() => {
      embed.fields?.push({
        name: "Server",
        value: `${guild?.name || "Unknown"} (${modalInt.guild_id || "Unknown"})`,
      });
      const wb = process.env.SUGGESTION ? client.utils.parseWebhookURL(process.env.SUGGESTION) : null;
      if (wb) client.api.webhooks.execute(wb.id, wb.token, { embeds: [embed] }).catch(client.logger.error);
    });
}

export async function getChangelog(helper: InteractionHelper) {
  await helper.defer();
  const releases = await fetch("https://api.github.com/repos/imnaiyar/SkyHelper/releases").then((res) => res.json());

  const latest = releases.find((r: any) => r.tag_name === `skyhelper@${version}`);

  if (!latest) {
    await helper.editReply({
      content: "Sorry! No changelog found for this version. Please try again later",
    });
    return;
  }

  const components = container(
    textDisplay(`# Release \`v${version}\``, `-# Released on: ${helper.client.utils.time(new Date(latest.published_at), "d")}`),
    separator(true, 1),
    textDisplay(
      (latest.body as string)
        .replace(/by @\w+/g, "")
        .replace(/\(#\d+\)/g, "")
        .replace(/^\s*Full Changelog:.*$/gm, "")
        .split("\n")
        .map((line) => line.trimEnd())
        .join("\n")
        .replace(/\n{1,}/g, "\n")
        .trim(),
    ),
    separator(true, 1),
    textDisplay("-# See the full/previous releases on [GitHub](https://github.com/imnaiyar/SkyHelper/releases)"),
  );
  await helper.editReply({ components: [components], flags: MessageFlags.IsComponentsV2 });
}
