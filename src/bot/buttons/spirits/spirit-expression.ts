import config from "#bot/config";
import type { SpiritsData } from "#libs/constants/spirits-datas/type";
import { type Button } from "#structures";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, type MessageEditOptions } from "discord.js";
import type { getTranslator } from "#bot/i18n";
export default {
  data: {
    name: "spirit_expression",
  },
  async execute(interaction, t, client) {
    const [, value] = interaction.customId.split("-"),
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
      response =
        data.expression!.type === "Stance" || data.expression?.type === "Call"
          ? getCommonResponse(data)
          : getExpressionResponse(data, t),
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
      await interaction.editReply(orgData).catch(() => {});
    });
  },
} satisfies Button;

const getCommonResponse = (data: SpiritsData): MessageEditOptions => {
  // prettier-ignore
  if (!data.expression) throw new Error(`Expected Spirit expression to be present, but recieved ${typeof data.expression} [${data.name}]`);
  const expression = data.expression;
  if (expression.type === "Call") {
    return {
      content: `### ${expression.icon} [${
        expression.level[0].title
      }](<https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}#Call>)\n${
        data.name
      } call preview (Normal and Deep Call)\n**Sound ON** <a:sound_on:1207073334853107832>.`,
      embeds: [],
      files: [`${config.CDN_URL}/${expression.level[0].image}`],
      // prettier-ignore
      components: [new ActionRowBuilder().addComponents(getBackBtn(expression.icon)) as ActionRowBuilder<ButtonBuilder>],
    };
  } else {
    const stanceEmbed = new EmbedBuilder()
      .setTitle(`${expression.icon} ${expression.level[0].title}`)
      .setURL(`https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}#Stance`)
      .setDescription(`Stance preview (Standing, sitting, kneeling and laying).`)
      .setImage(`${config.CDN_URL}/${expression.level[0].image}`)
      .setAuthor({ name: `Stance - ${data.name}` });
    return {
      embeds: [stanceEmbed],
      components: [new ActionRowBuilder<ButtonBuilder>().addComponents(getBackBtn(expression.icon))],
    };
  }
};

const getExpressionResponse = (data: SpiritsData, t: ReturnType<typeof getTranslator>, page: number = 1) => {
  // prettier-ignore
  if (!data.expression) throw new Error(`Expected Spirit expression to be present, but recieved ${typeof data.expression} [${data.name}]`);
  const exprsn = data.expression;
  const total = exprsn!.level.length - 1;

  const emote = exprsn!.level[page - 1];

  const embed = new EmbedBuilder()
    .setAuthor({
      name: `${exprsn.icon ? t("commands:SPIRITS.RESPONSES.BUTTONS.EMOTE") : t("commands:SPIRITS.RESPONSES.BUTTONS.ACTION")} - ${data.name}`,
    })
    .setTitle(`${exprsn!.icon} ${emote.title}`)
    .setURL(
      `https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}#${
        exprsn.type === "Emote" ? "Expression" : "Friend_Action"
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
