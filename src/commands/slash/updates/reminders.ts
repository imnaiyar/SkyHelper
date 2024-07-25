/*
This code is a mess, when I wrote it, I didn't know what I was doing. Now that I do know what I am doing, I still can't optimize it as I didnt know what I was doing, so I have no idea what I did here. :>
*/

import { ContextTypes, IntegrationTypes, type EventReminder, type GuildSchema } from "#libs";
import type { SlashCommand } from "#structures";
import {
  Webhook,
  ChatInputCommandInteraction,
  EmbedBuilder,
  roleMention,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  RoleSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  ChannelType,
  ButtonBuilder,
  ButtonStyle,
  type MessageActionRowComponentBuilder,
  ChannelSelectMenuInteraction,
  TextChannel,
} from "discord.js";
import { useTranslations as x } from "#handlers/useTranslation";
import { getTranslator } from "#src/i18n";
export default {
  async execute(interaction, t) {
    if (!interaction.inCachedGuild()) {
      return void (await interaction.reply(t("commands.REMINDERS.RESPONSES.USER_APP_ERROR")));
    }

    await interaction.deferReply();
    const client = interaction.client;
    const settings = await client.database.getSettings(interaction.guild);

    await handleSetup(interaction, t, settings);
  },
  data: {
    name: "reminders",
    name_localizations: x("commands.REMINDERS.name"),
    description: "Set up reminders",
    description_localizations: x("commands.REMINDERS.description"),
    integration_types: [IntegrationTypes.Guilds],
    contexts: [ContextTypes.Guild],
    botPermissions: ["ManageWebhooks"],
    userPermissions: ["ManageGuild"],
  },
} satisfies SlashCommand;

async function handleSetup(interaction: ChatInputCommandInteraction, t: ReturnType<typeof getTranslator>, settings: GuildSchema) {
  const client = interaction.client;

  if (!interaction.inCachedGuild()) {
    throw new Error(t("commands.REMINDERS.RESPONSES.NOT_CACHED"));
  }

  const { reminders } = settings;
  const { geyser, grandma, turtle, reset, dailies, eden, webhook } = reminders;

  const typesEnum = { geyser, grandma, turtle, reset, eden, dailies };
  const strEnums = {
    geyser: "Geyser",
    grandma: "Grandma",
    turtle: "Turtle",
    reset: "Daily Reset",
    eden: "Eden Reset",
    dailies: "Daily Quests",
  };
  let status = "🔴 Inactive (No Channels Selected)";
  let wb: Webhook | null = null;

  const getActive = (type: EventReminder) =>
    type.active ? "<a:enabled:1220125448483246150>" : "<a:disabled:1220114671403798578>";
  const getChannel = async () => {
    if (!webhook.id) return "None";
    wb = await client.fetchWebhook(webhook.id, webhook.token ?? undefined).catch(() => null);
    if (!wb) return "None";
    status =
      geyser.active || grandma.active || turtle.active || reset.active
        ? t("commands.REMINDERS.RESPONSES.ACTIVE")
        : t("commands.REMINDERS.RESPONSES.INACTIVE");
    return wb.channel;
  };

  const initialEmbed = async () => {
    return new EmbedBuilder()
      .setAuthor({ name: t("commands.REMINDERS.RESPONSES.EMBED_AUTHOR"), iconURL: client.user.displayAvatarURL() })
      .setTitle(interaction.guild.name)
      .addFields(
        { name: `**•** ${t("times-embed.GEYSER")} ${getActive(geyser)}`, value: "\u200B", inline: true },
        { name: `**•** ${t("times-embed.GRANDMA")} ${getActive(grandma)}`, value: "\u200B", inline: true },
        { name: `**•** ${t("times-embed.TURTLE")} ${getActive(turtle)}`, value: "\u200B", inline: true },
        { name: `**•** ${t("times-embed.DAILY")} ${getActive(reset)}`, value: "\u200B", inline: true },
        { name: `**•** ${t("times-embed.EDEN")} ${getActive(eden)}`, value: "\u200B", inline: true },
        { name: `**•** ${t("reminders.DAILY_QUESTS")} ${getActive(dailies)}`, value: "\u200B", inline: true },
      )
      .setDescription(
        `${t("commands.REMINDERS.RESPONSES.DES_TITLE")}\n${t("commands.REMINDERS.RESPONSES.CHANNEL", { CHANNEL: (await getChannel())?.toString() })}\n${t("commands.REMINDERS.RESPONSES.DEFAULT_ROLE", { ROLE: reminders.default_role ? roleMention(reminders.default_role) : t("commands.REMINDERS.RESPONSES.TYPE-DESCRIPTION.NONE") })}\n${t("commands.REMINDERS.RESPONSES.TYPE-DESCRIPTION.STATUS")}: ${status}`,
      )
      .setThumbnail(
        "https://media.discordapp.net/attachments/1148740470047002729/1253795351127658547/output-onlinegiftools.gif?ex=667878ea&is=6677276a&hm=e09c6f1bd06860aaed32b95c29c9e6327a7f7805e843cb033b5cfd284db33fe8&=&width=515&height=515",
      );
  };

  const createActionRows = () => {
    const mainMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("reminders-edit-menu")
        .setPlaceholder(t("commands.REMINDERS.RESPONSES.TYPE_SELECT_PLACEHOLDER"))
        .addOptions(
          Object.keys(strEnums).map((key) => ({ label: strEnums[key as keyof typeof strEnums], value: `edit-reminders_${key}` })),
        ),
    );

    const defaultRoleMenu = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
      new RoleSelectMenuBuilder()
        .setCustomId("reminders-edit-default_role")
        .setPlaceholder(t("commands.REMINDERS.RESPONSES.ROLE_SELECT_PLACEHOLDER")),
    );

    if (reminders.default_role) {
      defaultRoleMenu.components[0].addDefaultRoles(reminders.default_role);
    }

    const channelSelectMenu = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
      new ChannelSelectMenuBuilder()
        .setCustomId("reminders-edit-channel")
        .setPlaceholder(t("commands.REMINDERS.RESPONSES.CHANNEL_SELECT_PLACEHOLDER"))
        .setChannelTypes([ChannelType.GuildText]),
    );

    if (webhook.channelId) {
      channelSelectMenu.components[0].addDefaultChannels(webhook.channelId);
    }

    const toggleButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("reminders-enable-all")
        .setStyle(ButtonStyle.Success)
        .setLabel(t("commands.REMINDERS.RESPONSES.BTN_ENABLE_ALL"))
        .setDisabled(geyser.active && grandma.active && turtle.active && reset.active && eden.active && dailies.active),
      new ButtonBuilder()
        .setCustomId("reminders-disable-all")
        .setStyle(ButtonStyle.Danger)
        .setLabel(t("commands.REMINDERS.RESPONSES.BTN_DISABLE_ALL"))
        .setDisabled(!geyser.active && !grandma.active && !turtle.active && !reset.active && !eden.active && !dailies.active),
      new ButtonBuilder()
        .setCustomId("reminders-default_role-remove")
        .setStyle(ButtonStyle.Danger)
        .setLabel(t("commands.REMINDERS.RESPONSES.BTN_DISABLE_DEFAULT_ROLE"))
        .setDisabled(!reminders.default_role),
    );

    return [mainMenu, defaultRoleMenu, channelSelectMenu, toggleButtons];
  };

  const updateOriginal = async () => {
    await interaction.editReply({ embeds: [await initialEmbed()], components: createActionRows() });
  };

  const reply = await interaction.editReply({ embeds: [await initialEmbed()], components: createActionRows() });

  const collector = reply.createMessageComponentCollector({
    idle: 2 * 60 * 1000,
  });

  collector.on("collect", async (int) => {
    const customId = int.customId;
    if (int.user.id !== interaction.user.id) {
      await int.deferReply({ ephemeral: true });
      const ts = await int.t();
      await int.editReply(ts("common.errors.NOT-ALLOWED"));
      return;
    }
    try {
      await int.deferReply({ ephemeral: true });

      if (int.isAnySelectMenu()) {
        if (customId === "reminders-edit-menu") {
          const value = int.values[0].split("_")[1] as keyof typeof typesEnum;
          const type = typesEnum[value];

          const getResponseData = () => {
            const editEmbed = new EmbedBuilder()
              .setTitle(`${strEnums[value]} Reminder!`)
              .setDescription(
                `- **${t("commands.REMINDERS.RESPONSES.TYPE-DESCRIPTION.STATUS")}**: ${type.active ? t("commands.REMINDERS.RESPONSES.TYPE-DESCRIPTION.ACTIVE") : t("commands.REMINDERS.RESPONSES.TYPE-DESCRIPTION.INACTIVE")}\n- **${t("commands.REMINDERS.RESPONSES.TYPE-DESCRIPTION.ROLE")}**: ${type.role ? roleMention(type.role) : t("commands.REMINDERS.RESPONSES.TYPE-DESCRIPTION.NONE")}`,
              );

            const editBtn = new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setLabel(
                  type.active
                    ? t("commands.REMINDERS.RESPONSES.TYPE-DESCRIPTION.BTN_DISABLE")
                    : t("commands.REMINDERS.RESPONSES.TYPE-DESCRIPTION.BTN_ENABLE"),
                )
                .setStyle(type.active ? ButtonStyle.Danger : ButtonStyle.Success)
                .setCustomId("reminders-toggle-btn"),
              new ButtonBuilder()
                .setCustomId("reminders-role-remove")
                .setLabel(t("commands.REMINDERS.RESPONSES.TYPE-DESCRIPTION.BTN_REMOVE_ROLE"))
                .setStyle(ButtonStyle.Danger)
                .setDisabled(!type.role),
            );

            const roleMenu = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
              new RoleSelectMenuBuilder()
                .setCustomId("reminders-role-edit")
                .setPlaceholder(t("commands.REMINDERS.RESPONSES.TYPE-DESCRIPTION.ROLE_TYPE_SELECT_PLACEHOLDER")),
            );

            return { embeds: [editEmbed], components: [roleMenu, editBtn] };
          };

          const notAnotherReply = await int.editReply(getResponseData());
          const notAnotherCollector = notAnotherReply.createMessageComponentCollector({ idle: 60 * 1000 });

          notAnotherCollector.on("collect", async (btnInt) => {
            const notAnotherCustomId = btnInt.customId;
            await btnInt.deferUpdate();

            if (notAnotherCustomId === "reminders-toggle-btn") {
              type.active = !type.active;
              reminders.active = Object.values(typesEnum).some((ty) => ty.active);
              await settings.save();
              await btnInt.editReply(getResponseData());
              await updateOriginal();
            } else if (notAnotherCustomId === "reminders-role-edit" && btnInt.isRoleSelectMenu()) {
              type.role = btnInt.values[0];
              await settings.save();
              await btnInt.editReply(getResponseData());
            } else if (notAnotherCustomId === "reminders-role-remove") {
              type.role = null;
              await settings.save();
              await btnInt.editReply(getResponseData());
            }
          });

          notAnotherCollector.on("end", async () => {
            await int.deleteReply().catch(() => {});
          });
        } else if (customId === "reminders-edit-default_role") {
          const value = int.values[0];
          reminders.default_role = value;
          await settings.save();
          await int.editReply(t("commands.REMINDERS.RESPONSES.DEFAULT_ROLE_UPDATE"));
          await updateOriginal();
        } else if (customId === "reminders-edit-channel") {
          const ch = (int as ChannelSelectMenuInteraction).channels.first() as TextChannel;

          if (wb) {
            await wb.delete().catch(() => console.error);
          }

          if (!ch.permissionsFor(int.guild.members.me!).has("ManageWebhooks")) {
            return await int.editReply({
              embeds: [new EmbedBuilder().setDescription(t("common.NO-WB-PERM-BOT", { CHANNEL: ch.toString() })).setColor("Red")],
            });
          }

          const newWb = await ch.createWebhook({
            name: "SkyHelper Reminder",
            avatar: client.user.displayAvatarURL(),
            reason: "For reminders",
          });

          reminders.webhook.id = newWb.id;
          reminders.webhook.token = newWb.token;
          reminders.webhook.channelId = newWb.channelId;
          await settings.save();
          await int.editReply(t("commands.REMINDERS.RESPONSES.CHANNEL_UPDATE"));
          await updateOriginal();
        }
      } else if (int.isButton()) {
        if (customId === "reminders-enable-all") {
          Object.keys(typesEnum).forEach((key) => (reminders[key as keyof typeof typesEnum].active = true));
          reminders.active = true;
          await settings.save();
          await int.editReply(t("commands.REMINDERS.RESPONSES.ALL_ACTIVE"));
          await updateOriginal();
        } else if (customId === "reminders-disable-all") {
          Object.keys(typesEnum).forEach((key) => (reminders[key as keyof typeof typesEnum].active = false));
          reminders.active = false;
          await settings.save();
          await int.editReply(t("commands.REMINDERS.RESPONSES.ALL_DISABLED"));
          await updateOriginal();
        } else if (customId === "reminders-default_role-remove") {
          reminders.default_role = null;
          await settings.save();
          await int.editReply(t("commands.REMINDERS.RESPONSES.DEFAULT_ROLE_REMOVE"));
          await updateOriginal();
        }
      }
    } catch (err) {
      client.logger.error(err);
    }
  });

  collector.on("end", async () => {
    const msg = await interaction.fetchReply().catch(() => {});
    const components: ActionRowBuilder<MessageActionRowComponentBuilder>[] = [];

    msg?.components?.forEach((comp) => {
      const btn = ActionRowBuilder.from(comp) as ActionRowBuilder<MessageActionRowComponentBuilder>;
      btn.components.forEach((c) => c.setDisabled(true));
      components.push(btn);
    });

    await interaction.editReply({ components }).catch(() => {});
  });
}
