import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import {
  ComponentType,
  type APIActionRowComponent,
  type APIButtonComponent,
  type APIEmbed,
  type APIModalInteractionResponseCallbackData,
  type APIModalSubmitInteraction,
} from "@discordjs/core";
import type { InteractionOptionResolver } from "@sapphire/discord-utilities";
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
  const fields = modalInt.data.components;
  const ti = fields.find((f) => f.components[0].custom_id === "title")!.components[0].value;
  const sugg = fields.find((f) => f.components[0].custom_id === "suggestion")!.components[0].value;
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
  const changes = [
    `### Linked Role Connection
Added linked role connection with the SkyHelper bot. Users can now connect their Sky: CoTL profile with the bot and get a role based on their preferences.
This chosen profile will be displayed on their Discord profile.
- Learn more about linked roles [here](https://docs.skyhelper.xyz/linked-role/about>).
- Learn how to enable linked roles [here](https://docs.skyhelper.xyz/linked-role/how-to-enable).
- Learn how to get linked roles [here](https://docs.skyhelper.xyz/linked-role/how-to-link).

-# Read about more detailed/previous changelogs [here](https://docs.skyhelper.xyz/changelogs)`,
  ];
  const { client } = helper;
  let page = 0;
  const total = changes.length - 1;
  const getEmbed = () => {
    const embed: APIEmbed = {
      author: { name: `Changelog`, icon_url: client.utils.getUserAvatar(client.user) },
      color: 0xffd700, // Gold color
      title: `Changelog v${version}`,
      description: changes[page],
      footer: { text: `v${version} - Page ${page + 1}/${total + 1}` },
    };
    const btns: APIActionRowComponent<APIButtonComponent> = {
      type: 1,
      components: [
        {
          type: 2,
          custom_id: client.utils.encodeCustomId({ id: "chng-prev", user: helper.user.id }),
          emoji: { id: "1207594669882613770" },
          style: 3, // Success style
          disabled: page === 0,
        },
        {
          type: 2,
          emoji: { id: "1222364414037200948" },
          style: 2, // Secondary style
          custom_id: "sidbwkss",
          disabled: true,
        },
        {
          type: 2,
          custom_id: client.utils.encodeCustomId({ id: "chng-next", user: helper.user.id }),
          emoji: { id: "1207593237544435752" },
          style: 3, // Success style
          disabled: page === total,
        },
      ],
    };
    if (total) {
      return { embeds: [embed], components: [btns] };
    } else {
      return { embeds: [embed] };
    }
  };
  const msg = await helper.reply({ ...getEmbed(), flags: 64 }, true);
  if (!total) return;
  const collector = client.componentCollector({
    filter: (i) => (i.member?.user || i.user)!.id === helper.user.id,
    idle: 3 * 60 * 1000,
    componentType: ComponentType.Button,
    message: msg,
  });
  collector.on("collect", async (int) => {
    const compHelper = new InteractionHelper(int, client);
    const Id = client.utils.parseCustomId(int.data.custom_id).id;
    if (Id === "chng-next") {
      page++;
      await compHelper.update(getEmbed());
    }
    if (Id === "chng-prev") {
      page--;
      await compHelper.update(getEmbed());
    }
  });
  collector.on("end", async () => {
    await helper.editReply({ components: [] });
  });
}
