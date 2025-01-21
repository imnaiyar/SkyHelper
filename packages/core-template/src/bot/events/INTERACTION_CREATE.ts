import { getTranslator } from "@/i18n";
import type { Event } from "@/structures/Event";
import { validateInteractions } from "@/utils/validators";
import {
  ChannelType,
  InteractionType,
  Utils as IntUtils,
  MessageFlags,
  type APIActionRowComponent,
  type APIApplicationCommandDMInteraction,
  type APIApplicationCommandInteraction,
  type APIButtonComponent,
  type APIEmbed,
  type GatewayDispatchEvents,
} from "@discordjs/core";
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

function errorEmbed(title: string, description: string): APIEmbed {
  return {
    title,
    description,
  };
}

function errorBtn(label: string, erroId: string): APIActionRowComponent<APIButtonComponent> {
  return {
    type: 1,
    components: [
      {
        type: 2,
        style: 1,
        label,
        custom_id: erroId,
      },
    ],
  };
}

function formatIfUserApp(int: APIApplicationCommandInteraction): string | null {
  const isUserApp = Object.keys(int.authorizing_integration_owners).every((k) => k === "1");
  if (!isUserApp) return null;
  const inGuild = IntUtils.isApplicationCommandGuildInteraction(int);
  const isDm = int.channel.type === ChannelType.DM && `DM - Channel: ${int.channel.id} | Owner: ${int.channel.recipients?.[0] ? `${int.channel.recipients[0].username} (${int.channel.recipients[0].id})` : "Unknown"}`;
  const inGroupDM = int.channel.type === ChannelType.GroupDM;
  return ("User App" + 
    (inGuild ? `Guild: ${int.guild_id}` : 
      isDm
      inGroupDM ? `Group DM - ${int.channel} ${int.channel.id}` : 
      `DM: ${(int as APIApplicationCommandDMInteraction).channel} (${int.channel.id}`)
    )
  )
}

