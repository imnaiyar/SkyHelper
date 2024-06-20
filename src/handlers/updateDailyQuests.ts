import { Message } from "discord.js";
import moment from "moment-timezone";

const titleRegex = /\*\*(.*?)\*\*/g;
const creditRegex = /by \w+/g;

/**
 * Extract quest details from a quest announcement message
 * @param message the message to extract quest details from
 */
export default async (message: Message) => {
  if (message.content.includes("Shattering Shard Summary")) return;
  if (message.content.includes("Event Ticket")) return;
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
    return await data.save();
  }
  data.quests.push({
    title: title!,
    date: moment().tz(client.timezone).startOf("day").toISOString(),
    images: images.map((img) => ({
      url: img,
      by: credit!,
    })),
  });
  const d = data.quests.filter((q) => moment.tz(q.date, client.timezone).isSame(moment().tz(client.timezone).startOf("day")));
  data.quests = d;
  await data.save();
};
