import { getTranslator } from "#bot/i18n";
import {
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  WebhookClient,
  ChatInputCommandInteraction,
  ButtonStyle,
  ModalSubmitInteraction,
} from "discord.js";
const suggWb = process.env.SUGGESTION ? new WebhookClient({ url: process.env.SUGGESTION }) : undefined;
import pkg from "#root/package.json" with { type: "json" };
const version = pkg.version;
export async function getSuggestion(interaction: ChatInputCommandInteraction, t: ReturnType<typeof getTranslator>) {
  const client = interaction.client;
  const attachment = interaction.options.getAttachment("attachment");
  const modal = new ModalBuilder()
    .setCustomId("suggestionModal" + `-${interaction.id}`)
    .setTitle(t("commands:UTILS.RESPONSES.SUGGESTION_MODAL_TITLE"));

  const fields = {
    title: new TextInputBuilder()
      .setCustomId("title")
      .setLabel(t("commands:UTILS.RESPONSES.SUGGESTION_TITLE"))
      .setPlaceholder(t("commands:UTILS.RESPONSES.TITLE_PLACEHOLDER"))
      .setStyle(TextInputStyle.Short),
    suggestion: new TextInputBuilder()
      .setCustomId("suggestion")
      .setLabel(t("commands:UTILS.RESPONSES.SUGGESTION"))
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder(t("commands:UTILS.RESPONSES.SUGGESTION_PLACEHOLDER")),
  };

  const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(fields.title);
  const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(fields.suggestion);

  modal.addComponents(firstActionRow, secondActionRow);

  await interaction.showModal(modal);

  const filter = (i: ModalSubmitInteraction) => i.customId === `suggestionModal-${interaction.id}`;
  const modalInt = await interaction.awaitModalSubmit({ filter, time: 2 * 6e4 }).catch((err) => {
    if (err.code === "InteractionCollectorError") {
      interaction.followUp({ content: "Did not recieve any response. Cancelling...", ephemeral: true }).catch(() => {});
      return null;
    } else {
      throw err;
    }
  });
  if (!modalInt) return;
  const ti = modalInt.fields.getTextInputValue("title");
  const sugg = modalInt.fields.getTextInputValue("suggestion");
  const embed = new EmbedBuilder()
    .setAuthor({
      name: `${modalInt.user.username} made a suggestion`,
      iconURL: modalInt.user.displayAvatarURL(),
    })
    .addFields({ name: `Title`, value: ti }, { name: `Suggestion/Bug Report/ Others`, value: sugg })
    .setFooter({
      text: `SkyHelper`,
      iconURL: client.user.displayAvatarURL(),
    });
  if (attachment) {
    embed.setImage(attachment.url);
  }
  modalInt
    .reply({
      content: t("commands:UTILS.RESPONSES.RECIEVED"),
      embeds: [embed],
      ephemeral: true,
    })
    .then(() => {
      embed.addFields({
        name: "Server",
        value: `${modalInt.guild?.name || "Unknown"} (${modalInt.guild?.id || "Unknown"})`,
      });

      suggWb?.send({ embeds: [embed] });
    });
}

export async function getChangelog(interaction: ChatInputCommandInteraction) {
  const _comMen = (command: string, sub?: string) => {
    const com = interaction.client.application.commands.cache.find((cm) => cm.name === command);
    return `</${com!.name}${sub ? ` ${sub}` : ""}:${com!.id}>`;
  };
  const changes = [
    `### Linked Role Connection
Added linked role connection with the SkyHelper bot. Users can now connect their Sky: CoTL profile with the bot and get a role based on their preferences.
This chosen profile will be displayed on their Discord profile.
- Learn more about linked roles [here](https://docs.skyhelper.xyz/linked-role/about>).
- Learn how to enable linked roles [here](https://docs.skyhelper.xyz/linked-role/how-to-enable).
- Learn how to get linked roles [here](https://docs.skyhelper.xyz/linked-role/how-to-link).

-# Read about more detailed/previous changelogs [here](https://docs.skyhelper.xyz/changelogs)`,
  ];
  const { client } = interaction;
  let page = 0;
  const total = changes.length - 1;
  const getEmbed = () => {
    const embed = new EmbedBuilder()
      .setAuthor({ name: `Changelog`, iconURL: client.user.displayAvatarURL() })
      .setColor("Gold")
      .setTitle(`Changelog v${version}`)
      .setDescription(changes[page])
      .setFooter({ text: `v${version} - Page ${page + 1}/${total + 1}` });
    const btns = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("chng-prev")
        .setEmoji("1207594669882613770")
        .setDisabled(page === 0)
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setEmoji("1222364414037200948")
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("sidbwkss")
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId("chng-next")
        .setEmoji("1207593237544435752")
        .setStyle(ButtonStyle.Success)
        .setDisabled(page === total),
    );
    if (total) {
      return { embeds: [embed], components: [btns] };
    } else {
      return { embeds: [embed] };
    }
  };
  const msg = await interaction.reply({ ...getEmbed(), ephemeral: true, fetchReply: true });
  if (!total) return;
  const collector = msg.createMessageComponentCollector({
    filter: (i) => i.user.id === interaction.user.id,
    idle: 3 * 60 * 1000,
  });
  collector.on("collect", async (int) => {
    const Id = int.customId;
    if (Id === "chng-next") {
      page++;
      const respn = getEmbed();
      await int.update(respn);
    }
    if (Id === "chng-prev") {
      page--;
      const respn = getEmbed();
      await int.update(respn);
    }
  });
  collector.on("end", async () => {
    await interaction.editReply({ components: [] });
  });
}
