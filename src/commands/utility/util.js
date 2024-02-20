const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { getChangelog, getSuggestion } = require("./sub/util");
module.exports = {
  data: {
    name: "util",
    description: "utility commands",
    options: [
      {
        name: "credits",
        description: "to works included in this bot",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "changelog",
        description: "bot's changelog",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "suggestions",
        description: "suggest a feature or a change",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "ping",
        description: "get the bot's ping",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === "credits") {
      getCredits(interaction);
    } else if (sub === "suggestions") {
      getSuggestion(interaction);
    } else if (sub === "changelog") {
      getChangelog(interaction);
    } else if (sub === "ping") {
      getPing(interaction);
    }
  },
};

async function getCredits(interaction) {
  const { client } = interaction;
  await interaction.deferReply();
  const Art = await client.getUser("Art", "504605855539265537");
  const Zhii = await client.getUser("Zhii", "650487047160725508");
  const Gale = await client.getUser("Gale", "473761854175576075");
  const Clement = await client.getUser("Clement", "693802004018888714");
  const Christian = await client.getUser("Christian", "594485678625128466");
  const Xander = await client.getUser("Xander", "693767559123697806");
  const Zed = await client.getUser("Zed", "628048706129756171");
  const Hucker = await client.getUser("Hucker", "348060059911323659");
  const Kion = await client.getUser("Kion", "706088667801976843");
  const Stoat = await client.getUser("Stoat", "221369442511093760");
  const LN = await client.getUser("LN", "695034514614779955");
  const Mimi = await client.getUser("Mimi", "628644574079746048");
  const Sam = await client.getUser("Sam", "611368649114255380");
  const Plutoy = await client.getUser("Plutoy", "702740689846272002");

  const userAvatar = interaction.user.displayAvatarURL({
    format: "png",
    dynamic: true,
  });
  const userNickname = interaction.member?.nickname || interaction.user.username;
  const botUser = await client.users.fetch(client.user.id);
  const botAvatar = botUser.displayAvatarURL({
    format: "png",
    dynamic: true,
  });
  let result;
  result = new EmbedBuilder()
    .setAuthor({
      name: `Requested by ${userNickname}`,
      iconURL: `${userAvatar}`,
    })
    .setDescription(`This bot wouldn't be possible without these people and the work they do.`)
    .setTimestamp(Date.now())
    .setColor("#000000")
    .setFooter({ text: "SkyHelper", iconURL: `${botAvatar}` })
    .addFields({
      name: "**__Shard Pattern Predictions__**",
      value: `- Zhii (${Zhii.username})\n- Christian (${Christian.username})\n- Hucker (${Hucker.username})\n- Plutoy (${Plutoy.username})\n- Kion (${Kion.username})\n- LN (${LN.username})\n- Gale (${Gale.username})\n- Stoat (${Stoat.username})`,
      inline: true,
    })
    .addFields({
      name: "**__Sky Infographics and Guides__**",
      value: `- Clement (${Clement.username})\n- Mimi (${Mimi.username})\n- Sam (${Sam.username})\n- Zed (${Zed.username})\n- Art (${Art.username})\n**and all others who do the awesome job of creating guides.**`,
      inline: true,
    })
    .addFields({
      name: "**__Special Mentions__**",
      value: `- Big thanks to Xander (${Xander.username}) and Christian (${Christian.username}) for testing the early version of this bot.\n- Thanks to Plutoy (${Plutoy.username}) for creating the [Sky Shards website](https://sky-shards.pages.dev/), which was the initial inspiration for the bot.\n- Emotes icon, traveling spirits descriptions and some aspects of guides have been taken from [Sky Wiki](https://sky-children-of-the-light.fandom.com/wiki/Sky:_Children_of_the_Light_Wiki).`,
      inline: false,
    });

  interaction.editReply({ embeds: [result] });
}

function getPing(interaction) {
  const { client } = interaction;
  interaction.reply(
    `🏓 Message Latency is ${Date.now() - interaction.createdTimestamp}ms.\n🏓 Websocket Latency is ${Math.round(
      client.ws.ping,
    )}ms`,
  );
}
