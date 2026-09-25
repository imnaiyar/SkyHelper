import type { TranslatorType } from "@/i18n";
import type { InteractionHelper } from "@/utils/classes/InteractionUtil";
import { CustomId, store } from "@/utils/customId-store";
import { emojis, supportedLang } from "@skyhelperbot/constants";
import { button, container, row, separator, textDisplay } from "@skyhelperbot/utils";
import {
  ButtonStyle,
  ChannelType,
  ComponentType,
  SelectMenuDefaultValueType,
  type APIGuildMember,
  type APIModalInteractionResponseCallbackData,
} from "discord-api-types/v10";

export async function botManage(helper: InteractionHelper) {
  const { client, int } = helper;
  const guild = client.guilds.get(int.guild_id ?? "");
  const guild_settings = guild && (await client.schemas.getSettings(guild));
  const user_settings = await client.schemas.getUser(helper.user);

  let isAdmin = false;
  if (guild && int.member && client.permUtils(int.member.permissions as `${number}`).has("ManageGuild")) isAdmin = true;

  const modal: APIModalInteractionResponseCallbackData = {
    title: "Manage Bot's Settings",
    custom_id: "bot-manage;manage",
    components: [
      guild && isAdmin
        ? [
            {
              type: ComponentType.Label as const,
              label: "Server's Language",
              description: "Select the preferred language for the bot in this server",
              component: {
                type: ComponentType.StringSelect as const,
                custom_id: "bot-manage-server-language",
                placeholder: "Select the language",
                required: false,
                min_values: 0,
                options: supportedLang.map((lang) => ({
                  label: `${lang.flag} ${lang.name}`,
                  value: lang.value,
                  default: guild_settings?.language?.value === lang.value,
                })),
              },
            },
            {
              type: ComponentType.Label as const,
              label: "Announcement Channel",
              description: "Select the channel where bot's announcements and updates will be sent.",
              component: {
                type: ComponentType.ChannelSelect as const,
                custom_id: "bot-manage-announcement-channel",
                required: false,
                placeholder: "Select the channel",
                min_values: 0,
                channel_types: [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.PublicThread],
                default_values: guild_settings?.annoucement_channel
                  ? [{ type: SelectMenuDefaultValueType.Channel as const, id: guild_settings.annoucement_channel }]
                  : undefined,
              },
            },
            {
              type: ComponentType.Label as const,
              label: "Beta",
              description: "Enable beta features for this server (may be unstable)",
              component: {
                type: ComponentType.StringSelect as const,
                custom_id: "bot-manage-beta",
                placeholder: "Select an option",
                min_values: 0,
                required: false,
                options: [
                  { label: "Yes", value: "enable", default: guild_settings?.beta === true },
                  { label: "No", value: "disable", default: guild_settings?.beta === false },
                ],
              },
            },
          ]
        : null,
      {
        type: ComponentType.Label as const,
        label: "User's Language",
        description: "Select your preferred language for the bot (this will override the server language)",
        component: {
          type: ComponentType.StringSelect as const,
          custom_id: "bot-manage-user-language",
          placeholder: "Select the language",
          required: false,
          min_values: 0,
          options: supportedLang.map((lang) => ({
            label: `${lang.flag} ${lang.name}`,
            value: lang.value,
            default: user_settings.language?.value === lang.value,
          })),
        },
      },
    ]
      .filter((c) => !!c)
      .flat(),
  };

  await helper.launchModal(modal);
}

export function customizeEmbed(t: TranslatorType, botMember: APIGuildMember & { bio: string }) {
  const { nick, bio, avatar, banner } = botMember;
  const hasChanges = Boolean(nick ?? banner ?? avatar ?? bio);

  const actions = row(
    button({
      label: t("commands:BOT.responses.customize.btn"),
      custom_id: store.serialize(CustomId.BotCustomize, { action: "edit", user: null }),
      emoji: { name: "edit", id: emojis.edit },
    }),
  );

  if (hasChanges) {
    actions.components.push(
      button({
        label: t("commands:BOT.responses.customize.delete"),
        custom_id: store.serialize(CustomId.BotCustomize, { action: "delete", user: null }),
        emoji: { name: "delete", id: emojis.delete_icon },
        style: ButtonStyle.Danger,
      }),
    );
  }

  return [
    container(
      textDisplay(
        t("commands:BOT.responses.customize.description"),
        "\n",
        hasChanges ? t("commands:BOT.responses.customize.delete.warn") : "",
      ),
      actions,
      separator(),
      textDisplay(`-# ${t("commands:BOT.responses.customize.disclaimer")}`),
    ),
  ];
}
