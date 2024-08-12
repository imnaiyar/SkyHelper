import config from "#src/config";
import { SpiritsData } from "#src/libs/types";
import { Button } from "#structures";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageEditOptions } from "discord.js";
import type { getTranslator } from "#src/i18n";
export default {
  data: {
    name: "spirit_emote",
  },
  async execute(interaction, t, client) {
    const [, type, value] = interaction.customId.split("-"),
      data = client.spiritsData[value];
    if (!data) {
      return void (await interaction.reply({ content: "Something went wrong! No data found", ephemeral: true }));
    }
    await interaction.deferUpdate();
    const message = interaction.message,
      orgData = {
        content: message.content,
        embeds: message.embeds,
        components: message.components,
        files: message.attachments.map((m) => m.url),
      },
      response = type === "expression" ? getExpressionResponse(data, t) : getCommonResponse(type, data),
      reply = await interaction.editReply(response),
      collector = reply.createMessageComponentCollector({
        filter: (i) => ["spirit_exprsn_back", "emote_nav"].includes(i.customId.split("-")[0]),
        idle: 90_000,
      });

    collector.on("collect", async (i) => {
      if (!i.isButton()) return;
      const [baseId, index] = i.customId.split("-");
      switch (baseId) {
        case "spirit_exprsn_back":
          await i.update(orgData);
          collector.stop("Expression Back");
          break;
        case "emote_nav":
          await i.update(getExpressionResponse(data, t, parseInt(index)));
          break;
      }
    });

    collector.on("end", async (_k, reason) => {
      if (reason === "Expression Back") return;
      const msg = await interaction.fetchReply();
      const components = msg.components.map((row) => {
        const actionRow = ActionRowBuilder.from(row);
        actionRow.components.forEach((com) => (com as unknown as any).setDisabled(true));
        return actionRow;
      }) as ActionRowBuilder<ButtonBuilder>[];
      await interaction.editReply({ components });
    });
  },
} satisfies Button;

const getCommonResponse = (type: string, data: SpiritsData): MessageEditOptions => {
  if (type === "call") {
    return {
      content: `### ${data.call!.icon} [${
        data.call!.title
      }](<https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}#Call>)\n${
        data.name
      } call preview (Normal and Deep Call)\n**Sound ON** <a:sound_on:1207073334853107832>.`,
      embeds: [],
      files: [`${config.CDN_URL}/${data.call!.image}`],
      // prettier-ignore
      components: [new ActionRowBuilder().addComponents(getBackBtn(data.call!.icon)) as ActionRowBuilder<ButtonBuilder>],
    };
  } else {
    const stanceEmbed = new EmbedBuilder()
      .setTitle(`${data.stance!.icon} ${data.stance!.title}`)
      .setURL(`https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}#Stance`)
      .setDescription(`Stance preview (Standing, sitting, kneeling and laying).`)
      .setImage(`${config.CDN_URL}/${data.stance!.image}`)
      .setAuthor({ name: `Stance - ${data.name}` });
    return {
      embeds: [stanceEmbed],
      components: [new ActionRowBuilder<ButtonBuilder>().addComponents(getBackBtn(data.stance!.icon))],
    };
  }
};

const getExpressionResponse = (data: SpiritsData, t: ReturnType<typeof getTranslator>, page: number = 1) => {
  const exprsn = data.emote ? data.emote : data.action;
  const total = exprsn!.level.length - 1;

  const emote = exprsn!.level[page - 1];

  const embed = new EmbedBuilder()
    .setAuthor({
      name: `${data.emote ? t("commands.SPIRITS.RESPONSES.BUTTONS.EMOTE") : t("commands.SPIRITS.RESPONSES.BUTTONS.ACTION")} - ${data.name}`,
    })
    .setTitle(`${exprsn!.icon} ${emote.title}`)
    .setURL(
      `https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}#${
        data.emote ? "Expression" : "Friend_Action"
      }`,
    )
    .setImage(`${config.CDN_URL}/${emote.image}`);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("emote_nav" + `-${page - 1}`)
      .setLabel(`⬅️ ${exprsn!.level[page - 2]?.title.slice(-7) || emote.title.slice(-7)}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === 1),
    getBackBtn(exprsn!.icon),
    new ButtonBuilder()
      .setCustomId("emote_nav" + `-${page + 1}`)
      .setLabel(`${exprsn!.level[page]?.title.slice(-7) || emote.title.slice(-7)} ➡️`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page === total + 1),
  );

  return {
    embeds: [embed],
    components: [row],
  };
};

const getBackBtn = (emote: string): ButtonBuilder =>
  new ButtonBuilder().setCustomId("spirit_exprsn_back").setEmoji(emote).setLabel("Back").setStyle(ButtonStyle.Danger);
