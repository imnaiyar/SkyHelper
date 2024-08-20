import {
  Collection,
  EmbedBuilder,
  WebhookClient,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type ChatInputCommandInteraction,
  type ContextMenuCommandInteraction,
} from "discord.js";
import type { ContextMenuCommand, SkyHelper, SlashCommand, Event } from "#structures";
import { parsePerms, type Permission } from "skyhelper-utils";
import config from "#bot/config";
import { eventTimes } from "#libs/constants/index";
import { getTimes } from "#handlers/getDailyEventTimes";
import type { getTranslator } from "#bot/i18n";
import { dailyQuestEmbed } from "#handlers";
const cLogger = process.env.COMMANDS_USED ? new WebhookClient({ url: process.env.COMMANDS_USED }) : undefined;
const bLogger = process.env.BUG_REPORTS ? new WebhookClient({ url: process.env.BUG_REPORTS }) : undefined;
const errorEmbed = (title: string, description: string) => new EmbedBuilder().setTitle(title).setDescription(description);
const errorBtn = (label: string, errorId: string) =>
  new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel(label)
      .setCustomId("error-report" + `_${errorId}`)
      .setStyle(ButtonStyle.Secondary),
  );

const interactionHandler: Event<"interactionCreate"> = async (client, interaction): Promise<void> => {
  // Translator
  const t = await interaction.t();

  // Slash Commands
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) {
      await interaction.reply({
        content: t("common.errors.COMMAND_NOT_FOUND"),
        ephemeral: true,
      });
      return;
    }

    const isChecked = await validateCommand(command, interaction, t);
    if (!isChecked) return;

    try {
      await command.execute(interaction, t, client);
      const embed = new EmbedBuilder()
        .setTitle("New command used")
        .addFields(
          { name: `Command`, value: `\`${interaction}\`` },
          {
            name: `User`,
            value: `${interaction.user.username} \`[${interaction.user.id}]\``,
          },
          {
            name: `Server`,
            value: `${
              interaction.inGuild() ? interaction.guild?.name || "Possibly as an User App" : "In DMs"
            } \`[${interaction.guild?.id}]\``,
          },
          {
            name: `Channel`,
            value: `${
              interaction.inGuild() ? interaction.channel?.name || "Possibly as an User App" : "In DMs"
            } \`[${interaction.channel?.id}]\``,
          },
        )
        .setColor("Blurple")
        .setTimestamp();

      // Slash Commands
      if (cLogger && !client.config.OWNER.includes(interaction.user.id) && process.env.COMMANDS_USED) {
        cLogger.send({ username: "Command Logs", embeds: [embed] }).catch(() => {});
      }
    } catch (err) {
      const errorId = client.logger.error(err);
      const content = {
        content: t("common.errors.ERROR_ID", { ID: errorId }),
      };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          ...content,
          embeds: [errorEmbed(t("common.errors.EMBED_TITLE"), t("common.errors.EMBED_DESCRIPTION"))],
          components: [errorBtn(t("common.errors.BUTTON_LABEL"), errorId)],
        });
        return;
      } else {
        await interaction.reply({
          ...content,
          embeds: [errorEmbed(t("common.errors.EMBED_TITLE"), t("common.errors.EMBED_DESCRIPTION"))],
          components: [errorBtn(t("common.errors.BUTTON_LABEL"), errorId)],
          ephemeral: true,
        });
        return;
      }
    }
  }

  // Autocompletes
  if (interaction.isAutocomplete()) {
    const command = client.commands.get(interaction.commandName) as unknown as SlashCommand<true>;

    if (!command) {
      await interaction.respond([
        {
          name: t("common.errors.autoCompleteCOMMAND_NOT_FOUND"),
          value: "none",
        },
      ]);
      return;
    }

    if (!command.autocomplete) {
      await interaction.respond([
        {
          name: t("common.errors.autoCompleteCOMMAND_NOT_FOUND"),
          value: "none",
        },
      ]);
      return;
    }
    try {
      await command.autocomplete(interaction, client);
    } catch (error) {
      client.logger.error(error);
      if (!interaction.responded) {
        await interaction.respond([
          {
            name: t("common.errors.AUTOCOMPLETE_ERROR"),
            value: "none",
          },
        ]);
      }
    }
  }

  // Context menus
  if (interaction.isContextMenuCommand()) {
    const command = client.contexts.get(interaction.commandName + interaction.commandType.toString());
    if (!command) {
      await interaction.reply({
        content: t("common.errors.COMMAND_NOT_FOUND"),
        ephemeral: true,
      });
      return;
    }
    const isChecked = await validateCommand(command, interaction, t);
    if (!isChecked) return;
    try {
      await command.execute(interaction, client);
    } catch (err) {
      const errorId = client.logger.error(err);
      const content = {
        content: t("common.errors.ERROR_ID", { ID: errorId }),
      };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          ...content,
          embeds: [errorEmbed(t("common.errors.EMBED_TITLE"), t("common.errors.EMBED_DESCRIPTION"))],
          components: [errorBtn(t("common.errors.BUTTON_LABEL"), errorId)],
        });
      } else {
        await interaction.reply({
          ...content,
          embeds: [errorEmbed(t("common.errors.EMBED_TITLE"), t("common.errors.EMBED_DESCRIPTION"))],
          components: [errorBtn(t("common.errors.BUTTON_LABEL"), errorId)],
          ephemeral: true,
        });
      }
    }
  }

  // Buttons
  if (interaction.isButton()) {
    const button = client.buttons.find((btn) => interaction.customId.startsWith(btn.data.name));
    if (!button) return;

    try {
      await button.execute(interaction, t, client);
    } catch (err) {
      const errorId = client.logger.error(err);
      const content = {
        content: t("common.errors.ERROR_ID", { ID: errorId }),
      };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          ...content,
          embeds: [errorEmbed(t("common.errors.EMBED_TITLE"), t("common.errors.EMBED_DESCRIPTION"))],
          components: [errorBtn(t("common.errors.BUTTON_LABEL"), errorId)],
        });
      } else {
        await interaction.reply({
          ...content,
          embeds: [errorEmbed(t("common.errors.EMBED_TITLE"), t("common.errors.EMBED_DESCRIPTION"))],
          components: [errorBtn(t("common.errors.BUTTON_LABEL"), errorId)],
          ephemeral: true,
        });
      }
    }
  }

  // Modals
  if (interaction.isModalSubmit()) {
    if (interaction.customId === "errorModal") {
      await interaction.reply({
        content: t("common.errors.ERROR_MODAL.SUCCESS"),
        ephemeral: true,
      });
      const commandUsed = interaction.fields.getTextInputValue("commandUsed");
      const whatHappened = interaction.fields.getTextInputValue("whatHappened");
      const errorId = interaction.fields.getTextInputValue("errorId");
      const embed = new EmbedBuilder()
        .setTitle("BUG REPORT")
        .addFields(
          { name: `Command Used`, value: `\`${commandUsed}\`` },
          {
            name: `User`,
            value: `${interaction.user.username} \`[${interaction.user.id}]\``,
          },
          {
            name: `Server`,
            value: `${interaction.guild?.name} \`[${interaction.guild?.id}]\``,
          },
          { name: `What Happened`, value: `${whatHappened}` },
        )
        .setColor("Blurple")
        .setTimestamp();
      bLogger
        ?.send({
          username: "Bug Report",
          content: `Error ID: \`${errorId}\``,
          embeds: [embed],
        })
        .catch(() => {});
    }
  }

  // Select Menus
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === "skytimes-details") {
      const buildEmbed = (data: string, info: { title: string; description: string }, type: string, credit: string) => {
        return new EmbedBuilder()
          .setTitle(type + " Times")
          .setDescription(`${info.description}\n\n${t("times-embed.TIMELINE")}\n` + data + `\n\n© ${credit}`)
          .setColor("Random");
      };
      const fulltimes = eventTimes();
      const value = interaction.values[0];
      await interaction.update({
        components: interaction.message.components,
      });
      switch (value) {
        case "geyser":
          await interaction.followUp({
            embeds: [
              buildEmbed(fulltimes.geyser, getTimes(0, t, "geyser"), t("times-embed.GEYSER"), "Clement").setImage(
                "https://media.discordapp.net/attachments/867638574571323424/1252998364941914243/Visit_Geyser_Clement.png?ex=66744129&is=6672efa9&hm=8d76d1767aca362d23547b1e3beb2b610f58e4fbec24b12af56fdc745f7074e8&",
              ),
            ],
            ephemeral: true,
          });
          break;
        case "grandma":
          await interaction.followUp({
            embeds: [
              buildEmbed(fulltimes.grandma, getTimes(0, t, "grandma"), t("times-embed.GRANDMA"), "Clement").setImage(
                "https://media.discordapp.net/attachments/867638574571323424/1252998366288416849/Visit_Grandma_Clement.png?ex=6674412a&is=6672efaa&hm=7228b695ec7008204fede2f3d6b4864a06a7cfa25a14ab4d7572957ee940044c&",
              ),
            ],
            ephemeral: true,
          });
          break;
        case "turtle":
          await interaction.followUp({
            embeds: [
              buildEmbed(fulltimes.turtle, getTimes(0, t, "turtle"), t("times-embed.TURTLE"), "Velvet").setImage(
                "https://media.discordapp.net/attachments/867638574571323424/1252998363205472316/Visit_Turtle_Velvet.jpg?ex=66744129&is=6672efa9&hm=8c189ff8501fc88810606b832addbea8a9a81eb7a7a6b17019ff1ced593e1ae8&",
              ),
            ],
            ephemeral: true,
          });
          break;
        default:
          await interaction.followUp({
            content: "Not a valid choice",
            ephemeral: true,
          });
      }
    }

    if (interaction.customId === "daily_quests_select") {
      await interaction.deferUpdate();
      const index = parseInt(interaction.values[0]);
      const data = await client.database.getDailyQuests();
      const response = dailyQuestEmbed(data, index);
      await interaction.editReply({
        ...response,
      });
    }
  }
};

/** Validates requirements for Slash and Context Menu commands */
async function validateCommand(
  command: SlashCommand | ContextMenuCommand<"UserContext" | "MessageContext">,
  interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction,
  t: ReturnType<typeof getTranslator>,
): Promise<boolean> {
  const client = interaction.client as SkyHelper;
  // Handle owner commands
  if (command.ownerOnly && !config.OWNER.includes(interaction.user.id)) {
    await interaction.reply({
      content: "This command is for owner(s) only.",
      ephemeral: true,
    });
    return false;
  }
  // Handle command user required permissions
  if (command.data.userPermissions) {
    if (interaction.inGuild()) {
      if (interaction.inCachedGuild() && !interaction.member.permissions.has(command.data.userPermissions)) {
        await interaction.reply({
          content: t("common.errors.NO_PERMS_USER", {
            PERMISSIONS: parsePerms([command.data.userPermissions as unknown as Permission]),
          }),
          ephemeral: true,
        });
        return false;
      }
      if (!interaction.inCachedGuild()) {
        await interaction.reply({
          content: t("common.errors.NOT_A_SERVER"),
          ephemeral: true,
        });
        return false;
      }
    }
  }

  // Handle bot's required permissions
  if (command.data.botPermissions) {
    if (interaction.inGuild()) {
      if (interaction.inCachedGuild() && !interaction.guild.members.me?.permissions.has(command.data.botPermissions)) {
        await interaction.reply({
          content: t("common.errors.NO_PERMS_BOT", {
            PERMISSIONS: parsePerms(command.data.botPermissions as unknown as Permission),
          }),
          ephemeral: true,
        });
        return false;
      }
      if (!interaction.inCachedGuild()) {
        await interaction.reply({
          content: t("common.errors.NOT_A_SERVER"),
          ephemeral: true,
        });
        return false;
      }
    }
  }

  // Check cooldowns
  if (command?.cooldown && !client.config.OWNER.includes(interaction.user.id)) {
    const { cooldowns } = client;

    if (!cooldowns.has(command.data.name)) {
      cooldowns.set(command.data.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.data.name);
    const cooldownAmount = command.cooldown * 1000;

    if (timestamps?.has(interaction.user.id)) {
      const expirationTime = (timestamps.get(interaction.user.id) as number) + cooldownAmount;

      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1000);
        await interaction.reply({
          content: t("common.errors.COOLDOWN", {
            COMMAND: `</${interaction.commandName}:${interaction.commandId}>`,
            TIME: `<t:${expiredTimestamp}:R>`,
          }),
          ephemeral: true,
        });
        return false;
      }
    }

    timestamps?.set(interaction.user.id, now);
    setTimeout(() => timestamps?.delete(interaction.user.id), cooldownAmount);
  }

  return true;
}
export default interactionHandler;
