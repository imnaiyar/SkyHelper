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
import { resolveColor } from "@skyhelperbot/utils";
import { DateTime } from "luxon";
import { handleErrorModal, handleShardsCalendarModal } from "@/handlers/modalHandler";
import { handleSkyTimesSelect } from "@/handlers/handleSelectInteraction";
import { handleSingleMode } from "@/modules/inputCommands/fun/sub/scramble";
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
        if (interactionLogWebhook && !client.config.OWNER.includes(helper.user.id)) {
          await api.webhooks.execute(interactionLogWebhook.id, interactionLogWebhook.token, {
            embeds: [buildInteractionLog(interaction, client, options)],
          });
        }
        return;
      } catch (error) {
        const id = client.logger.error(error, scope);
        await helper
          .reply(getErrorResponse(id, t))
          .catch(() => helper.followUp(getErrorResponse(id, t)))
          .catch(() => {});
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
        await helper
          .reply(getErrorResponse(id, t))
          .catch(() => helper.followUp(getErrorResponse(id, t)))
          .catch(() => {});
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
      const parsed = client.utils.parseCustomId(interaction.data.custom_id);

      // handle scrambled play again here
      if (parsed.id === "scramble-play-single") {
        await helper.defer();
        await handleSingleMode(helper);
        return;
      }

      const button = client.buttons.find((btn) => parsed.id.startsWith(btn.data.name));

      if (!button) return;
      try {
        await button.execute(interaction, t, helper, parsed);
      } catch (err) {
        const errorId = client.logger.error(err, scope);
        await helper
          .reply(getErrorResponse(errorId, t))
          .catch(() => helper.followUp(getErrorResponse(errorId, t)))
          .catch(() => {});
        return;
      }
    }

    // #region Modal
    if (helper.isModalSubmit(interaction)) {
      const { id } = client.utils.parseCustomId(interaction.data.custom_id);
      switch (id) {
        case "errorModal":
          await handleErrorModal(helper);
          return;
        case "shards-calendar-modal-date":
          await handleShardsCalendarModal(helper);
          return;
        default:
          return;
      }
    }

    // #region selects
    if (helper.isSelect(interaction)) {
      const { id } = client.utils.parseCustomId(interaction.data.custom_id);
      switch (id) {
        case "skytimes-details":
          await handleSkyTimesSelect(interaction, helper);
          return;
        default:
          return;
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
    flags: 64,
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
