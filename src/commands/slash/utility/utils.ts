import { ContextTypes, IntegrationTypes } from "#src/libs/types";
import { SkyHelper, SlashCommand } from "#structures";
import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
// @ts-ignore
import pkg from "#root/package.json" assert { type: "json" };

export default {
  data: {
    name: "utils",
    description: "Utilities",
    integration_types: [IntegrationTypes.Guilds, IntegrationTypes.Users],
    contexts: [ContextTypes.PrivateChannels, ContextTypes.Guild, ContextTypes.BotDM],
    options: [
      {
        name: "credits",
        description: "get the bot's credits",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "botinfo",
        description: "get the bot's info",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "contact-us",
        description: "for suggestions/bug reports/contacting us or just anything",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },
  category: "Utility",
  async execute(interaction) {
    const reply = await interaction.deferReply({ fetchReply: true });
    const sub = interaction.options.getSubcommand();
    switch (sub) {
      case "credits":
        // await handleCredits(interaction);
        break;
      case "botinfo":
        await handleInfo(interaction, reply.createdTimestamp);
        break;
      case "contact-us":
        // await handleContact(interaction);
        break;
    }
  },
} satisfies SlashCommand;

async function handleInfo(interaction: ChatInputCommandInteraction, time: number): Promise<void> {
  const { client } = interaction as unknown as { client: SkyHelper };
  const guilds = client.guilds.cache.size;
  const users = client.guilds.cache.reduce((size, g) => size + g.memberCount, 0);
  let desc = "";
  desc += `❒ Total guilds: ${guilds}\n`;
  desc += `❒ Total users: ${users}\n`;
  desc += `❒ Websocket Ping: ${client.ws.ping} ms\n`;
  desc += `❒ Latency: ${time - interaction.createdTimestamp} ms\n`;
  desc += "\n";
  const embed = new EmbedBuilder()
    .setAuthor({ name: "Bot Info", iconURL: client.user.displayAvatarURL() })
    .setTitle(client.user.username)
    .setDescription(desc + `**Version:** v${pkg.version}\n**Uptime:** ${client.uptime}`);
  await interaction.editReply({ embeds: [embed] });
}
