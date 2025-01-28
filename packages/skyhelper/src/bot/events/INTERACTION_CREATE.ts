import { getTranslator } from "@/i18n";
import type { SkyHelper } from "@/structures/Client";
import type { Command } from "@/structures/Command";
import type { Event } from "@/structures/Event";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import Utils from "@/utils/classes/Utils";
import { validateInteractions } from "@/utils/validators";
import * as Sentry from "@sentry/node";
import {
  ApplicationCommandType,
  ChannelType,
  InteractionType,
  Utils as IntUtils,
  MessageFlags,
  type APIApplicationCommandInteraction,
  type APIChatInputApplicationCommandInteraction,
  type APIEmbed,
  type GatewayDispatchEvents,
} from "@discordjs/core";
import { InteractionOptionResolver } from "@sapphire/discord-utilities";
import { resolveColor, SkytimesUtils } from "@skyhelperbot/utils";
import { DateTime } from "luxon";
import Embeds from "@/utils/classes/Embeds";
const interactionLogWebhook = process.env.COMMANDS_USED ? Utils.parseWebhookURL(process.env.COMMANDS_USED) : null;

const formatCommandOptions = (int: APIChatInputApplicationCommandInteraction, options: InteractionOptionResolver) =>
  // @ts-expect-error these properties exists, but they are private
  `/${[int.data.name, options.group, options.subcommand, options.hoistedOptions?.map((o) => `${o.name}:${o.value}`)].filter(Boolean).join(" ")}`;

const interactionHandler: Event<GatewayDispatchEvents.InteractionCreate> = async (client, { data: interaction, api }) => {
  const helper = new InteractionHelper(interaction, client);
  const guild = interaction.guild_id ? client.guilds.get(interaction.guild_id) : null;

  const scope = new Sentry.Scope();
  scope.setUser({ id: helper.user.id, username: helper.user.username });

  // Add some contexts for sentry
  scope.setContext("Metadata", {
    guild: interaction.guild
      ? { id: interaction.guild.id, name: guild?.name || "Unknown", owner: guild?.owner_id || "Unknown" }
      : interaction.guild_id,
    channel: {
      id: interaction.channel?.id,
      type: interaction.channel && ChannelType[interaction.channel.type],
      name: "name" in interaction.channel! ? interaction.channel.name : null,
    },
    interaction: {
      id: interaction.id,
      type: InteractionType[interaction.type],
      command: helper.isCommand(interaction) ? interaction.data.name : null,
      fullCommand: helper.isChatInput(interaction)
        ? formatCommandOptions(interaction, new InteractionOptionResolver(interaction))
        : null,
      commandType: helper.isCommand(interaction) ? ApplicationCommandType[interaction.data.type] : null,
      // @ts-expect-error for custom id, too much checks just put it there
      customId: interaction.data?.custom_id,
    },
    user: {
      id: helper.user.id,
      username: helper.user.username,
      displayName: helper.user.global_name || helper.user.username,
    },
    occurenceTime: DateTime.now().setZone("Asia/Kolkata").toFormat("yyyy LLLL dd HH:mm:ss"),
  });

  try {
    await helper.initializeT();
    const { t } = helper; // TODO: do not pass it seperately in callbacks
    // Interaction helper utility class
    // #region Chat input
    if (helper.isChatInput(interaction)) {
      const command = client.commands.get(interaction.data.name);
      if (!command || !command.interactionRun) {
        await helper.reply({
          content: t("errors:COMMAND_NOT_FOUND"),
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      const options = new InteractionOptionResolver(interaction);
      const validate = await validateInteractions({ command, interaction, options, helper, t });
      if (!validate.status) {
        return void (await api.interactions.reply(interaction.id, interaction.token, {
          content: validate.message,
          flags: MessageFlags.Ephemeral,
        }));
      }
      try {
        await command.interactionRun({
          interaction,
          helper,
          options,
          t,
        });
        // Log the interaction
        if (interactionLogWebhook) {
          await api.webhooks.execute(interactionLogWebhook.id, interactionLogWebhook.token, {
            embeds: [buildInteractionLog(interaction, client, options)],
          });
        }
        return;
      } catch (error) {
        const id = client.logger.error(error, scope);
        if (helper.deferred || helper.replied) {
          await helper.followUp(getErrorResponse(id, t));
        } else {
          await helper.reply(getErrorResponse(id, t));
        }
        return;
      }
    }

    // #region autocomplet
    if (helper.isAutocomplete(interaction)) {
      const command = client.commands.get(interaction.data.name) as Command<true> | undefined;
      if (!command || !command.autocomplete) {
        await helper.respond({
          choices: [
            {
              name: t("errors:autoCompleteCOMMAND_NOT_FOUND"),
              value: "none",
            },
          ],
        });
        return;
      }

      try {
        await command.autocomplete({ interaction, options: new InteractionOptionResolver(interaction), helper, t });
        return;
      } catch (err) {
        client.logger.error(err, scope);
        await helper.respond({
          choices: [
            {
              name: t("errors:AUTOCOMPLETE_ERROR"),
              value: "none",
            },
          ],
        });
        return;
      }
    }
    // #region context menu
    if (helper.isContextMenu(interaction)) {
      const command = client.contexts.get(interaction.data.name + interaction.data.type);
      if (!command) {
        await helper.reply({
          content: t("errors:COMMAND_NOT_FOUND"),
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      const options = new InteractionOptionResolver(interaction);
      const validate = await validateInteractions({ command, interaction, options, helper, t });
      if (!validate.status) {
        return void (await helper.reply({
          content: validate.message,
          flags: MessageFlags.Ephemeral,
        }));
      }

      try {
        await command.execute(interaction, helper, t, new InteractionOptionResolver(interaction));
      } catch (error) {
        const id = client.logger.error(error, scope);
        if (helper.deferred || helper.replied) {
          await helper.followUp(getErrorResponse(id, t));
        } else {
          await helper.reply(getErrorResponse(id, t));
        }
        return;
      }
    }

    // for component interactions check if it's allowed for the user
    if (IntUtils.isMessageComponentInteraction(interaction)) {
      const parsed = client.utils.parseCustomId(interaction.data.custom_id);
      if (parsed.user && parsed.user !== helper.user.id) {
        return void (await helper.reply({
          content: t("errors:NOT-ALLOWED"),
          flags: MessageFlags.Ephemeral,
        }));
      }
    }

    // #region button
    if (helper.isButton(interaction)) {
      const { id } = client.utils.parseCustomId(interaction.data.custom_id);
      const button = client.buttons.find((btn) => id.startsWith(btn.data.name));

      if (!button) return;
      try {
        await button.execute(interaction, t, helper);
      } catch (err) {
        const errorId = client.logger.error(err, scope);
        if (helper.deferred || helper.replied) {
          await helper.followUp(getErrorResponse(errorId, t));
        } else {
          await helper.reply(getErrorResponse(errorId, t));
        }
        return;
      }
    }

    // #region Modal
    if (helper.isModalSubmit(interaction)) {
      if (interaction.data.custom_id === "errorModal") {
        await helper.reply({
          content: t("errors:ERROR_MODAL.SUCCESS"),
          flags: 64,
        });
        const fields = interaction.data.components.map((c) => c.components[0]);
        const commandUsed = fields.find((f) => f.custom_id === "commandUsed")?.value;
        const whatHappened = fields.find((f) => f.custom_id === "whatHappened")?.value;
        const errorId = fields.find((f) => f.custom_id === "errorId")?.value;
        const embed: APIEmbed = {
          title: "BUG REPORT",
          fields: [
            { name: "Command Used", value: `\`${commandUsed}\`` },
            {
              name: "User",
              value: `${helper.user.username} \`[${helper.user.id}]\``,
            },
            {
              name: "Server",
              value: `${guild?.name} \`[${interaction.guild?.id}]\``,
            },
            { name: "What Happened", value: `${whatHappened}` },
          ],
          color: resolveColor("Blurple"),
          timestamp: new Date().toISOString(),
        };
        const errorWb = process.env.BUG_REPORTS ? Utils.parseWebhookURL(process.env.BUG_REPORTS) : null;
        if (errorWb) {
          await api.webhooks.execute(errorWb.id, errorWb.token, {
            username: "Bug Report",
            content: `Error ID: \`${errorId}\``,
            embeds: [embed],
          });
        }
      }
    }

    // #region Select Menus
    if (helper.isStringSelect(interaction)) {
      const id = Utils.parseCustomId(interaction.data.custom_id).id;
      if (id === "skytimes-details") {
        const value = interaction.data.values[0];
        const { event, allOccurences, status } = SkytimesUtils.getEventDetails(value);
        const embed: APIEmbed = {
          title: event.name + " Times",
          footer: {
            text: "SkyTimes",
          },
        };
        let desc = "";
        if (status.active) {
          desc += `${t("features:times-embed.ACTIVE", {
            EVENT: event.name,
            DURATION: status.duration,
            ACTIVE_TIME: Utils.time(status.startTime.toUnixInteger(), "t"),
            END_TIME: Utils.time(status.endTime.toUnixInteger(), "t"),
          })}\n- -# ${t("features:times-embed.NEXT-OCC-IDLE", {
            TIME: Utils.time(status.nextTime.toUnixInteger(), event.occursOn ? "F" : "t"),
          })}`;
        } else {
          desc += t("features:times-embed.NEXT-OCC", {
            TIME: Utils.time(status.nextTime.toUnixInteger(), event.occursOn ? "F" : "t"),
            DURATION: status.duration,
          });
        }
        desc += `\n\n**${t("features:times-embed.TIMELINE")}**\n${allOccurences.slice(0, 2000)}`;

        if (event.infographic) {
          desc += `\n\n© ${event.infographic.by}`;
          embed.image = { url: event.infographic.image };
        }
        embed.description = desc;
        return void helper.reply({ embeds: [embed], flags: 64 });
      }

      if (id === "daily_quests_select") {
        await helper.deferUpdate();
        const index = parseInt(interaction.data.values[0]);
        const data = await client.schemas.getDailyQuests();
        const response = Embeds.dailyQuestEmbed(data, index);
        await helper.editReply({
          ...response,
        });
      }
    }
  } catch (err) {
    client.logger.error(err, scope);
  }
};

export default interactionHandler;

// Ugly codes begin...uggh
function getErrorResponse(id: string, t: ReturnType<typeof getTranslator>) {
  return {
    content: t("errors:ERROR_ID", { ID: id }),
    embeds: [{ title: t("errors:EMBED_TITLE"), description: t("errors:EMBED_DESCRIPTION") }],
    components: [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 1,
            label: t("errors:BUTTON_LABEL"),
            custom_id: "error-report;error:" + id,
          },
        ],
      },
    ],
  };
}

function formatIfUserApp(int: APIApplicationCommandInteraction): string | null {
  const isUserApp = Object.keys(int.authorizing_integration_owners).every((k) => k === "1");
  if (!isUserApp) return null;
  const inGuild = IntUtils.isApplicationCommandGuildInteraction(int);
  const isDm =
    int.channel.type === ChannelType.DM &&
    `DM - Channel: ${int.channel.id} | Owner: ${int.channel.recipients?.[0] ? `${int.channel.recipients[0].username} (${int.channel.recipients[0].id})` : "Unknown"}`;
  const inGroupDM =
    int.channel.type === ChannelType.GroupDM &&
    `Group DM - Owner: \`${int.channel.owner_id}\` | Channel: ${int.channel.name || "None"} (\`${int.channel.id}\`)`;
  return "User App" + (inGuild ? `Guild: \`${int.guild_id}\`` : (isDm ?? inGroupDM));
}

function buildInteractionLog(
  int: APIApplicationCommandInteraction,
  client: SkyHelper,
  options: InteractionOptionResolver,
): APIEmbed {
  const formattedCommand = IntUtils.isChatInputApplicationCommandInteraction(int) ? formatCommandOptions(int, options) : null;
  const guild = int.guild_id ? client.guilds.get(int.guild_id)! : null;
  const user = int.member?.user ?? int.user!;
  return {
    author: { icon_url: client.utils.getUserAvatar(user), name: user.username },
    title: "New Command Used",
    fields: [
      {
        name: "Command",
        value: `\`${formattedCommand ?? int.data.name}\` (Type: ${ApplicationCommandType[int.data.type]})`,
      },
      {
        name: "User",
        value: `${user.username} (\`${user.id}\`)`,
      },
      ...(int.guild_id
        ? [
            {
              name: "Guild",
              value: `${guild?.name || "Unknown"} (\`${int.guild_id}\`)`,
            },
          ]
        : []),
      {
        name: "Extra",
        value:
          formatIfUserApp(int) ??
          `Channel - ${int.channel.name || "Unknown"} | Type: ${ChannelType[int.channel.type]} (\`${int.channel.id}\`)`,
      },
    ],
    color: resolveColor("Blurple"),
  };
}
