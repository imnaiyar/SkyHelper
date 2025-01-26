import config from "@/config";
import type { SpiritsData } from "@skyhelperbot/constants/spirits-datas";
import { type Button } from "@/structures";
import type { getTranslator } from "@/i18n";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import {
  ButtonStyle,
  ComponentType,
  type APIActionRowComponent,
  type APIButtonComponent,
  type APIEmbed,
  type APIInteractionResponseCallbackData,
} from "@discordjs/core";
import type { RawFile } from "@discordjs/rest";
import Utils from "@/utils/classes/Utils";
export default {
  data: {
    name: "spirit_expression",
  },
  async execute(interaction, t, helper) {
    const { client } = helper;
    const { user } = helper;
    const value = client.utils.parseCustomId(interaction.data.custom_id)!.spirit,
      data = client.spiritsData[value];
    if (!data) {
      return void (await helper.reply({ content: "Something went wrong! No data found", flags: 64 }));
    }
    await helper.deferUpdate();
    const message = interaction.message,
      orgData = {
        content: message.content,
        embeds: message.embeds,
        components: message.components,
        files: message.attachments.map((m) => ({ data: m.url, name: m.filename })),
      },
      response =
        data.expression!.type === "Stance" || data.expression?.type === "Call"
          ? getCommonResponse(data, user.id)
          : getExpressionResponse(data, t, user.id),
      reply = await helper.editReply(response),
      collector = client.componentCollector({
        filter: (i) =>
          ["spirit_exprsn_back", "emote_nav"].includes(client.utils.parseCustomId(i.data.custom_id)!.id) &&
          user.id === (i.member?.user || i.user)!.id,
        idle: 90_000,
        message: reply,
      });

    collector.on("collect", async (i) => {
      const compHelper = new InteractionHelper(i, client);
      if (!compHelper.isButton(i)) return;
      const { id, page } = client.utils.parseCustomId(i.data.custom_id)!;
      switch (id) {
        case "spirit_exprsn_back":
          await compHelper.update(orgData);
          collector.stop("Expression Back");
          break;
        case "emote_nav":
          await compHelper.update(getExpressionResponse(data, t, user.id, parseInt(page)));
          break;
      }
    });

    collector.on("end", async (_k, reason) => {
      if (reason === "Expression Back") return;
      await helper.editReply(orgData).catch(() => {});
    });
  },
} satisfies Button;

const getCommonResponse = (data: SpiritsData, user: string): APIInteractionResponseCallbackData & { files?: RawFile[] } => {
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
      files: [{ data: `${config.CDN_URL}/${expression.level[0].image}`, name: "idk" }],

      components: [{ type: 1, components: [getBackBtn(expression.icon, user)] }],
    };
  } else {
    const stanceEmbed: APIEmbed = {
      title: `${expression.icon} ${expression.level[0].title}`,
      url: `https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}#Stance`,
      description: `Stance preview (Standing, sitting, kneeling and laying).`,
      image: { url: `${config.CDN_URL}/${expression.level[0].image}` },
      author: { name: `Stance - ${data.name}` },
    };
    return {
      embeds: [stanceEmbed],
      components: [{ type: ComponentType.ActionRow, components: [getBackBtn(expression.icon, user)] }],
    };
  }
};

const getExpressionResponse = (data: SpiritsData, t: ReturnType<typeof getTranslator>, user: string, page: number = 1) => {
  // prettier-ignore
  if (!data.expression) throw new Error(`Expected Spirit expression to be present, but recieved ${typeof data.expression} [${data.name}]`);
  const exprsn = data.expression;
  const total = exprsn!.level.length - 1;

  const emote = exprsn!.level[page - 1];

  const embed: APIEmbed = {
    author: {
      name: `${exprsn.icon ? t("commands:SPIRITS.RESPONSES.BUTTONS.EMOTE") : t("commands:SPIRITS.RESPONSES.BUTTONS.ACTION")} - ${data.name}`,
    },
    title: `${exprsn!.icon} ${emote.title}`,
    url: `https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}#${
      exprsn.type === "Emote" ? "Expression" : "Friend_Action"
    }`,
    image: { url: `${config.CDN_URL}/${emote.image}` },
  };

  const row: APIActionRowComponent<APIButtonComponent> = {
    type: ComponentType.ActionRow,
    components: [
      {
        type: ComponentType.Button,
        custom_id: Utils.encodeCustomId({ id: "emote_nav", page: `${page - 1}`, user }),
        label: `⬅️ ${exprsn!.level[page - 2]?.title.slice(-7) || emote.title.slice(-7)}`,
        style: ButtonStyle.Secondary,
        disabled: page === 1,
      },
      getBackBtn(exprsn!.icon, user),
      {
        type: ComponentType.Button,
        custom_id: Utils.encodeCustomId({ id: "emote_nav", page: `${page + 1}`, user }),
        label: `${exprsn!.level[page]?.title.slice(-7) || emote.title.slice(-7)} ➡️`,
        style: ButtonStyle.Secondary,
        disabled: page === total + 1,
      },
    ],
  };

  return {
    embeds: [embed],
    components: [row],
  };
};

const getBackBtn = (emote: string, user: string): APIButtonComponent => ({
  type: ComponentType.Button,
  custom_id: Utils.encodeCustomId({ id: "spirit_exprsn_back", user }),
  emoji: Utils.parseEmoji(emote)!,
  label: "Back",
  style: ButtonStyle.Danger,
});
