import { getTranslator } from "@/i18n";
import type { Event } from "@/structures/Event";
import { validateInteractions } from "@/utils/validators";
import { InteractionType, Utils as IntUtils, MessageFlags, type GatewayDispatchEvents } from "@discordjs/core";
import { InteractionOptionResolver } from "@sapphire/discord-utilities";

const interactionHandler: Event<GatewayDispatchEvents.InteractionCreate> = async (client, { data: interaction, api }) => {
  const user = interaction.member?.user ?? interaction.user!;
  const userSettings = await client.schemas.getUser(user);
  const guild = interaction.guild_id ? client.guilds.get(interaction.guild_id) : null;
  const guildSettings = guild ? await client.schemas.getSettings(guild) : null;
  const t = getTranslator(userSettings.language?.value ?? guildSettings?.language?.value ?? "en-US");
  if (interaction.type === InteractionType.ApplicationCommand) {
    if (IntUtils.isChatInputApplicationCommandInteraction(interaction)) {
      const command = client.commands.get(interaction.data.name);
      if (!command || !command.interactionRun) return;
      const options = new InteractionOptionResolver(interaction);
      const validate = validateInteractions({ command, interaction, options, client, t });
      if (!validate.status) {
        return void (await api.interactions.reply(interaction.id, interaction.token, {
          content: validate.message,
          flags: MessageFlags.Ephemeral,
        }));
      }
      try {
        await command.interactionRun({
          interaction: interaction,
          api: client.api,
          client,
          options,
          t,
        });
      } catch (_error) {
        await api.interactions.reply(interaction.id, interaction.token, {
          content: "Error",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  }
};

export default interactionHandler;
