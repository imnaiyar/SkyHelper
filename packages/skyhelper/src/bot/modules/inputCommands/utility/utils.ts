import type { Command } from "@/structures";
import os from "node:os";
import { handleTimestamp } from "./sub/timestamp.js";
import { getChangelog, getSuggestion } from "./sub/utils.js";
import { UTILS_DATA } from "@/modules/commands-data/utility-commands";
import { readFile } from "node:fs/promises";
import type { InteractionHelper } from "@/utils/classes/InteractionUtil";
import { MessageFlags, type APIActionRowComponent, type APIButtonComponent } from "@discordjs/core";
import { container, separator, textDisplay } from "@skyhelperbot/utils";
import { emojis } from "@skyhelperbot/constants";
const pkg = await readFile("package.json", "utf-8").then((res) => JSON.parse(res) as Record<string, any>);

export default {
  async interactionRun({ helper, options }) {
    const sub = options.getSubcommand();
    switch (sub) {
      case "changelog":
        await getChangelog(helper);
        break;
      case "botinfo": {
        const reply = (await helper.defer({})).resource!.message!;
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
  async autocomplete({ helper, options }) {
    const sub = options.getSubcommand(true);
    if (sub !== "timestamp") return;
    const focused = options.getFocusedOption();
    if (focused.name !== "timezone") return;
    const timezones = Intl.supportedValuesOf("timeZone");
    timezones.push("Asia/Kolkata");
    await helper.respond({
      choices: timezones
        .filter((tz) => tz.toLowerCase().includes((focused.value as string).toLowerCase()))
        .map((tz) => ({ name: tz === "America/Los_Angeles" ? `${tz} (default)` : tz, value: tz }))
        .slice(0, 25),
    });
  },
  ...UTILS_DATA,
} satisfies Command<true>;

async function handleInfo(helper: InteractionHelper, time: number): Promise<void> {
  const { client, t } = helper;
  const guilds = client.guilds.size;
  const users = client.guilds.reduce((size, g) => size + g.member_count, 0);
  const appl = await client.api.applications.getCurrent();
  let desc = "";
  desc += `<:servers:1243977429542764636> ${t("common:bot.TOTAL_SERVER")}: ${guilds}\n`;
  // eslint-disable-next-line
  desc += t("common:bot.TOTAL_AUTHORIZED") + ": " + appl.approximate_user_install_count! + "\n";
  desc += `<:users:1243977425725952161> ${t("common:bot.TOTAL_USERS")}: ${users}\n`;
  desc += `<a:uptime:1228956558113771580> ${t("common:bot.PING")}: ${client.ping} ms\n`;
  desc += `<:latency:1243977421812924426> ${t("common:bot.LATENCY")}: ${time - client.utils.createdTimeStamp(helper.int.id)} ms\n`;

  const component = container(
    textDisplay(`-# ${t("common:bot.EMBED_TITLE")}`, client.user.username),
    separator(),
    textDisplay(
      desc,
      `**${t("common:bot.VERSION")}:** v${pkg.version}\n**${t("common:bot.UPTIME")}:** ${timeformat((Date.now() - client.readTimestamp) / 1000)}`,
    ),
    separator(),
  );
  const guild = client.guilds.get(helper.int.guild_id ?? "");
  if (guild) {
    const settings = await client.schemas.getSettings(guild);
    component.components.push(
      textDisplay(
        `**${t("common:bot.GUILD_SETTINGS")} (\`${guild.name}\`)**`,
        `- **${t("common:bot.LANGUAGE")}**: ${settings.language?.value ? `${settings.language.name} (${settings.language.flag} \`${settings.language.value}\`)` : "English (🇺🇸 `en-US`)(default)"}\n- **${t("common:bot.ANNOUNCEMENT_CHANNEL")}**: ${settings.annoucement_channel ? `<#${settings.annoucement_channel}>` : t("common:bot.NOT_SET")}\n- Prefix: \`${settings.prefix || "sh!"}\``,
      ),
    );
  }
  const user_settings = await client.schemas.getUser(helper.user);

  component.components.push(
    textDisplay(
      `**${t("common:bot.USER_SETTINGS")} (\`${helper.user.global_name ?? helper.user.username}\`)**`,
      `**${t("common:bot.LANGUAGE")}**: ${user_settings.language?.value ? `${user_settings.language.name} (${user_settings.language.flag} \`${user_settings.language.value}\`)` : "English (🇺🇸 `en-US`)(default)"}`,
    ),
    ...(client.config.OWNER.includes(helper.user.id) ? [separator(), textDisplay("**Process Info**", getProcessInfo())] : []),
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
  component.components.push(separator(), btns);
  await helper.editReply({ components: [component], flags: MessageFlags.IsComponentsV2 });
}

function timeformat(timeInSeconds: number) {
  return ["d", "h", "m", "s"]
    .map((v, i) => {
      const value = [86400, 3600, 60, 1];
      const time = Math.floor(timeInSeconds / value[i]!);
      timeInSeconds %= value[i]!;
      return time ? `${time}${v}` : "";
    })
    .join(" ");
}

const getProcessInfo = () => {
  // Bot ram
  const botUsed = `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`;
  const botUsage = `${((process.memoryUsage().heapUsed / os.totalmem()) * 100).toFixed(1)}%`;

  // Overall ram
  const overallUsed = `${((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2)} GB`;
  const overallAvailable = `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`;
  const overallUsage = `${Math.floor(((os.totalmem() - os.freemem()) / os.totalmem()) * 100)}%`;
  const cpuUsage = `${(process.cpuUsage().user / 1024 / 1024).toFixed(2)} MB`;
  const freeRam = `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`;
  return `**Ram Usage**:\n${emojis.tree_middle} Bot: ${botUsed} (${botUsage})\n${emojis.tree_middle} Overall: ${overallUsed} / ${overallAvailable} (${overallUsage})\n${emojis.tree_end} Free: ${freeRam}\n**CPU Usage**: ${cpuUsage}`;
};
