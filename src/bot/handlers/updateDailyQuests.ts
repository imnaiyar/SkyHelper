import { Message } from "discord.js";
import moment from "moment-timezone";
import { dailyQuestRemindersSchedules } from "./sendDailyQuestReminder.js";
import type { DailyQuest } from "#bot/libs/types";

const titleRegex = /(?:\*\*[^*]*\*\*|[^*])(?<=\*\*)(.*?)(?=\*\*| by)/g;
const creditRegex = /by @?\w+/g;
const linkRegex = /https:\/\/discord\.com\/channels\/\d+\/\d+\/\d+/g;
let timer: NodeJS.Timeout | null = null;
/**
 * Extract quest details from a quest announcement message
 * @param message the message to extract quest details from
 */
export default async (message: Message) => {
  // ? This may be used to trigger the reminders (as this is usually the last message of daily quests)
  if (/Shattering Shard Summary/i.test(message.content)) return;

  // prettier-ignore
  if (message.content === "**Daily Quests**" || message.content === "`**Daily Quest**" || /^\*?\*?daily quests?\*?\*? by/i.test(message.content)) return;
  const client = message.client;
  const title =
    message.content
      ?.replaceAll(/<a?:\w+:\d+>/g, "")
      .match(titleRegex)?.[0]
      .replaceAll(/[*_~]/g, "")
      .trim() || "[Quest Title Error]: Unknown";
  const credit = message.content.replaceAll(linkRegex, "").trim().match(creditRegex)?.[0].slice(3);
  const source = linkRegex.exec(message.content)?.[0];
  const images = message.attachments.map((attachment) => attachment.url);
  const data = await client.database.getDailyQuests();
  const guide: DailyQuest = {
    title: title!,
    date: moment().tz(client.timezone).startOf("day").toISOString(),
    images: images.map((img) => ({
      url: img,
      by: credit!,
      source,
    })),
  };

  if (/Rotating Treasure Candle/i.test(message.content)) data.rotating_candles = guide;
  else if (/Seasonal Candle/i.test(message.content)) data.seasonal_candles = guide;
  else if (message.content.includes("by")) data.quests.push(guide);

  const d = data.quests.filter((q) => moment.tz(q.date, client.timezone).isSame(moment().tz(client.timezone).startOf("day")));
  data.quests = d;

  if (timer) clearTimeout(timer);
  timer = setTimeout(async () => {
    // ! This is where the reminder will be scheduled and sent
    const today = moment().tz(client.timezone).startOf("day");
    // Return if the reminders are already sent, prevent spam in case of some guides added way later
    if (!moment.tz(data.last_updated, client.timezone).startOf("day").isSame(today)) {
      await dailyQuestRemindersSchedules(message.client);
    }
    data.last_updated = today.toISOString();
    await data.save();
  }, 10 * 6e4); // Ten minute timeout, assuming all the quests are posted within 10 minutes
};
