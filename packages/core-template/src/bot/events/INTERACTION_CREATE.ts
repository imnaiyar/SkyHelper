import type { getTranslator } from "#bot/i18n";
import type { Event } from "#bot/structures/Event";
import {
  ApplicationCommandType,
  InteractionType,
  type APIChatInputApplicationCommandInteraction,
  type GatewayDispatchEvents,
} from "@discordjs/core";
import { InteractionOptionResolver } from "@sapphire/discord-utilities";

const interactionHandler: Event<GatewayDispatchEvents.InteractionCreate> = (client, { data: interaction }) => {
  if (interaction.type !== InteractionType.ApplicationCommand) return;
  const command = client.commands.get(interaction.data.name);
  if (!command || !command.interactionRun) return;
  if (interaction.data.type !== ApplicationCommandType.ChatInput) return;
  const options = new InteractionOptionResolver(interaction);
  // @ts-expect-error i18n is not implemented yet
  command.interactionRun({
    interaction: interaction as APIChatInputApplicationCommandInteraction,
    api: client.api,
    client,
    options,
  });
};

export default interactionHandler;
