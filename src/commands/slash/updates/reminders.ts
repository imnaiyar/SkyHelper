import { ContextTypes, type GuildSchema, IntegrationTypes, type EventReminder } from "#libs";
import type { SkyHelper, SlashCommand } from "#structures";
import {
  type Webhook,
  type ChatInputCommandInteraction,
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
  type ChannelSelectMenuInteraction,
  type TextChannel,
} from "discord.js";

export default {
  data: {
    name: "reminders",
    description: "set up reminders",
    integration_types: [IntegrationTypes.Guilds],
    contexts: [ContextTypes.Guild],
    botPermissions: ["ManageWebhooks"],
    userPermissions: ["ManageGuild"],
  },
  async execute(interaction) {
    const client = interaction.client;

    if (!interaction.inCachedGuild()) {
      return void (await interaction.reply("Please run this command in a server I am a member of!"));
    }
    await interaction.deferReply();
    const settings = await client.database.getSettings(interaction.guild);
    await handleSetup(interaction, settings);
  },
} satisfies SlashCommand;

async function handleSetup(interaction: ChatInputCommandInteraction, settings: GuildSchema) {
  const client = interaction.client as SkyHelper;
  if (!interaction.inCachedGuild()) throw new Error("Not a cached server. Please contact the bot dev(s)");
  const { geyser, grandma, turtle, reset, dailies, eden, webhook } = settings.reminders;
  const typesEnum = {
    grandma: grandma,
    geyser: geyser,
    turtle: turtle,
    reset: reset,
    // eden: eden,
    // daiilies: dailies,
  };

  const strEnums = {
    geyser: "Geyser",
    grandma: "Grandma",
    turtle: "Turtle",
    reset: "Daily Reset",
    // TODO: Add these reminders
    // eden: "Eden Reset",
    // dailies: "Daily Quests",
  };
  let status = "🔴 Inactive (No Channels Selected)";
  let wb: null | Webhook = null;
  const initialEmbed = async () => {
    const getActive = (type: EventReminder) =>
      type.active ? "<a:enabled:1220125448483246150>" : "<a:disabled:1220114671403798578>";
    const getChannel = async () => {
      if (!webhook.id) return "None";
      wb = await client.fetchWebhook(webhook.id, webhook.token ?? undefined).catch(() => null);
      if (!wb) return "None";
      if (!geyser?.active && !grandma?.active && !turtle?.active && !reset?.active) {
        status = "🔴 Inactive";
      } else {
        status = "🟢 Active";
      }

      return wb.channel;
    };
    return new EmbedBuilder()
      .setAuthor({ name: "SkyHelper Reminders", iconURL: client.user.displayAvatarURL() })
      .setTitle(interaction.guild.name)
      .setDescription(
        `**Reminder Settings**\nChannel: ${await getChannel()}\nDefault Role: ${
          settings?.reminders?.default_role ? roleMention(settings.reminders.default_role) : "None"
        }\nStatus: ${status}\n- Geyser  ${getActive(geyser)}\n- Grandma  ${getActive(grandma)}\n- Turtle  ${getActive(
          turtle,
        )}\n- Daily Reset  ${getActive(reset)}\n- ~~ Eden Reset ~~ ${getActive(
          eden,
        )} (WIP)\n- ~~ Daily Quests ~~ ${getActive(dailies)} (WIP)`,
      );
  };
  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("reminders-edit-menu")
      .setPlaceholder("Chose a type to edit!")
      .addOptions(
        Object.keys(strEnums).map((key) => ({
          label: strEnums[key as keyof typeof strEnums],
          value: `edit-reminders_${key}`,
        })),
      ),
  );
  const defaultRoleComp = new RoleSelectMenuBuilder()
    .setCustomId("reminders-edit-default_role")
    .setPlaceholder("Select a default role to ping!");
  if (settings.reminders.default_role) defaultRoleComp.addDefaultRoles(settings.reminders.default_role);
  const defaultRoleMenu = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(defaultRoleComp);
  const channelSelect = new ChannelSelectMenuBuilder()
    .setCustomId("reminders-edit-channel")
    .setPlaceholder("Edit the reminders channel!")
    .setChannelTypes([ChannelType.GuildText]);
  if (settings.reminders.webhook.channelId) channelSelect.addDefaultChannels(settings.reminders.webhook.channelId);
  const remimdersChannelMenu = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(channelSelect);
  const getToggetBtns = () => {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("reminders-enable-all")
        .setStyle(ButtonStyle.Success)
        .setLabel("Enable All")
        .setDisabled(geyser?.active && grandma?.active && turtle?.active && reset?.active ? true : false),
      new ButtonBuilder()
        .setCustomId("reminders-disable-all")
        .setStyle(ButtonStyle.Danger)
        .setLabel("Disable All")
        .setDisabled(!geyser?.active && !grandma?.active && !turtle?.active && !reset?.active ? true : false),
      new ButtonBuilder()
        .setCustomId("reminders-default_role-remove")
        .setStyle(ButtonStyle.Danger)
        .setLabel("Remove Default Role")
        .setDisabled(!settings?.reminders?.default_role),
    );
  };
  const rows = [row, defaultRoleMenu, remimdersChannelMenu];

  const reply = await interaction.editReply({
    embeds: [await initialEmbed()],
    components: [...rows, getToggetBtns()],
  });
  const updateOriginal = async () => {
    await interaction.editReply({
      embeds: [await initialEmbed()],
      components: [...rows, getToggetBtns()],
    });
  };
  const collector = reply.createMessageComponentCollector({
    filter: (i) => {
      if (i.user.id !== interaction.user.id) {
        i.reply({ content: "You cannot use buttons generated by others!", ephemeral: true }).catch((err) =>
          (i.client as SkyHelper).logger.error(err),
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
          const value = int.values[0].split("_")[1];

          const type = typesEnum[value as keyof typeof typesEnum];
          const getResponseData = () => {
            const editEmbed = new EmbedBuilder()
              .setTitle(`${strEnums[value as keyof typeof strEnums]} Reminder!`)
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
                .setDisabled(!type?.role),
            );

            const roleMenu = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
              new RoleSelectMenuBuilder().setCustomId("reminders-role-edit").setPlaceholder("Choose a role to ping"),
            );
            return {
              embeds: [editEmbed],
              components: [roleMenu, editBtn],
            };
          };
          const notAnotherReply = await int.editReply({ ...getResponseData() });
          const notAnotherCollector = notAnotherReply.createMessageComponentCollector({
            idle: 60 * 1000,
          });

          notAnotherCollector.on("collect", async (btnInt) => {
            const notAnotherCustomId = btnInt.customId;
            await btnInt.deferUpdate();
            if (notAnotherCustomId === "reminders-toggle-btn") {
              type.active
                ? (settings.reminders[value as keyof typeof typesEnum].active = false)
                : (settings.reminders[value as keyof typeof typesEnum].active = true);
              !geyser?.active && !grandma?.active && !turtle?.active && !reset?.active
                ? (settings.reminders.active = false)
                : (settings.reminders.active = true);
              await settings.save();
              await btnInt.editReply(getResponseData());
              await updateOriginal();
            }
            if (notAnotherCustomId === "reminders-role-edit" && btnInt.isRoleSelectMenu()) {
              type.role = btnInt.values[0];
              await settings.save();
              await btnInt.editReply(getResponseData());
            }

            if (notAnotherCustomId === "reminders-role-remove") {
              type.role = null;
              await settings.save();
              await btnInt.editReply(getResponseData());
            }
          });
          notAnotherCollector.on("end", async () => {
            await int.deleteReply().catch(() => {});
          });
        }

        if (customId === "reminders-edit-default_role") {
          const value = int.values[0];
          settings.reminders.default_role = value;
          await settings.save();
          await int.editReply("Default Role Updated!");
          await updateOriginal();
        }
        if (customId === "reminders-edit-channel") {
          const ch = (int as ChannelSelectMenuInteraction).channels.first() as TextChannel;
          if (wb) wb.delete().catch(() => console.error);
          if (!ch.permissionsFor(int.guild.members.me!).has("ManageWebhooks")) {
            return await int.editReply({
              embeds: [
                new EmbedBuilder()
                  .setDescription(
                    `I do not have \`Manage Webhooks\` permission in ${ch}. Please make sure that there is no channel level permission overwrides and if there is, please grant me the necessary permissions in the said channel before running the command again.`,
                  )
                  .setColor("Red"),
              ],
            });
          }
          const newWb = await ch.createWebhook({
            name: "SkyHelper Reminder",
            avatar: int.client.user.displayAvatarURL(),
            reason: "For reminders",
          });
          settings.reminders.webhook.id = newWb.id;
          settings.reminders.webhook.token = newWb.token;
          settings.reminders.webhook.channelId = newWb.channelId;
          await settings.save();
          await int.editReply("Reminders channel updated!");
          await updateOriginal();
        }
      }
      if (int.isButton()) {
        if (customId === "reminders-enable-all") {
          Object.keys(typesEnum).forEach((k) => (settings.reminders[k as keyof typeof typesEnum].active = true));
          settings.reminders.active = true;
          await settings.save();
          await int.editReply("All reminders are enabled!");
          await updateOriginal();
        }

        if (customId === "reminders-disable-all") {
          Object.keys(typesEnum).forEach((k) => (settings.reminders[k as keyof typeof typesEnum].active = false));
          settings.reminders.active = false;
          await settings.save();
          await int.editReply("All reminders are disabled!");
          await updateOriginal();
        }
        if (customId === "reminders-default_role-remove") {
          settings.reminders.default_role = null;
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
    interaction.editReply({ components: components }).catch(() => {});
  });
}
