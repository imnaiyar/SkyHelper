import moment from "moment-timezone";
import { Flags } from "#libs";
import type { Event } from "#structures";
import { type ActivityOptions, ActivityType, EmbedBuilder, WebhookClient } from "discord.js";
import { UpdateEvent, UpdateTS, ShardsUtil as util } from "@skyhelperbot/utils";
import { bootstrap } from "../../api/main.js";
import chalk from "chalk";
const ready = process.env.READY_LOGS ? new WebhookClient({ url: process.env.READY_LOGS }) : undefined;

const readyHandler: Event<"ready"> = async (client): Promise<void> => {
  client.logger.custom(`Logged in as ${client.user.tag}`, "BOT");

  // Enable Dashboard
  console.log(chalk.blueBright(`\n\n<${"-".repeat(24)} Dashboard ${"-".repeat(26)}>\n`));
  if (client.config.DASHBOARD.enabled) bootstrap(client);

  // Populate client caches
  client.classes.set("UpdateTS", UpdateTS);
  client.classes.set("UpdateEvent", UpdateEvent);
  client.classes.set("Flags", Flags);

  setInterval(() => {
    client.user.setActivity(getActivity());
  }, 2 * 60_000);

  // Fetch application for eval purposes
  await client.application.fetch();
  await client.application.commands.fetch();

  // Setting up additional datas
  client.emojisMap.set("realms", {
    "Isle of Dawn": "<:Isle:1150605424752590868>",
    "Daylight Prairie": "<:Prairie:1150605405408473179>",
    "Hidden Forest": "<:Forest:1150605383656800317>",
    "Valley of Triumph": "<:Valley:1150605355777273908>",
    "Golden Wasteland": "<:Wasteland:1150605333862027314>",
    "Vault of Knowledge": "<:Vault:1150605308364861580>",
    "Eye of Eden": "<:eden:1205960597456293969>",
  });
  client.emojisMap.set("seasons", {
    "Nine-Colored Deer": "<:ninecoloreddeer:1197412132657053746>",
    Revival: "<:revival:1163480957706321950>",
    Moments: "<:moments:1130958731211985019>",
    Passage: "<:passage:1130958698571911239>",
    Remembrance: "<:remembrance:1130958673959719062>",
    Aurora: "<:aurora:1130958641189621771>",
    Shattering: "<:shattering:1130961257097334895>",
    Performance: "<:performance:1130958595345895444>",
    Abyss: "<:abyss:1130958569748045845>",
    Flight: "<:flight:1130958544276045945>",
    "The Little Prince": "<:littleprince:1130958521253502987>",
    Assembly: "<:assembly:1130958465351811173>",
    Dreams: "<:dreams:1130958442232815646>",
    Prophecy: "<:prophecy:1130958414655279304>",
    Sanctuary: "<:sanctuary:1130958391347515573>",
    Enchantment: "<:enchantment:1130958367674867742>",
    Rhythm: "<:rhythm:1130958345352777849>",
    Belonging: "<:belonging:1130958323823423509>",
    Lightseekers: "<:lightseekers:1130958300293365870>",
    Gratitude: "<:gratitude:1130958261349261435>",
  });

  const readyalertemb = new EmbedBuilder()
    .addFields(
      {
        name: "Bot Status",
        value: `Total guilds: ${client.guilds.cache.size}\nTotal Users: ${client.guilds.cache.reduce(
          (size, g) => size + g.memberCount,
          0,
        )}`,
        inline: false,
      },
      /* {
        name: "Website",
        value: text,
        inline: false,
      }, */
      {
        name: "Interactions",
        value: `Loaded Interactions`,
        inline: false,
      },
      {
        name: "Success",
        value: `SkyHelper is now online`,
      },
    )
    .setColor("Gold")
    .setTimestamp();

  // Ready alert
  if (ready) {
    ready.send({
      username: "Ready",
      avatarURL: client.user.displayAvatarURL(),
      embeds: [readyalertemb],
    });
  }
};

export default readyHandler;

function getActivity(): ActivityOptions {
  const status = util.getStatus(moment().tz("America/Los_Angeles"));
  let shardStatus = "";

  if (status === "No Shard") {
    shardStatus = "😟 No shard today";
  } else {
    const isActive = status.find((s) => s.active);
    const allEnded = status.every((s) => s.ended);
    const yetToFall = status.find((s) => !s.active && !s.ended);
    const getIndex = (i: number) => i.toString() + util.getSuffix(i);
    shardStatus = allEnded
      ? "😟 All shards ended for today"
      : isActive
        ? `🌋 ${getIndex(isActive.index)} shard ends in ${isActive.duration}`
        : `🌋 ${getIndex(yetToFall!.index)} shard lands in ${yetToFall!.duration}`;
  }

  const activities: ActivityOptions[] = [
    {
      name: "Shards being menacing",
      type: ActivityType.Watching,
    },
    {
      name: "Shards fall",
      type: ActivityType.Watching,
    },
    {
      name: "Mellow Musician",
      type: ActivityType.Listening,
    },
    {
      name: "Custom status",
      state: shardStatus,
      type: ActivityType.Custom,
    },
    {
      name: "Valley Race",
      type: ActivityType.Competing,
    },
    {
      name: "Sky COTL Videos",
      type: ActivityType.Streaming,
      url: "https://www.twitch.tv/directory/category/sky-children-of-the-light",
    },
  ];
  return activities[Math.floor(Math.random() * activities.length)];
}
