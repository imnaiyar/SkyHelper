const moment = require("moment-timezone");
const {
  EmbedBuilder,
  time,
  ApplicationCommandOptionType,
  ActionRowBuilder,
  RoleSelectMenuBuilder,
  StringSelectMenuBuilder,
  ChannelType,
  ButtonBuilder,
  roleMention,
  ChannelSelectMenuBuilder,
} = require("discord.js");
const { getSettings } = require("@schemas/Guild");
const handleSpirits = require("./guides/sub/shared/handleSpirits");
/**
 * @type {import('@src/frameworks').SlashCommands}
 */

module.exports = {
  cooldown: 15,
  data: {
    name: "reminders",
    description: "set up reminders",
    integration_types: [0],
    contexts: [0],
    dm_permission: false,
    botPermissions: ["ManageWebhooks"],
    userPermissions: ["ManageGuild"],
    longDesc: "To be decided",
  },

  /**
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   * @param {import('@src/frameworks').SkyHelper} client
   */
  async execute(interaction, client) {
    await interaction.deferReply();
    const settings = await getSettings(interaction.guild);
    await handleSetup(interaction, settings);
  },
};

async function handleSetup(interaction, settings) {
  const { client } = interaction;
  const { geyser, grandma, turtle, reset, dailies, eden, webhook, active } = settings.reminders;
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
  let wb = null;
  const initialEmbed = async () => {
    const getActive = (type) => (type.active ? "<a:enabled:1220125448483246150>" : "<a:disabled:1220114671403798578>");
    const getChannel = async () => {
      if (!webhook.id) return "None";
      wb = await client.fetchWebhook(webhook.id, webhook?.token).catch(() => {});
      if (!wb) return "None";
      if (!geyser?.active && !grandma?.active && !turtle?.active && !reset?.active) {
        status = "🔴 Inactive";
      } else status = "🟢 Active";

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
  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("reminders-edit-menu")
      .setPlaceholder("Chose a type to edit!")
      .addOptions(
        Object.keys(strEnums).map((key) => ({
          label: strEnums[key],
          value: `edit-reminders_${key}`,
        })),
      ),
  );
  const defaultRoleMenu = new ActionRowBuilder().addComponents(
    new RoleSelectMenuBuilder()
      .setCustomId("reminders-edit-default_role")
      .setPlaceholder("Select a default role to ping!"),
  );

  const remimdersChannelMenu = new ActionRowBuilder().addComponents(
    new ChannelSelectMenuBuilder()
      .setCustomId("reminders-edit-channel")
      .setPlaceholder("Edit the reminders channel!")
      .setChannelTypes([ChannelType.GuildText]),
  );
  const getToggetBtns = () => {
    return new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("reminders-enable-all")
        .setStyle("3")
        .setLabel("Enable All")
        .setDisabled(geyser?.active && grandma?.active && turtle?.active && reset?.active ? true : false),
      new ButtonBuilder()
        .setCustomId("reminders-disable-all")
        .setStyle("4")
        .setLabel("Disable All")
        .setDisabled(!geyser?.active && !grandma?.active && !turtle?.active && !reset?.active ? true : false),
      new ButtonBuilder()
        .setCustomId("reminders-default_role-remove")
        .setStyle("4")
        .setLabel("Remove Default Role")
        .setDisabled(!settings?.reminders?.default_role),
    );
  };
  const rows = [row, defaultRoleMenu, remimdersChannelMenu];

  const reply = await interaction.editReply({
    embeds: [await initialEmbed()],
    components: [...rows, getToggetBtns()],
    fetchReply: true,
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
          i.client.logger.error(err),
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
      if (customId === "reminders-edit-menu") {
        const value = int.values[0].split("_")[1];

        const type = typesEnum[value];
        const getResponseData = () => {
          const editEmbed = new EmbedBuilder()
            .setTitle(`${strEnums[value]} Reminder!`)
            .setDescription(
              `- **Status**: ${type.active ? "Active" : "Inactive"}\n- **Role**: ${
                type.role ? roleMention(type.role) : "None"
              }`,
            );
          const editBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setLabel(type.active ? "Disable" : "Enable")
              .setStyle(type.active ? "4" : "3")
              .setCustomId("reminders-toggle-btn"),
            new ButtonBuilder()
              .setCustomId("reminders-role-remove")
              .setLabel("Remove Role")
              .setStyle("4")
              .setDisabled(!type?.role),
          );

          const roleMenu = new ActionRowBuilder().addComponents(
            new RoleSelectMenuBuilder().setCustomId("reminders-role-edit").setPlaceholder("Choose a role to ping"),
          );
          return {
            embeds: [editEmbed],
            components: [roleMenu, editBtn],
          };
        };
        const notAnotherReply = await int.editReply({ ...getResponseData(), fetchReply: true });
        const notAnotherCollector = notAnotherReply.createMessageComponentCollector({
          idle: 60 * 1000,
        });

        notAnotherCollector.on("collect", async (btnInt) => {
          const notAnotherCustomId = btnInt.customId;
          await btnInt.deferUpdate();
          if (notAnotherCustomId === "reminders-toggle-btn") {
            type.active ? (settings.reminders[value].active = false) : (settings.reminders[value].active = true);
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
          await int.deleteReply().catch((err) => {});
        });
      }

      if (customId === "reminders-edit-default_role") {
        const value = int.values[0];
        settings.reminders.default_role = value;
        await settings.save();
        await int.editReply("Default Role Updated!");
        await updateOriginal();
      }

      if (customId === "reminders-enable-all") {
        Object.keys(typesEnum).forEach((k) => (settings.reminders[k].active = true));
        settings.reminders.active = true;
        await settings.save();
        await int.editReply("All reminders are enabled!");
        await updateOriginal();
      }

      if (customId === "reminders-disable-all") {
        Object.keys(typesEnum).forEach((k) => (settings.reminders[k].active = false));
        settings.reminders.active = false;
        await settings.save();
        await int.editReply("All reminders are disabled!");
        await updateOriginal();
      }

      if (customId === "reminders-edit-channel") {
        const channelId = int.values[0];
        if (wb) await wb.delete();
        const ch = int.guild.channels.cache.get(channelId);
        if (!ch.permissionsFor(int.guild.members.me).has("ManageWebhooks")) {
          return await int.editReply({
           embeds:[ 
             new EmbedBuilder()
             .setDescription(`I do not have \`Manage Webhooks\` permission in ${ch}. Please make sure that there is no channel level permission overwrides and if there is, please grant me the necessary permissions in the said channel before running the command again.`,)
             .setColor('Red')
           ]
          });
        }
        const newWb = await ch.createWebhook({
          name: "SkyHelper Reminder",
          avatar: int.client.user.displayAvatarURL(),
          reason: "For reminders",
        });
        settings.reminders.webhook.id = newWb.id;
        settings.reminders.webhook.token = newWb.token;
        await settings.save();
        await int.editReply("Reminders channel updated!");
        await updateOriginal();
      }

      if (customId === "reminders-default_role-remove") {
        settings.reminders.default_role = null;
        await settings.save();
        await int.editReply("Default role removed!");
        await updateOriginal();
      }
    } catch (err) {
      int.client.logger.error(err);
    }
  });
  collector.on("end", async () => {
    const msg = await interaction.fetchReply().catch(() => {});
    let components = [];
    msg?.components?.forEach((comp) => {
      const btn = ActionRowBuilder.from(comp);
      btn.components.forEach((c) => c.setDisabled(true));
      components.push(btn);
    });
    interaction.editReply({ components: components }).catch(() => {});
  });
}
