import { ContextTypes, IntegrationTypes, type EventReminder, type GuildSchema } from "#libs";
import type { SkyHelper, SlashCommand } from "#structures";
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
export default {
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
  async execute(interaction) {
    if (!interaction.inCachedGuild()) {
      return void (await interaction.reply("Please run this command in a server I am a member of!"));
    }

    await interaction.deferReply();
    const client = interaction.client as SkyHelper;
    const settings = await client.database.getSettings(interaction.guild);

    await handleSetup(interaction, settings);
  },
} satisfies SlashCommand;

async function handleSetup(interaction: ChatInputCommandInteraction, settings: GuildSchema) {
  const client = interaction.client as SkyHelper;

  if (!interaction.inCachedGuild()) {
    throw new Error("Not a cached server. Please contact the bot dev(s)");
  }

  const { reminders } = settings;
  const { geyser, grandma, turtle, reset, dailies, eden, webhook } = reminders;

  const typesEnum = { geyser, grandma, turtle, reset };
  const strEnums = { geyser: "Geyser", grandma: "Grandma", turtle: "Turtle", reset: "Daily Reset" };
  let status = "🔴 Inactive (No Channels Selected)";
  let wb: Webhook | null = null;

  const getActive = (type: EventReminder) =>
    type.active ? "<a:enabled:1220125448483246150>" : "<a:disabled:1220114671403798578>";
  const getChannel = async () => {
    if (!webhook.id) return "None";
    wb = await client.fetchWebhook(webhook.id, webhook.token ?? undefined).catch(() => null);
    if (!wb) return "None";
    status = geyser.active || grandma.active || turtle.active || reset.active ? "🟢 Active" : "🔴 Inactive";
    return wb.channel;
  };

  const initialEmbed = async () => {
    return new EmbedBuilder()
      .setAuthor({ name: "SkyHelper Reminders", iconURL: client.user.displayAvatarURL() })
      .setTitle(interaction.guild.name)
      .setDescription(
        `**Reminder Settings**\nChannel: ${await getChannel()}\nDefault Role: ${
          reminders.default_role ? roleMention(reminders.default_role) : "None"
        }\nStatus: ${status}\n- Geyser ${getActive(geyser)}\n- Grandma ${getActive(grandma)}\n- Turtle ${getActive(turtle)}\n- Daily Reset ${getActive(reset)}\n- ~~ Eden Reset ~~ ${getActive(eden)} (WIP)\n- ~~ Daily Quests ~~ ${getActive(dailies)} (WIP)`,
      );
  };

  const createActionRows = () => {
    const mainMenu = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("reminders-edit-menu")
        .setPlaceholder("Choose a type to edit!")
        .addOptions(
          Object.keys(strEnums).map((key) => ({ label: strEnums[key as keyof typeof strEnums], value: `edit-reminders_${key}` })),
        ),
    );

    const defaultRoleMenu = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
      new RoleSelectMenuBuilder().setCustomId("reminders-edit-default_role").setPlaceholder("Select a default role to ping!"),
    );

    if (reminders.default_role) {
      defaultRoleMenu.components[0].addDefaultRoles(reminders.default_role);
    }

    const channelSelectMenu = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
      new ChannelSelectMenuBuilder()
        .setCustomId("reminders-edit-channel")
        .setPlaceholder("Edit the reminders channel!")
        .setChannelTypes([ChannelType.GuildText]),
    );

    if (webhook.channelId) {
      channelSelectMenu.components[0].addDefaultChannels(webhook.channelId);
    }

    const toggleButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("reminders-enable-all")
        .setStyle(ButtonStyle.Success)
        .setLabel("Enable All")
        .setDisabled(geyser.active && grandma.active && turtle.active && reset.active),
      new ButtonBuilder()
        .setCustomId("reminders-disable-all")
        .setStyle(ButtonStyle.Danger)
        .setLabel("Disable All")
        .setDisabled(!geyser.active && !grandma.active && !turtle.active && !reset.active),
      new ButtonBuilder()
        .setCustomId("reminders-default_role-remove")
        .setStyle(ButtonStyle.Danger)
        .setLabel("Remove Default Role")
        .setDisabled(!reminders.default_role),
    );

    return [mainMenu, defaultRoleMenu, channelSelectMenu, toggleButtons];
  };

  const updateOriginal = async () => {
    await interaction.editReply({ embeds: [await initialEmbed()], components: createActionRows() });
  };

  const reply = await interaction.editReply({ embeds: [await initialEmbed()], components: createActionRows() });

  const collector = reply.createMessageComponentCollector({
    filter: (i) => {
      if (i.user.id !== interaction.user.id) {
        i.reply({ content: "You cannot use buttons generated by others!", ephemeral: true }).catch((err) =>
          client.logger.error(err),
        );
        return false;
      }
      return true;
    },
    idle: 2 * 60 * 1000,
  });

  collector.on("collect", async (int) => {
    const customId = int.customId;

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
                `- **Status**: ${type.active ? "Active" : "Inactive"}\n- **Role**: ${type.role ? roleMention(type.role) : "None"}`,
              );

            const editBtn = new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setLabel(type.active ? "Disable" : "Enable")
                .setStyle(type.active ? ButtonStyle.Danger : ButtonStyle.Success)
                .setCustomId("reminders-toggle-btn"),
              new ButtonBuilder()
                .setCustomId("reminders-role-remove")
                .setLabel("Remove Role")
                .setStyle(ButtonStyle.Danger)
                .setDisabled(!type.role),
            );

            const roleMenu = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
              new RoleSelectMenuBuilder().setCustomId("reminders-role-edit").setPlaceholder("Choose a role to ping"),
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
              reminders.active = Object.values(typesEnum).some((t) => t.active);
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
          await int.editReply("Default Role Updated!");
          await updateOriginal();
        } else if (customId === "reminders-edit-channel") {
          const ch = (int as ChannelSelectMenuInteraction).channels.first() as TextChannel;

          if (wb) {
            await wb.delete().catch(() => console.error);
          }

          if (!ch.permissionsFor(int.guild.members.me!).has("ManageWebhooks")) {
            return await int.editReply({
              embeds: [
                new EmbedBuilder()
                  .setDescription(
                    `I do not have \`Manage Webhooks\` permission in ${ch}. Please ensure there are no channel-level permission overrides and if there are, grant me the necessary permissions before running the command again.`,
                  )
                  .setColor("Red"),
              ],
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
          await int.editReply("Reminders channel updated!");
          await updateOriginal();
        }
      } else if (int.isButton()) {
        if (customId === "reminders-enable-all") {
          Object.keys(typesEnum).forEach((key) => (reminders[key as keyof typeof typesEnum].active = true));
          reminders.active = true;
          await settings.save();
          await int.editReply("All reminders are enabled!");
          await updateOriginal();
        } else if (customId === "reminders-disable-all") {
          Object.keys(typesEnum).forEach((key) => (reminders[key as keyof typeof typesEnum].active = false));
          reminders.active = false;
          await settings.save();
          await int.editReply("All reminders are disabled!");
          await updateOriginal();
        } else if (customId === "reminders-default_role-remove") {
          reminders.default_role = null;
          await settings.save();
          await int.editReply("Default role removed!");
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
