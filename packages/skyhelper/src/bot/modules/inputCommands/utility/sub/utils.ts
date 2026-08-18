import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import Utils from "@/utils/classes/Utils";
import {
  ComponentType,
  MessageFlags,
  type APIEmbed,
  type APIModalInteractionResponseCallbackData,
  type APIModalSubmitInteraction,
  type APISelectMenuOption,
} from "@discordjs/core";
import type { InteractionOptionResolver } from "@sapphire/discord-utilities";
import { container, row, separator, textDisplay } from "@skyhelperbot/utils";
import { readFile } from "node:fs/promises";

const pkg = await readFile("package.json", "utf-8").then((res) => JSON.parse(res) as Record<string, any>);
const currentVersion = pkg.version;

// #region suggestion
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
  const modalInt = await client.awaitModal({ filter, timeout: 2 * 6e4 }).catch((err: any) => {
    if (err.message === "timeout") {
      helper.followUp({ content: helper.t("features:utils.TIMEOUT"), flags: 64 }).catch(() => {});
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
  const guild = client.guilds.get(modalInt.guild_id ?? "");
  await modalHelper
    .reply({
      content: t("commands:UTILS.RESPONSES.RECIEVED"),
      embeds: [embed],
      flags: 64,
    })
    .then(() => {
      embed.fields?.push({
        name: "Server",
        value: `${guild?.name ?? "Unknown"} (${modalInt.guild_id ?? "Unknown"})`,
      });
      const wb = process.env.SUGGESTION ? client.utils.parseWebhookURL(process.env.SUGGESTION) : null;
      if (wb) client.api.webhooks.execute(wb.id, wb.token, { embeds: [embed] }).catch(client.logger.error);
    });
}

// #region changelog
export async function getChangelog(tag?: string) {
  const access_token = process.env.GITHUB_ACCESS_TOKEN;

  const releases = (await fetch("https://api.github.com/repos/imnaiyar/SkyHelper/releases", {
    headers: access_token ? { Authorization: `Bearer ${access_token}` } : {},
  }).then((res) => res.json())) as Array<{ tag_name: string; body: string; published_at: string }>;

  const release = releases.find((r) => r.tag_name === (tag ?? `skyhelper@${currentVersion}`));

  if (!release) return null;

  const version = release.tag_name.replace("skyhelper@", "v");

  const components = container(
    textDisplay(`# Release \`${version}\``, `-# Released on: ${Utils.time(new Date(release.published_at), "d")}`),
    separator(true, 1),
    textDisplay(
      release.body
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

  // release version select
  const release_select: APISelectMenuOption[] = releases
    .filter((r) => r.tag_name.startsWith("skyhelper"))
    .map((r) => ({
      // strip `skyhelper@` from tag name so only version tag remains, like `v7.9.0`
      label: r.tag_name.replace("skyhelper@", "v"),
      value: r.tag_name,
      default: release.tag_name === r.tag_name,
      description: new Date(r.published_at).toDateString(),
    }))
    .slice(0, 25);

  return {
    components: [
      components,
      row({
        type: ComponentType.StringSelect,
        custom_id: Utils.store.serialize(Utils.customId.RELEASE_SELECT, { user: null }),
        options: release_select,
      }),
    ],
    flags: MessageFlags.IsComponentsV2,
  };
}
