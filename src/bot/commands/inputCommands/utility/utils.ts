import type { SkyHelper, Command } from "#structures";
import os from "node:os";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  channelMention,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import pkg from "#root/package.json" with { type: "json" };
import { handleTimestamp } from "./sub/timestamp.js";
import { getChangelog, getSuggestion } from "./sub/utility.js";
import { getTranslator } from "#bot/i18n";
import { UTILS_DATA } from "#bot/commands/commands-data/utility-commands";

export default {
  async interactionRun(interaction, t) {
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
        await handleTimestamp(interaction, t);
    }
  },
  ...UTILS_DATA,
} satisfies Command;

async function handleInfo(
  interaction: ChatInputCommandInteraction,
  t: ReturnType<typeof getTranslator>,
  time: number,
): Promise<void> {
  const { client } = interaction;
  const guilds = client.guilds.cache.size;
  const users = client.guilds.cache.reduce((size, g) => size + g.memberCount, 0);
  const appl = await client.application.fetch();
  let desc = "";
  desc += `<:servers:1243977429542764636> ${t("common.bot.TOTAL_SERVER")}: ${guilds}\n`;
  desc += t("common.bot.TOTAL_AUTHORIZED") + ": " + appl.approximateUserInstallCount + "\n";
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
      value: `- **${t("common.bot.LANGUAGE")}**: ${settings.language?.value ? `${settings.language.name} (${settings.language.flag} \`${settings.language.value}\`)` : "English (🇺🇸 `en-US`)(default)"}\n- **${t("common.bot.ANNOUNCEMENT_CHANNEL")}**: ${settings.annoucement_channel ? channelMention(settings.annoucement_channel) : t("common.bot.NOT_SET")}\n- Prefix: \`${settings.prefix || "sh!"}\``,
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
  return ["d", "h", "m", "s"]
    .map((v, i) => {
      const value = [86400, 3600, 60, 1];
      const time = Math.floor(timeInSeconds / value[i]);
      timeInSeconds %= value[i];
      return time ? `${time}${v}` : "";
    })
    .join(" ");
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
