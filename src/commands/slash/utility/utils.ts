import { ContextTypes, IntegrationTypes } from "#libs";
import type { SkyHelper, SlashCommand } from "#structures";
import os from "node:os";
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  channelMention,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { useTranslations as x } from "#handlers/useTranslation";
import pkg from "#root/package.json" assert { type: "json" };
import { handleTimestamp } from "./sub/timestamp.js";
import { getChangelog, getSuggestion } from "./sub/utility.js";
import { getTranslator } from "#src/i18n";

export default {
  async execute(interaction, t) {
    const sub = interaction.options.getSubcommand();
    switch (sub) {
      case "changelog":
        await getChangelog(interaction);
        break;
      case "botinfo": {
        const reply = await interaction.deferReply({ fetchReply: true });
        await handleInfo(interaction, t, reply.createdTimestamp);
        break;
      }
      case "contact-us":
        await getSuggestion(interaction, t);
        break;
      case "timestamp":
        await handleTimestamp(interaction);
    }
  },
  data: {
    name: "utils",
    name_localizations: x("commands.UTILS.name"),
    description: "Utilities",
    description_localizations: x("commands.UTILS.description"),
    integration_types: [IntegrationTypes.Guilds, IntegrationTypes.Users],
    contexts: [ContextTypes.PrivateChannels, ContextTypes.Guild, ContextTypes.BotDM],
    options: [
      {
        name: "timestamp",
        name_localizations: x("commands.UTILS.options.TIMESTAMP.name"),
        description: "get unix timestamp for the given date",
        description_localizations: x("commands.UTILS.options.TIMESTAMP.description"),
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "time",
            name_localizations: x("commands.UTILS.options.TIMESTAMP.options.TIME.name"),
            description: "The time to convert (format: HH mm ss)",
            description_localizations: x("commands.UTILS.options.TIMESTAMP.options.TIME.description"),
            type: ApplicationCommandOptionType.String,
            required: true,
          },
          {
            name: "timezone",
            name_localizations: x("commands.UTILS.options.TIMESTAMP.options.TIMEZONE.name"),
            description: "Your timezone in the format: Continent/City",
            description_localizations: x("commands.UTILS.options.TIMESTAMP.options.TIMEZONE.description"),
            type: ApplicationCommandOptionType.String,
            required: false,
          },
          {
            name: "date",
            name_localizations: x("commands.UTILS.options.TIMESTAMP.options.DATE.name"),
            description: "The date to convert (format: DD)",
            description_localizations: x("commands.UTILS.options.TIMESTAMP.options.DATE.description"),
            type: ApplicationCommandOptionType.Integer,
            required: false,
          },
          {
            name: "month",
            name_localizations: x("commands.UTILS.options.TIMESTAMP.options.MONTH.name"),
            description: "The month to convert (format: MM)",
            description_localizations: x("commands.UTILS.options.TIMESTAMP.options.MONTH.description"),
            type: ApplicationCommandOptionType.Integer,
            required: false,
          },
          {
            name: "year",
            name_localizations: x("commands.UTILS.options.TIMESTAMP.options.YEAR.name"),
            description: "The year to convert (format: YYYY)",
            description_localizations: x("commands.UTILS.options.TIMESTAMP.options.YEAR.description"),
            type: ApplicationCommandOptionType.Integer,
            required: false,
          },
        ],
      },
      {
        name: "changelog",
        name_localizations: x("commands.UTILS.options.CHANGELOG.name"),
        description: "bot's changelog",
        description_localizations: x("commands.UTILS.options.CHANGELOG.description"),
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "botinfo",
        name_localizations: x("commands.UTILS.options.BOTINFO.name"),
        description: "get the bot's info",
        description_localizations: x("commands.UTILS.options.BOTINFO.description"),
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "contact-us",
        name_localizations: x("commands.UTILS.options.CONTACT-US.name"),
        description: "for suggestions/bug reports/contacting us or just anything",
        description_localizations: x("commands.UTILS.options.CONTACT-US.description"),
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },
  category: "Utility",
} satisfies SlashCommand;

async function handleInfo(
  interaction: ChatInputCommandInteraction,
  t: ReturnType<typeof getTranslator>,
  time: number,
): Promise<void> {
  const { client } = interaction as unknown as { client: SkyHelper };
  const guilds = client.guilds.cache.size;
  const users = client.guilds.cache.reduce((size, g) => size + g.memberCount, 0);
  let desc = "";
  desc += `<:servers:1243977429542764636> ${t("common.bot.TOTAL_SERVER")}: ${guilds}\n`;
  desc += `<:users:1243977425725952161> ${t("common.bot.TOTAL_USERS")}: ${users}\n`;
  desc += `<a:uptime:1228956558113771580> ${t("common.bot.PING")}: ${client.ws.ping} ms\n`;
  desc += `<:latency:1243977421812924426> ${t("common.bot.LATENCY")}: ${time - interaction.createdTimestamp} ms\n`;
  desc += "\n";
  const embed = new EmbedBuilder()
    .setAuthor({ name: t("common.bot.EMBED_TITLE"), iconURL: client.user.displayAvatarURL() })
    .setTitle(client.user.username)
    .setDescription(
      desc +
        `**${t("common.bot.VERSION")}:** v${pkg.version}\n**${t("common.bot.UPTIME")}:** ${timeformat(client.uptime / 1000)}`,
    );
  if (interaction.inCachedGuild()) {
    const settings = await client.database.getSettings(interaction.guild);
    embed.addFields({
      name: t("common.bot.GUILD_SETTINGS") + ` (\`${interaction.guild.name}\`)`,
      value: `**${t("common.bot.LANGUAGE")}**: ${settings.language?.value ? `${settings.language.name} (${settings.language.flag} \`${settings.language.value}\`)` : "English (🇺🇸 `en-US`)(default)"}\n**${t("common.bot.ANNOUNCEMENT_CHANNEL")}**: ${settings.annoucement_channel ? channelMention(settings.annoucement_channel) : t("common.bot.NOT_SET")}`,
      inline: true,
    });
  }
  const user_settings = await client.database.getUser(interaction.user);

  embed.addFields(
    {
      name: t("common.bot.USER_SETTINGS") + ` (\`${interaction.user.displayName}\`)`,
      value: `**${t("common.bot.LANGUAGE")}**: ${user_settings.language?.value ? `${user_settings.language.name} (${user_settings.language.flag} \`${user_settings.language.value}\`)` : "English (🇺🇸 `en-US`)(default)"}`,
      inline: true,
    },
    { name: "Process Info", value: getProcessInfo() },
  );
  const btns = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setURL("https://discord.com/oauth2/authorize?client_id=1121541967730450574")
      .setLabel(t("common.bot.INVITE"))
      .setStyle(ButtonStyle.Link),
    new ButtonBuilder().setURL(client.config.Support).setLabel(t("common.bot.SUPPORT")).setStyle(ButtonStyle.Link),
    new ButtonBuilder().setURL(client.config.DASHBOARD.URL).setLabel(t("common.bot.DASHBOARD")).setStyle(ButtonStyle.Link),
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

const getProcessInfo = () => {
  const memoryUsage = process.memoryUsage();
  const heapTotal = (memoryUsage.heapTotal / 1024 / 1024).toFixed(2);
  const heapUsed = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
  const rss = (memoryUsage.rss / 1024 / 1024).toFixed(2);
  const external = (memoryUsage.external / 1024 / 1024).toFixed(2);
  const arrayBuffers = (memoryUsage.arrayBuffers / 1024 / 1024).toFixed(2);
  const processUptime = timeformat(process.uptime());
  const systemUptime = timeformat(os.uptime());
  const ramUsage = (os.totalmem() - os.freemem()) / 1024 / 1024 / 1024;
  const totalRam = os.totalmem() / 1024 / 1024 / 1024;
  const cpuUsage = process.cpuUsage();
  return `- **Heap Total:** ${heapTotal} MB
- **Heap Used:** ${heapUsed} MB
- **RSS:** ${rss} MB
- **External:** ${external} MB
- **Array Buffers:** ${arrayBuffers} MB
- **Process Uptime:** ${processUptime}
- **System Uptime:** ${systemUptime}
- **RAM Usage:** ${ramUsage.toFixed(2)} GB / ${totalRam.toFixed(2)} GB
- **CPU Usage:**
  - **User:** ${(cpuUsage.user / 1000).toFixed(2)} ms
  - **System:** ${(cpuUsage.system / 1000).toFixed(2)} ms
  `;
};
