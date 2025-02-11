import type { Command, SkyHelper } from "@/structures";
import { ShardsUtil as utils, shardsInfo, shardsTimeline } from "@skyhelperbot/utils";
import type { getTranslator } from "@/i18n";
import { SHARDS_CALENDAR_DATA } from "@/modules/commands-data/info-commands";
import {
  MessageFlags,
  type APIActionRowComponent,
  type APIButtonComponent,
  type APIEmbed,
  type APIEmbedField,
  type APIMessage,
  type APISelectMenuComponent,
  type APISelectMenuOption,
} from "@discordjs/core";
import { DateTime } from "luxon";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";
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
  "December",
] as const;
export default {
  async interactionRun({ t, helper, options }) {
    const m = await helper.reply({
      ...buildResponse(t, helper.client, helper.user.id),
      flags: options.getBoolean("hide") ? MessageFlags.Ephemeral : undefined,
    });
    collectResponseComponents(m.resource!.message!, t, helper);
  },
  ...SHARDS_CALENDAR_DATA,
} satisfies Command;

const getDates = (date: DateTime): DateTime[] => {
  const totalDays = date.daysInMonth!;
  const dates: DateTime[] = [];
  for (let i = 1; i <= totalDays; i++) {
    dates.push(DateTime.fromObject({ year: date.year, month: date.month, day: i }, { zone: "America/Los_Angeles" }));
  }
  return dates;
};

type ResponseParams = {
  index?: number;
  month?: number;
  year?: number;
};
const buildResponse = (
  t: ReturnType<typeof getTranslator>,
  client: SkyHelper,
  userId: string,
  { index, month, year }: ResponseParams = {},
) => {
  const now = DateTime.now().setZone("America/Los_Angeles");
  const date = 1;
  month ??= now.month;
  const monthStr = months[month - 1];
  year ??= now.year;
  const datesArray = getDates(now);

  const setsOfDates = [];
  for (let i = 0; i < datesArray.length; i += 5) {
    setsOfDates.push(datesArray.slice(i, i + 5));
  }

  index ??= setsOfDates.findIndex((dates) => dates.some((d) => d.hasSame(now, "day")));
  const toGet = DateTime.fromObject({ year, month, day: date }, { zone: "America/Los_Angeles" });
  const dates = getDates(toGet);
  const total = dates.length;
  const totalPages = Math.ceil(total / 5);
  const start = index * 5;
  const end = start + 5;
  const toDisplay = dates.slice(start, end);
  const title = `${toDisplay[0].toFormat("DD")} - ${toDisplay[toDisplay.length - 1].toFormat("DD")}`;
  const options: APISelectMenuOption[] = [];
  for (let i = 0; i < totalPages; i++) {
    const start2 = i * 5;
    const end2 = start2 + 5;
    const dat = dates.slice(start2, end2);
    const label1 = dat[0].toFormat("d");
    const label2 = dat[dat.length - 1].toFormat("d");
    const label = `${label1}${utils.getSuffix(parseInt(label1))} - ${label2}${utils.getSuffix(parseInt(label2))}`;
    const value = `${i}`;
    options.push({ label, value, default: index === i });
  }
  const dateSelect: APIActionRowComponent<APISelectMenuComponent> = {
    type: 1,
    components: [
      {
        type: 3,
        custom_id: client.utils.encodeCustomId({ id: "calendar-dates", user: userId }),
        placeholder: t("commands:SHARDS_CALENDAR.RESPONSES.DATE_SELECT_PLACEHOLDER"),
        options: options,
      },
    ],
  };
  const monthSelect: APIActionRowComponent<APISelectMenuComponent> = {
    type: 1,
    components: [
      {
        type: 3,
        custom_id: client.utils.encodeCustomId({ id: "calendar-month", user: userId }),
        placeholder: t("commands:SHARDS_CALENDAR.RESPONSES.MONTH_SELECT_PLACEHOLDER"),
        options: months.map((m, i) => ({
          label: m,
          value: (i + 1).toString(),
          default: month === i + 1,
        })),
      },
    ],
  };
  const yOptions: APISelectMenuOption[] = [];
  for (let i = year - 5; i < year + 5; i++) {
    yOptions.push({
      label: `${i}`,
      value: `${i}`,
      default: i === year,
    });
  }
  const yearSelect: APIActionRowComponent<APISelectMenuComponent> = {
    type: 1,
    components: [
      {
        type: 3,
        custom_id: client.utils.encodeCustomId({ id: "calendar-year", user: userId }),
        placeholder: t("commands:SHARDS_CALENDAR.RESPONSES.YEAR_SELECT_PLACEHOLDER"),
        options: yOptions,
      },
    ],
  };
  const navBtn: APIActionRowComponent<APIButtonComponent> = {
    type: 1,
    components: [
      {
        type: 2,
        custom_id: client.utils.encodeCustomId({ id: `calendar-nav-prev_${index}`, user: userId }),
        emoji: { name: "⬅️" },
        style: 1,
        disabled: index === 0,
      },
      {
        type: 2,
        custom_id: client.utils.encodeCustomId({ id: `calendar-nav-next_${index}`, user: userId }),
        emoji: { name: "➡️" },
        style: 1,
        disabled: index === totalPages - 1,
      },
    ],
  };
  const fields: APIEmbedField[] = [];
  toDisplay.forEach((d) => {
    const { currentRealm, currentShard } = utils.shardsIndex(d);
    const timelines = shardsTimeline(d)[currentShard];
    const noShard = utils.getStatus(d);
    const info = shardsInfo[currentRealm][currentShard];
    fields.push({
      name: d.hasSame(now, "day")
        ? client.utils.time(d.toUnixInteger(), "D") + ` (${t("features:shards-embed.TODAY")}) <a:uptime:1228956558113771580>`
        : client.utils.time(d.toUnixInteger(), "D"),
      value:
        typeof noShard === "string"
          ? "↪ " + t("commands:SHARDS_CALENDAR.RESPONSES.INFO.NO_SHARD")
          : `↪ ${t("commands:SHARDS_CALENDAR.RESPONSES.INFO.SHARD-INFO", { INFO: info.type, AREA: `*${info.area}*` })}\n↪ ${t("commands:SHARDS_CALENDAR.RESPONSES.INFO.SHARD-TIMES", { TIME: timelines.map((ti) => `${client.utils.time(ti.start.toUnixInteger(), "T")}`).join(" • ") })}\n\n`,
    });
  });
  const embed: APIEmbed = {
    author: {
      name: t("commands:SHARDS_CALENDAR.RESPONSES.EMBED_AUTHOR", { MONTH: monthStr, YEAR: year }),
      icon_url: client.utils.getUserAvatar(client.user),
    },
    description: t("commands:SHARDS_CALENDAR.RESPONSES.EMBED_DESCRIPTION", { shardsCmd: `</shards:1142231977328648364>` }),
    title,
    fields: fields,
    footer: {
      text: t("commands:SHARDS_CALENDAR.RESPONSES.EMBED_FOOTER", { INDEX: index + 1, TOTAL: totalPages }),
      icon_url: client.utils.getUserAvatar(client.user),
    },
  };
  return { embeds: [embed], components: [dateSelect, monthSelect, yearSelect, navBtn] };
};

const collectResponseComponents = (message: APIMessage, t: ReturnType<typeof getTranslator>, helper: InteractionHelper) => {
  const collector = helper.client.componentCollector({
    message,
    idle: 60_000,
    filter: (i) => (i.member?.user || i.user!).id === (helper.int.member?.user || helper.int.user!).id,
  });
  let month = new Date().getMonth() + 1;
  let year = new Date().getFullYear();
  collector.on("collect", async (i) => {
    const compHelper = new InteractionHelper(i, helper.client);
    const { id: Id } = helper.client.utils.parseCustomId(i.data.custom_id);
    const userId = i.member?.user?.id || i.user!.id;
    if (compHelper.isButton(i)) {
      const [id, ind] = Id.split("_");
      if (id === "calendar-nav-next") {
        await compHelper.update({ ...buildResponse(t, helper.client, userId, { index: parseInt(ind) + 1, month, year }) });
      }
      if (id === "calendar-nav-prev") {
        await compHelper.update({ ...buildResponse(t, helper.client, userId, { index: parseInt(ind) - 1, month, year }) });
      }
    }
    if (compHelper.isStringSelect(i)) {
      const value = i.data.values[0];
      switch (Id) {
        case "calendar-dates":
          await compHelper.update({ ...buildResponse(t, helper.client, userId, { index: parseInt(value), month, year }) });
          break;
        case "calendar-month":
          month = parseInt(value);
          await compHelper.update({ ...buildResponse(t, compHelper.client, userId, { index: 0, month, year }) });
          break;
        case "calendar-year":
          year = parseInt(value);
          await compHelper.update({ ...buildResponse(t, compHelper.client, userId, { index: 0, month, year }) });
          break;
      }
    }
  });
  collector.on("end", () => {
    const components: APIActionRowComponent<APISelectMenuComponent> = {
      type: 1,
      components: [
        {
          type: 3,
          custom_id: "any",
          placeholder: t("common:SELECT_EXPIRED"),
          options: [{ label: t("common:SELECT_EXPIRED"), value: "expired", default: true }],
          disabled: true,
        },
      ],
    };
    helper.editReply({ components: [components] }).catch(() => {});
  });
};
