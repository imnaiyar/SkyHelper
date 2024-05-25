import { ContextTypes, IntegrationTypes } from "#src/libs/types";
import type { SkyHelper, SlashCommand } from "#structures";
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
// @ts-ignore
import pkg from "#root/package.json" assert { type: "json" };
import { handleTimestamp } from "./sub/timestamp.js";
import { getChangelog, getSuggestion } from "./sub/utility.js";

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
        name: "changelog",
        description: "bot's changelog",
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
      case "changelog":
        await getChangelog(interaction);
        break;
      case "botinfo": {
        const reply = await interaction.deferReply({ fetchReply: true });
        await handleInfo(interaction, reply.createdTimestamp);
        break;
      }
      case "contact-us":
        await getSuggestion(interaction);
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
  desc += `<:servers:1243977429542764636> Total servers: ${guilds}\n`;
  desc += `<:users:1243977425725952161> Total users: ${users}\n`;
  desc += `<a:uptime:1228956558113771580> Websocket Ping: ${client.ws.ping} ms\n`;
  desc += `<:latency:1243977421812924426> Latency: ${time - interaction.createdTimestamp} ms\n`;
  desc += "\n";
  const embed = new EmbedBuilder()
    .setAuthor({ name: "Bot Info", iconURL: client.user.displayAvatarURL() })
    .setTitle(client.user.username)
    .setDescription(desc + `**Version:** v${pkg.version}\n**Uptime:** ${timeformat(client.uptime)}`);
  const btns = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setURL("https://discord.com/oauth2/authorize?client_id=1121541967730450574")
      .setLabel("Invite")
      .setStyle(ButtonStyle.Link),
    new ButtonBuilder().setURL(client.config.Support).setLabel("Support Server").setStyle(ButtonStyle.Link),
  );
  await interaction.editReply({ embeds: [embed], components: [btns] });
}

function timeformat(timeInSeconds: number) {
  const days = Math.floor((timeInSeconds % 31536000) / 86400);
  const hours = Math.floor((timeInSeconds % 86400) / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.round(timeInSeconds % 60);
  return (
    (days > 0 ? `${days} days, ` : "") +
    (hours > 0 ? `${hours} hours, ` : "") +
    (minutes > 0 ? `${minutes} minutes, ` : "") +
    (seconds > 0 ? `${seconds} seconds` : "")
  );
}
