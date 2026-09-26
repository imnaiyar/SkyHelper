import type { TranslatorType } from "@/i18n";
import { defineButton } from "@/structures";
import { CustomId } from "@/utils/customId-store";
import {
  ComponentType,
  MessageFlags,
  TextInputStyle,
  type APIGuildMember,
  type APIModalInteractionResponseCallbackData,
} from "discord-api-types/v10";
import { customizeEmbed } from "../inputCommands/utility/sub/bot.js";

export default defineButton({
  data: { name: "customize" },
  id: CustomId.BotCustomize,
  async execute(interaction, t, helper, { action }) {
    // only way to get bot's bio for server, if any
    const botMember = (await helper.api.users.editCurrentGuildMember(interaction.guild_id!, {})) as APIGuildMember & {
      bio: string;
    };

    const { bio, nick } = botMember;
    const { guild_id } = interaction;
    switch (action) {
      case "edit": {
        const modal = customizeModal(t, nick ?? null, bio || null);
        await helper.launchModal(modal);
        break;
      }
      case "delete": {
        await helper.client.api.users.editCurrentGuildMember(guild_id!, { nick: null, avatar: null, banner: null, bio: null });
        await helper.update({ components: customizeEmbed(t, botMember) });

        await helper.followUp({ content: t("commands:BOT.responses.customize.delete.success"), flags: MessageFlags.Ephemeral });
        break;
      }
    }
  },
});

function customizeModal(t: TranslatorType, nickname: string | null, bio: string | null) {
  const modal: APIModalInteractionResponseCallbackData = {
    title: t("commands:BOT.responses.customize.btn"),
    custom_id: "bot-manage;customize",
    components: [
      {
        type: ComponentType.Label,
        label: "Nickname",
        description: "The bot's nickname in the server",
        component: {
          type: ComponentType.TextInput,
          value: nickname ?? "",
          style: TextInputStyle.Short,
          custom_id: "nick",
          max_length: 32,
          required: false,
        },
      },
      {
        type: ComponentType.Label,
        label: "Bio",
        description: "The bot's bio in the server",
        component: {
          type: ComponentType.TextInput,
          value: bio ?? "",
          style: TextInputStyle.Paragraph,
          custom_id: "bio",
          max_length: 300,
          required: false,
        },
      },
      {
        type: ComponentType.Label,
        label: "Avatar",
        description: "The bot's avatar in the server. If left empty, any previous overrides will be removed.",
        component: {
          type: ComponentType.FileUpload,
          custom_id: "avatar",
          file_types: ["image", ".jpg", ".gifs"],
          max_values: 1,
          required: false,
        },
      },
      {
        type: ComponentType.Label,
        label: "Banner",
        description: "The bot's banner in the server. If left empty, any previous overrides will be removed.",
        component: {
          type: ComponentType.FileUpload,
          custom_id: "banner",
          file_types: ["image", ".jpg", ".gifs"],
          max_values: 1,
          required: false,
        },
      },
    ],
  };
  return modal;
}
