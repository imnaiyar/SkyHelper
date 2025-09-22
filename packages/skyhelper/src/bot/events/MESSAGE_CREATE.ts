import updateDailyQuests from "@/handlers/updateDailyQuests";
import { getTranslator } from "@/i18n";
import type { Event } from "@/structures";
import { MessageFlags } from "@/utils/classes/MessageFlags";
import { validateMessage } from "@/utils/validators";
import * as Sentry from "@sentry/node";
import {
  ChannelType,
  ComponentType,
  type APIActionRowComponent,
  type APIButtonComponent,
  type APIEmbed,
  type APITextChannel,
  type GatewayDispatchEvents,
} from "@discordjs/core";
import { DateTime } from "luxon";

const messageHandler: Event<GatewayDispatchEvents.MessageCreate> = async (client, { data: message, api }) => {
  if (message.channel_id === client.config.QUEST_UPDATE_CHANNEL.CHANNEL_ID) {
    await updateDailyQuests(message, client);
    return;
  }
  if (message.author.bot) return;
  const guild = message.guild_id ? client.guilds.get(message.guild_id) : null;

  const channel = client.channels.get(message.channel_id) as APITextChannel | undefined;
  // context for sentry
  try {
    // Check for bot's mention
    if (message.content.startsWith(`<@!${client.user.id}>`)) {
      api.channels
        .createMessage(message.channel_id, {
          content: "Hello there!...",
          message_reference: {
            message_id: message.id,
          },
          allowed_mentions: { replied_user: false },
        })
        .catch(() => {});
      return;
    }
    const guildSettings = guild ? await client.schemas.getSettings(guild) : null;
    // Prefix
    const prefix = (guildSettings ? guildSettings.prefix || null : null) ?? client.config.PREFIX;

    if (!message.content.startsWith(prefix)) return;

    // Flags
    const flags = new MessageFlags(message.content);
    const msg = flags.removeFlags();
    const args = msg.slice(prefix.length).trim().split(/ +/g);
    const commandName = args.shift()!.toLowerCase();
    const command = client.commands.get(commandName) ?? client.commands.find((cmd) => cmd.prefix?.aliases?.includes(commandName));
    if (!command || !command.messageRun) return;
    const scope = new Sentry.Scope();
    scope.setUser({ id: message.author.id, username: message.author.username });

    const context = {
      guild: guild ? { id: guild.id, name: guild.name, owner: guild.owner_id } : message.guild_id,
      channel: channel
        ? {
            id: channel.id,
            type: ChannelType[channel.type],
            name: channel.name,
          }
        : message.channel_id + " Probably in DM",
      message: {
        id: message.id,
        content: message.content,
        command: "", // To be added later
      },
      author: {
        id: message.author.id,
        username: message.author.username,
        displayName: message.author.global_name ?? message.author.username,
      },
      occurenceTime: DateTime.now().setZone("Asia/Kolkata").toFormat("yyyy-MM-dd HH:mm:ss"),
    };
    scope.setContext("Metadata", context);
    const userSettings = await client.schemas.getUser(message.author);
    const t = getTranslator(userSettings.language?.value ?? guildSettings?.language?.value ?? "en-US");

    scope.setExtra("command", command.name);

    // Check if command is 'OWNER' only.
    if (command.ownerOnly && !client.config.OWNER.includes(message.author.id)) return;
    const validation = await validateMessage({ command, message, args, flags, t, client, prefix });
    if (!validation.status) {
      if (validation.message) {
        await api.channels.createMessage(message.channel_id, validation.message);
      }
      return;
    }

    try {
      await command.messageRun({ message, args, flags, t, client }, api);
    } catch (error) {
      const id = client.logger.error(error, scope);
      const embed: APIEmbed = {
        title: t("errors:EMBED_TITLE"),
        description: t("errors:EMBED_DESCRIPTION"),
      };

      const row: APIActionRowComponent<APIButtonComponent> = {
        type: 1,
        components: [
          {
            type: ComponentType.Button,
            label: t("errors:BUTTON_LABEL"),
            custom_id: client.utils.store.serialize(client.utils.customId.BugReports, { error: id, user: null }),
            style: 2,
          },
        ],
      };
      await api.channels.createMessage(message.channel_id, {
        content: t("errors:ERROR_ID", { ID: id }),
        embeds: [embed],
        components: [row],
        message_reference: {
          message_id: message.id,
        },
      });
      return;
    }
  } catch (error) {
    client.logger.error(error);
  }
};
export default messageHandler;
