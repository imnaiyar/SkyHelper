import { ContextTypes, IntegrationTypes } from "#src/libs/types";
import { SkyHelper, SlashCommand } from "#structures";
import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
// @ts-ignore
import pkg from "#root/package.json" assert { type: "json" };
import { handleTimestamp } from "./sub/timestamp.js";

export default {
  data: {
    name: "utils",
    description: "Utilities",
    integration_types: [IntegrationTypes.Guilds, IntegrationTypes.Users],
    contexts: [ContextTypes.PrivateChannels, ContextTypes.Guild, ContextTypes.BotDM],
    options: [
      {
        name: "timestamp",
        description: "get unix timestamp for the given date",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "time",
            description: "The time to convert (format: HH mm ss)",
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "timezone",
            description: "Your timezone in the format: Continent/City",
            type: ApplicationCommandOptionType.String,
            required: false,
          },
          {
            name: "date",
            description: "The date to convert (format: DD)",
            type: ApplicationCommandOptionType.Integer,
            required: false,
          },
          {
            name: "month",
            description: "The month to convert (format: MM)",
            type: ApplicationCommandOptionType.Integer,
            required: false,
          },
          {
            name: "year",
            description: "The year to convert (format: YYYY)",
            type: ApplicationCommandOptionType.Integer,
            required: false,
          },
        ],
      },
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
    const sub = interaction.options.getSubcommand();
    switch (sub) {
      case "credits":
        // await handleCredits(interaction);
        break;
      case "botinfo": {
        const reply = await interaction.deferReply({ fetchReply: true });
        await handleInfo(interaction, reply.createdTimestamp);
        break;
      }
      case "contact-us":
        // await handleContact(interaction);
        break;
      case "timestamp":
        await handleTimestamp(interaction);
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
