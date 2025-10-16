import type { InteractionHelper } from "@/utils/classes/InteractionUtil";
import { supportedLang } from "@skyhelperbot/constants";
import { PermissionsUtil, separator, textDisplay } from "@skyhelperbot/utils";
import {
  ChannelType,
  ComponentType,
  MessageFlags,
  SelectMenuDefaultValueType,
  type APIGuildForumChannel,
  type APIModalInteractionResponseCallbackData,
  type APINewsChannel,
  type APITextChannel,
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
    custom_id: "bot-manage-" + helper.int.id,
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

  const submit = await client
    .awaitModal({ filter: (i) => i.data.custom_id === modal.custom_id, timeout: 3 * 60 * 1000 })
    .catch(() => null);

  if (!submit) return;
  await client.api.interactions.defer(submit.id, submit.token);
  let guild_language: string | undefined;
  let announcement_channel;
  let beta;
  // these components should be present for admins
  if (isAdmin) {
    guild_language = client.utils.getModalComponent(submit, "bot-manage-server-language", ComponentType.StringSelect)?.values[0];
    announcement_channel = client.utils.getModalComponent(submit, "bot-manage-announcement-channel", ComponentType.ChannelSelect)
      ?.values[0];
    beta = client.utils.getModalComponent(submit, "bot-manage-beta", ComponentType.StringSelect)?.values[0];
  }
  if (announcement_channel) {
    const channel = client.channels.get(announcement_channel)! as APITextChannel | APINewsChannel | APIGuildForumChannel;
    const hasPerms = PermissionsUtil.overwriteFor(guild!.clientMember, channel, guild!).has(["ViewChannel", "SendMessages"]);
    if (!hasPerms) {
      return await client.api.interactions.editReply(int.application_id, submit.token, {
        content: `I do not have permission to access <#${announcement_channel}>. Please make sure I have \`View Channel\` and \`Send Messages\` permissions in that channel.`,
      });
    }
  }

  const user_language = client.utils.getModalComponent(submit, "bot-manage-user-language", ComponentType.StringSelect)?.values[0];
  if (guild_settings) {
    guild_settings.annoucement_channel = announcement_channel ?? null;
    if (beta === "enable") guild_settings.beta = true;
    else guild_settings.beta = false;
    guild_settings.language = supportedLang.find((l) => l.value === guild_language);
  }
  user_settings.language = supportedLang.find((l) => l.value === user_language);
  // eslint-disable-next-line @typescript-eslint/await-thenable
  await Promise.all([guild_settings?.save(), user_settings.save()]);

  await client.api.interactions.editReply(int.application_id, submit.token, {
    components: [
      textDisplay("# Bot Settings Updated"),
      separator(),
      textDisplay(
        "### Settings",
        `User: <@${helper.user.id}>${guild ? ` | Server: **${guild.name}**` : ""}\n`,
        `- Server Language: ${guild_language ? supportedLang.find((l) => l.value === guild_language)?.name : "Default (English)"}`,
        `- Announcement Channel: ${announcement_channel ? `<#${announcement_channel}>` : "Not Set"}`,
        `- Beta Features: ${beta === "enable" ? "Enabled" : "Disabled"}`,
        `- User Language: ${user_language ? supportedLang.find((l) => l.value === user_language)?.name : "Default (English)"}`,
      ),
    ],
    flags: MessageFlags.IsComponentsV2,
    allowed_mentions: { parse: [] },
  });
}
