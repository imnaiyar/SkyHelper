import type { Command } from "@/structures";
import os from "node:os";
import { handleTimestamp } from "./sub/timestamp.js";
import { getChangelog, getSuggestion } from "./sub/utils.js";
import { getTranslator } from "@/i18n";
import { UTILS_DATA } from "@/modules/commands-data/utility-commands";
import { readFile } from "node:fs/promises";
import type { InteractionHelper } from "@/utils/classes/InteractionUtil";
import type { APIActionRowComponent, APIButtonComponent, APIEmbed } from "@discordjs/core";
const pkg = await readFile("package.json", "utf-8").then((res) => JSON.parse(res));
export default {
  async interactionRun({ helper, options }) {
    const sub = options.getSubcommand();
    switch (sub) {
      case "changelog":
        await getChangelog(helper);
        break;
      case "botinfo": {
        const reply = await helper.defer({}, true);
        await handleInfo(helper, helper.client.utils.createdTimeStamp(reply.id));
        break;
      }
      case "contact-us":
        await getSuggestion(helper, options);
        break;
      case "timestamp":
        await handleTimestamp(helper, options);
    }
  },
  ...UTILS_DATA,
} satisfies Command;

async function handleInfo(helper: InteractionHelper, time: number): Promise<void> {
  const { client, t } = helper;
  const guilds = client.guilds.size;
  const users = client.guilds.reduce((size, g) => size + g.member_count, 0);
  const appl = await client.api.applications.getCurrent();
  let desc = "";
  desc += `<:servers:1243977429542764636> ${t("common:bot.TOTAL_SERVER")}: ${guilds}\n`;
  desc += t("common:bot.TOTAL_AUTHORIZED") + ": " + appl.approximate_user_install_count + "\n";
  desc += `<:users:1243977425725952161> ${t("common:bot.TOTAL_USERS")}: ${users}\n`;
  desc += `<a:uptime:1228956558113771580> ${t("common:bot.PING")}: ${client.ping} ms\n`;
  desc += `<:latency:1243977421812924426> ${t("common:bot.LATENCY")}: ${time - client.utils.createdTimeStamp(helper.int.id)} ms\n`;
  desc += "\n";
  const embed: APIEmbed = {
    author: {
      name: t("common:bot.EMBED_TITLE"),
      icon_url: client.utils.getUserAvatar(client.user),
    },
    title: client.user.username,
    fields: [],
    description:
      desc +
      `**${t("common:bot.VERSION")}:** v${pkg.version}\n**${t("common:bot.UPTIME")}:** ${timeformat((Date.now() - client.readTimestamp) / 1000)}`,
  };
  const guild = client.guilds.get(helper.int.guild_id || "");
  if (guild) {
    const settings = await client.schemas.getSettings(guild);
    embed.fields?.push({
      name: t("common:bot.GUILD_SETTINGS") + ` (\`${guild.name}\`)`,
      value: `- **${t("common:bot.LANGUAGE")}**: ${settings.language?.value ? `${settings.language.name} (${settings.language.flag} \`${settings.language.value}\`)` : "English (🇺🇸 `en-US`)(default)"}\n- **${t("common:bot.ANNOUNCEMENT_CHANNEL")}**: ${settings.annoucement_channel ? `<#${settings.annoucement_channel}>` : t("common:bot.NOT_SET")}\n- Prefix: \`${settings.prefix || "sh!"}\``,
      inline: true,
    });
  }
  const user_settings = await client.schemas.getUser(helper.user);

  embed.fields?.push(
    {
      name: t("common:bot.USER_SETTINGS") + ` (\`${helper.user.global_name || helper.user.username}\`)`,
      value: `**${t("common:bot.LANGUAGE")}**: ${user_settings.language?.value ? `${user_settings.language.name} (${user_settings.language.flag} \`${user_settings.language.value}\`)` : "English (🇺🇸 `en-US`)(default)"}`,
      inline: true,
    },
    { name: "Process Info", value: getProcessInfo() },
  );
  const btns: APIActionRowComponent<APIButtonComponent> = {
    type: 1,
    components: [
      {
        type: 2,
        url: "https://discord.com/oauth2/authorize?client_id=1121541967730450574",
        label: t("common:bot.INVITE"),
        style: 5,
      },
      {
        type: 2,
        url: client.config.Support,
        label: t("common:bot.SUPPORT"),
        style: 5,
      },
      {
        type: 2,
        url: client.config.DASHBOARD.URL,
        label: t("common:bot.DASHBOARD"),
        style: 5,
      },
    ],
  };
  await helper.editReply({ embeds: [embed], components: [btns] });
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
