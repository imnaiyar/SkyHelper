import type { SpiritsData } from "@skyhelperbot/constants/spirits-datas";
import { defineButton } from "@/structures";
import type { getTranslator } from "@/i18n";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import { ButtonStyle, ComponentType, type APIButtonComponent } from "@discordjs/core";
import Utils from "@/utils/classes/Utils";
import { container, mediaGallery, mediaGalleryItem, separator, textDisplay } from "@skyhelperbot/utils";
import config from "@/config";
import { CustomId } from "@/utils/customId-store";
export default defineButton({
  data: {
    name: "spirit_expression",
  },
  id: CustomId.SpiritExpression,
  async execute(interaction, t, helper, { spirit }) {
    const { client } = helper;
    const { user } = helper,
      data = client.spiritsData[spirit];
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
      reply = await helper.editReply(getCommonResponse(data, t, user.id)),
      collector = client.componentCollector({
        filter: (i) =>
          // @ts-expect-error data is present, but wtv
          ["spirit_exprsn_back"].includes(client.utils.store.deserialize(i.data.custom_id).data.data) &&
          user.id === (i.member?.user || i.user)!.id,
        idle: 90_000,
        message: reply,
      });

    collector.on("collect", async (i) => {
      const compHelper = new InteractionHelper(i, client);
      if (!compHelper.isButton(i)) return;
      const { id, data: v } = client.utils.store.deserialize(i.data.custom_id);
      if (id !== CustomId.Default) return;
      switch (v.data) {
        case "spirit_exprsn_back":
          await compHelper.update(orgData);
          collector.stop("Expression Back");
          break;
      }
    });

    collector.on("end", async (_k, reason) => {
      if (reason === "Expression Back") return;
      await helper.editReply(orgData).catch(() => {});
    });
  },
});

const getCommonResponse = (data: SpiritsData, t: ReturnType<typeof getTranslator>, user: string) => {
  // prettier-ignore
  if (!data.expression) throw new Error(`Expected Spirit expression to be present, but recieved ${typeof data.expression} [${data.name}]`);
  const exprsn = data.expression;
  const components = container(
    textDisplay(
      `-# ${exprsn.icon ? t("commands:SPIRITS.RESPONSES.BUTTONS.EMOTE") : t("commands:SPIRITS.RESPONSES.BUTTONS.ACTION")} - ${
        data.name
      }\n### [${
        exprsn!.icon
      } ${exprsn.level[0].title.replace(/ Level [1-6]/, "")}](https://sky-children-of-the-light.fandom.com/wiki/${data.name.split(" ").join("_")}#${
        exprsn.type === "Emote" ? "Expression" : exprsn.type.split(" ").join("_")
      })`,
    ),
    separator(),
    mediaGallery(exprsn.level.map((level) => mediaGalleryItem(`${config.CDN_URL}/${level.image}`, { description: level.title }))),
    separator(),
    { type: 1, components: [getBackBtn(exprsn.icon, user)] },
  );
  return { components: [components] };
};

const getBackBtn = (emote: string, user: string): APIButtonComponent => ({
  type: ComponentType.Button,
  custom_id: Utils.store.serialize(CustomId.Default, { data: "spirit_exprsn_back", user }),
  emoji: Utils.parseEmoji(emote)!,
  label: "Back",
  style: ButtonStyle.Danger,
});
