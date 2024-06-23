import { Message } from "discord.js";
import moment from "moment-timezone";

const titleRegex = /\*\*(.*?)\*\*/g;
const creditRegex = /by \w+/g;

let timer: NodeJS.Timeout | null = null;
/**
 * Extract quest details from a quest announcement message
 * @param message the message to extract quest details from
 */
export default async (message: Message) => {
  console.log("hi");
  // ? This may be used to trigger the reminders (as this is usually the last message of daily quests)
  if (message.content.includes("Shattering Shard Summary")) return;
  if (message.content.includes("Event Ticket")) return;
  if (message.content === "**Daily Quests**" || message.content === "`**Daily Quest**") return;
  const client = message.client;
  const title = titleRegex.exec(message.content)?.join("-");
  const credit = creditRegex.exec(message.content)?.[0].slice(3);
  const images = message.attachments.map((attachment) => attachment.url);
  const data = await client.database.getDailyQuests();
  if (message.content.includes("Rotating Treasure Candle Locations")) {
    // do something here similar
    data.rotating_candles = {
      title: title!,
      date: moment().tz(client.timezone).startOf("day").toISOString(),
      images: images.map((img) => ({
        url: img,
        by: credit!,
      })),
    };
  } else if (message.content.includes("Seasonal Candle Locations")) {
    // do something here similar
    data.seasonal_candles = {
      title: title!,
      date: moment().tz(client.timezone).startOf("day").toISOString(),
      images: images.map((img) => ({
        url: img,
        by: credit!,
      })),
    };
  } else if (message.content.includes("by")) {
    data.quests.push({
      title: title!,
      date: moment().tz(client.timezone).startOf("day").toISOString(),
      images: images.map((img) => ({
        url: img,
        by: credit!,
      })),
    });
  }
  console.log("hi2");
  const d = data.quests.filter((q) => moment.tz(q.date, client.timezone).isSame(moment().tz(client.timezone).startOf("day")));
  data.quests = d;
  data.last_updated = moment().tz(client.timezone).toISOString();
  console.log(data);
  await data.save();
  /* if (timer) clearTimeout(timer);
  timer = setTimeout(async () => {
    // ! This is where the reminder will be scheduled and sent
    data.last_updated = moment().tz(client.timezone).toISOString();
    await data.save();
  }, 10_60_000); */ // Ten minute timeout, assuming all the quests are posted within 10 minutes
};
