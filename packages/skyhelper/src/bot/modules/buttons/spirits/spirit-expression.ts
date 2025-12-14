import { defineButton } from "@/structures";
import type { getTranslator } from "@/i18n";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import { ButtonStyle, ComponentType, type APIButtonComponent } from "@discordjs/core";
import Utils from "@/utils/classes/Utils";
import { container, mediaGallery, mediaGalleryItem, separator, textDisplay } from "@skyhelperbot/utils";
import { CustomId } from "@/utils/customId-store";
import { fetchSkyData } from "@/planner";
import { ItemType, SpiritTreeHelper, type ISpirit } from "skygame-data";
export default defineButton({
  data: {
    name: "spirit_expression",
  },
  id: CustomId.SpiritExpression,
  async execute(interaction, t, helper, { spirit: guid }) {
    const { client } = helper;
    const { user } = helper;
    const spirit = (await fetchSkyData(client)).spirits.items.find((s) => s.guid === guid);
    if (!spirit) {
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
      reply = await helper.editReply(getEmoteResponse(spirit, t, user.id)),
      collector = client.componentCollector({
        filter: (i) =>
          // @ts-expect-error data is present, but wtv
          ["spirit_exprsn_back"].includes(client.utils.store.deserialize(i.data.custom_id).data.data) &&
          user.id === (i.member?.user ?? i.user)!.id,
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

const getEmoteResponse = (spirit: ISpirit, t: ReturnType<typeof getTranslator>, user: string) => {
  const expressions = SpiritTreeHelper.getItems(spirit.tree, true)
    .filter((item) => [ItemType.Emote, ItemType.Call, ItemType.Stance].includes(item.type))
    .filter((e) => e.previewUrl);
  if (!expressions.length) throw new Error("No expression nodes found for spirit: " + spirit.guid);
  const components = container(
    textDisplay(
      `-# ${t("commands:SPIRITS.RESPONSES.BUTTONS.EMOTE")} - ${spirit.name}`,
      `### [${Utils.formatEmoji(expressions[0]!.emoji)} ${expressions[0]?.name ?? ""}](${expressions[0]?._wiki?.href ?? "https://sky-children-of-the-light.fandom.com/wiki"})`,
      expressions[0]?.type ?? "Expressions",
    ),

    separator(),
    mediaGallery(
      expressions.map((exp) =>
        mediaGalleryItem(exp.previewUrl!, { description: exp.name + (exp.level ? ` (Lvl: ${exp.level})` : "") }),
      ),
    ),
    { type: 1, components: [getBackBtn(user, expressions[0]!.emoji)] },
  );

  return { components: [components] };
};

const getBackBtn = (user: string, emote?: string): APIButtonComponent => ({
  type: ComponentType.Button,
  custom_id: Utils.store.serialize(CustomId.Default, { data: "spirit_exprsn_back", user }),
  emoji: emote ? Utils.parseEmoji(emote)! : undefined,
  label: "Back",
  style: ButtonStyle.Danger,
});
