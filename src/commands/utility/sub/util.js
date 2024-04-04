import {
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  WebhookClient,
} from 'discord.js';

const suggWb = process.env.SUGGESTION ? new WebhookClient({ url: process.env.SUGGESTION }) : undefined;
async function getSuggestion(interaction) {
  const { client } = interaction;
  const attachment = interaction.options.getAttachment("attachment");
  const modal = new ModalBuilder().setCustomId("suggestionModal").setTitle("Contact Us");

  const fields = {
    title: new TextInputBuilder()
      .setCustomId("title")
      .setLabel("Title")
      .setPlaceholder("Title for the suggestion")
      .setStyle(TextInputStyle.Short),
    suggestion: new TextInputBuilder()
      .setCustomId("suggestion")
      .setLabel("Suggestion/Bug Report/Others")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Explain in brief."),
  };

  const firstActionRow = new ActionRowBuilder().addComponents(fields.title);
  const secondActionRow = new ActionRowBuilder().addComponents(fields.suggestion);

  modal.addComponents(firstActionRow, secondActionRow);

  await interaction.showModal(modal);

  const filter = (interaction) => interaction.customId === "suggestionModal";
  interaction
    .awaitModalSubmit({ filter, time: 2 * 60000 })
    .then((interaction) => {
      const ti = interaction.fields.getTextInputValue("title");
      const sugg = interaction.fields.getTextInputValue("suggestion");
      const embed = new EmbedBuilder()
        .setAuthor({
          name: `${interaction.user.username} made a suggestion`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .addFields({ name: `Title`, value: ti }, { name: `Suggestion/Bug Report/ Others`, value: sugg })
        .setFooter({
          text: `SkyHelper`,
          iconURL: client.user.displayAvatarURL(),
        });
      if (attachment) {
        embed.setImage(attachment.url);
      }
      interaction
        .reply({
          content: `Your message is received. Here's a preview!`,
          embeds: [embed],
          ephemeral: true,
        })
        .then(() => {
          embed.addFields({
            name: "Server",
            value: `${interaction.guild.name} (${interaction.guild.id})`,
          });

          suggWb.send({ embeds: [embed] });
        });
    })
    .catch(console.error);
}

async function getChangelog(interaction) {
  const comMen = (command, sub) => {
    const com = interaction.client.application.commands.cache.find((cm) => cm.name === command);
    return `</${com.name}${sub ? ` ${sub}` : ""}:${com.id}>`;
  };
  const changes = [
    `### New Commands:
- **${comMen("spirits")}**: Search for detailed information about any spirits including trees, locations, realms, and emote previews.
- **${comMen("traveling-spirit")}**: Access information about current or upcoming traveling spirits. If the current traveling spirit is unknown, it will provide an approximate return date for the next one.
- **${comMen("guides")}**: Merged with \`seasonal-guides\` and now includes a \`realms\` subcommand for realm-based guides. An \`events\` guide is also planned for future addition (IDK when I'll add it tho lol).
  - **${comMen("guides", "seasonal")}**:  various seasonal guides.
  - **${comMen("guides", "realms")}**: various realms guides.
- **${comMen("reminders")}**: Set up reminders for various in-game times such as grandma, reset, and turtle events. (Requires \`Manage Webhook\` permission). Daily quest reminder is still a work in progress.
- Not yet added but a quiz game command is also work in progress based on Sky: CoTL (need to just add the question), will probably add them in the next update.
`,
    `### Other Major Changes:
- Transitioned Live Updates feature to utilize webhooks instead of channel IDs. It will require reconfiguration to function properly.
- Introduced reminders feature, enabling users to receive notifications for various in-game times.
- Restructured the guides command to include options for reducing the number of choices required after execution.

*For previous/detailed changelogs, checkout the release page on GitHub **[here](https://github.com/imnaiyar/SkyHelper/releases)**.*`,
  ];
  const { client } = interaction;
  let page = 0;
  let total = changes.length - 1;
  const getEmbed = () => {
    const embed = new EmbedBuilder()
      .setAuthor({ name: `Changelog`, iconURL: client.user.displayAvatarURL() })
      .setColor("Gold")
      .setTitle(`Changelog v5.5.0`)
      .setDescription(changes[page])
      .setImage("https://cdn.imnaiyar.site/warning-img.png")
      .setFooter({ text: `v5.0.0 - Page ${page + 1}/${total + 1}` });
    const btns = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("chng-prev")
        .setEmoji("1207594669882613770")
        .setDisabled(page === 0)
        .setStyle("3"),
      new ButtonBuilder().setEmoji("1222364414037200948").setStyle("2").setCustomId("sidbwkss").setDisabled(true),
      new ButtonBuilder()
        .setCustomId("chng-next")
        .setEmoji("1207593237544435752")
        .setStyle("3")
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

export default { getSuggestion, getChangelog };
