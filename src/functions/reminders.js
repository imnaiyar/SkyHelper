import moment from 'moment-timezone';
import { getTime } from '@commands/skytimes/sub/skyTimes.js';
import { time, roleMention } from 'discord.js';

export default async (client, type) => {
  const guilds = client.guilds.cache;
  guilds.forEach(async (guild) => {
    try {
      const settings = await client.database.Guild.getSettings(guild);
      const rmd = settings?.reminders;
      if (!rmd) return;
      const { grandma, geyser, dailies, turtle, reset, eden, webhook, default_role } = rmd;
      if (!grandma.active && !geyser.active && !eden.active && !turtle.active && !dailies.active) return;
      const typesEnum = {
        grandma: grandma,
        geyser: geyser,
        turtle: turtle,
        reset: reset,
        eden: eden,
        daiilies: dailies,
      };
      const wb = await client.fetchWebhook(webhook.id, webhook.token).catch(() => {});
      if (!wb) return;

      const role = typesEnum[type]?.role
        ? `Hey ${roleMention(typesEnum[type]?.role)}! `
        : default_role
          ? `Hey ${roleMention(default_role)}! `
          : "";

      let response = null;
      if (typesEnum[type].active) response = getResponse(type, role);
      if (type === "eden" && eden)
        response = `${role}Eye of Eden just got reset, statues have been refreshed and can again be saved for ACs!`;
      if (type === "dailies" && dailies.active) response = getDailiesResponse(type, role);
      if (type === "reset" && reset.active) {
        response = `${role}The world of Sky just reset and daily quests have been refreshed!`;
      }
      if (!response) return;
      await wb
        .send({
          username: `${type.charAt(0).toUpperCase() + type.slice(1)} Reminder`,
          avatarURL: client.user.displayAvatarURL(),
          content: response,
        })
        .catch((err) => {
          client.logger.log(guild.name, ": ", error);
        });
    } catch (err) {
      client.logger.error(err);
    }
  });
};

function getResponse(type, role) {
  const now = moment().tz("America/Los_Angeles");
  let skytime;
  let offset = 0;
  switch (type) {
    case "grandma":
      skytime = "Grandma";
      offset = 30;
      break;
    case "geyser":
      skytime = "Geyser";
      offset = 0;
      break;
    case "turtle":
      skytime = "Turtle";
      offset = 50;
      break;
  }
  const { start, end, ongoing, duration, target } = getTime(now, offset);
  if (!ongoing) return "This is not working as expected";
  return `${role}${skytime} just started (at ${time(start.toDate(), "t")}) and will end at ${time(end.toDate(), "t")} (${time(end.toDate(), "R")})`;
}
