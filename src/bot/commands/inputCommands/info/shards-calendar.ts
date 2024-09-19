import type { Command, SkyHelper } from "#structures";
import {
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Message,
  StringSelectMenuInteraction,
  time,
} from "discord.js";
import {
  type APIEmbedField,
  type APISelectMenuOption,
  ActionRowBuilder,
  ApplicationCommandOptionType,
  StringSelectMenuBuilder,
} from "discord.js";
import moment from "moment-timezone";
import { ShardsUtil as utils, shardsInfo, shardsTimeline } from "skyhelper-utils";
import { useTranslations as x } from "#handlers/useTranslation";
import type { getTranslator } from "#bot/i18n";
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "Descember",
] as const;
let index: number | null,
  month: number | null,
  year: number | null = null;
export default {
  cooldown: 15,
  category: "Info",
  async interactionRun(interaction, t, client) {
    const m = await interaction.reply({
      ...buildResponse(t, client),
      ephemeral: interaction.options.getBoolean("hide") || false,
      fetchReply: true,
    });
    collectResponseComponents(m, t, interaction);
  },
  async messageRun({ message, t, client }) {
    const m = await message.reply(buildResponse(t, client));
    collectResponseComponents(m, t);
  },
  name: "shards-calendar",
  description: "Show the shards calendar",
  prefix: {
    aliases: ["shards-cal", "shard-cal", "sc"],
  },
  slash: {
    name_localizations: x("commands.SHARDS_CALENDAR.name"),
    description_localizations: x("commands.SHARDS_CALENDAR.description"),
    options: [
      {
        name: "hide",
        name_localizations: x("common.hide-options.name"),
        description: "hides the response",
        description_localizations: x("common.hide-options.description"),
        type: ApplicationCommandOptionType.Boolean,
        required: false,
      },
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
} satisfies Command;

const getDates = (date: moment.Moment): moment.Moment[] => {
  const m = date.month() + 1;
  const y = date.year();
  const totalDays = date.daysInMonth();
  const dates: moment.Moment[] = [];
  for (let i = 1; i <= totalDays; i++) {
    dates.push(utils.getDate(`${y}-${m}-${i}`) as moment.Moment);
  }
  return dates;
};

const buildResponse = (t: ReturnType<typeof getTranslator>, client: SkyHelper) => {
  const now = moment().tz("America/Los_Angeles");
  const date = 1;
  month ??= now.month() + 1;
  const monthStr = moment()
    .month(month - 1)
    .format("MMMM");
  year ??= now.year();
  const datesArray = getDates(now);

  const setsOfDates = [];
  for (let i = 0; i < datesArray.length; i += 5) {
    setsOfDates.push(datesArray.slice(i, i + 5));
  }

  index ??= setsOfDates.findIndex((dates) => dates.some((d) => d.isSame(now, "day")));
  const toGet = moment.tz(`${year}-${month}-${date}`, "Y-M-D", "America/Los_Angeles");
  const dates = getDates(toGet);
  const total = dates.length;
  const totalPages = Math.ceil(total / 5);
  const start = index * 5;
  const end = start + 5;
  const toDisplay = dates.slice(start, end);
  const title = `${toDisplay[0].format("Do MMM YYYY")} - ${toDisplay[toDisplay.length - 1].format("Do MMM YYYY")}`;
  const options: APISelectMenuOption[] = [];
  for (let i = 0; i < totalPages; i++) {
    const start2 = i * 5;
    const end2 = start2 + 5;
    const dat = dates.slice(start2, end2);
    const label = `${dat[0].format("Do")} - ${dat[dat.length - 1].format("Do")}`;
    const value = `${i}`;
    options.push({ label, value, default: index === i });
  }
  const dateSelect = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("calendar-dates")
      .setPlaceholder(t("commands.SHARDS_CALENDAR.RESPONSES.DATE_SELECT_PLACEHOLDER"))
      .addOptions(options),
  );
  const monthSelect = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("calendar-month")
      .setPlaceholder(t("commands.SHARDS_CALENDAR.RESPONSES.MONTH_SELECT_PLACEHOLDER"))
      .addOptions(
        months.map((m, i) => ({
          label: m,
          value: i + 1 + "",
          default: month === i + 1,
        })),
      ),
  );
  const yOptions: APISelectMenuOption[] = [];
  for (let i = year! - 5; i < year! + 5; i++) {
    yOptions.push({
      label: `${i}`,
      value: `${i}`,
      default: i === year,
    });
  }
  const yearSelect = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("calendar-year")
      .setPlaceholder(t("commands.SHARDS_CALENDAR.RESPONSES.YEAR_SELECT_PLACEHOLDER"))
      .addOptions(yOptions),
  );
  const navBtn = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("calendar-nav-prev")
      .setEmoji("⬅️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(index === 0),
    new ButtonBuilder()
      .setCustomId("calendar-nav-next")
      .setEmoji("➡️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(index === totalPages - 1),
  );
  const fields: APIEmbedField[] = [];
  toDisplay.forEach((d) => {
    const { currentRealm, currentShard } = utils.shardsIndex(d);
    const timelines = shardsTimeline(d)[currentShard];
    const noShard = utils.getStatus(d);
    const info = shardsInfo[currentRealm][currentShard];
    fields.push({
      name: d.isSame(now, "day")
        ? time(d.unix(), "D") + ` (${t("shards-embed.TODAY")}) <a:uptime:1228956558113771580>`
        : time(d.unix(), "D"),
      value:
        typeof noShard === "string"
          ? "↪ " + t("commands.SHARDS_CALENDAR.RESPONSES.INFO.NO_SHARD")
          : `↪ ${t("commands.SHARDS_CALENDAR.RESPONSES.INFO.SHARD-INFO", { INFO: info.type, AREA: `*${info.area}*` })}\n↪ ${t("commands.SHARDS_CALENDAR.RESPONSES.INFO.SHARD-TIMES", { TIME: timelines.map((ti) => `${time(ti.start.unix(), "T")}`).join(" • ") })}\n\n`,
    });
  });
  const embed = new EmbedBuilder()
    .setAuthor({
      name: t("commands.SHARDS_CALENDAR.RESPONSES.EMBED_AUTHOR", { MONTH: monthStr, YEAR: year }),
      iconURL: client.user.displayAvatarURL(),
    })
    .setDescription(t("commands.SHARDS_CALENDAR.RESPONSES.EMBED_DESCRIPTION", { shardsCmd: `</shards:1142231977328648364>` }))
    .setTitle(title)
    .addFields(fields)
    .setFooter({
      text: t("commands.SHARDS_CALENDAR.RESPONSES.EMBED_FOOTER", { INDEX: index + 1, TOTAL: totalPages }),
      iconURL: client.user.displayAvatarURL(),
    });
  return { embeds: [embed], components: [dateSelect, monthSelect, yearSelect, navBtn] };
};

const collectResponseComponents = (msg: Message, t: ReturnType<typeof getTranslator>, int?: ChatInputCommandInteraction) => {
  const collector = msg.createMessageComponentCollector({ idle: 60_000 });
  collector.on("collect", async (i: ButtonInteraction | StringSelectMenuInteraction) => {
    const Id = i.customId;

    if (i.isButton()) {
      if (Id === "calendar-nav-next") {
        index!++;
        await i.update({ ...buildResponse(t, i.client) });
      }
      if (Id === "calendar-nav-prev") {
        index!--;
        await i.update({ ...buildResponse(t, i.client) });
      }
    }
    if (i.isStringSelectMenu()) {
      const value = i.values[0];
      switch (Id) {
        case "calendar-dates":
          index = parseInt(value);
          await i.update({ ...buildResponse(t, i.client) });
          break;
        case "calendar-month":
          month = parseInt(value);
          index = 0;
          await i.update({ ...buildResponse(t, i.client) });
          break;
        case "calendar-year":
          year = parseInt(value);
          index = 0;
          await i.update({ ...buildResponse(t, i.client) });
          break;
      }
    }
  });
  collector.on("end", () => {
    (int?.fetchReply() ?? msg.fetch())
      .then((): void => {
        const components = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("any")
            .setPlaceholder(t("common.SELECT_EXPIRED"))
            .setDisabled(true)
            .addOptions([{ label: t("common.SELECT_EXPIRED"), value: "expired", default: true }]),
        );
        (int?.editReply ?? msg.edit)({ components: [components] }).catch(() => {});
      })
      .catch(() => {});
  });
};
