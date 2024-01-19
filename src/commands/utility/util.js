const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { getChangelog, getSuggestion } = require('./sub/util');
const userCache = new Map();
module.exports = {
  data: {
    name: 'util',
    description: 'utility commands',
    options: [
      {
        name: 'credits',
        description: 'to works included in this bot',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'changelog',
        description: "bot's changelog",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'suggestions',
        description: 'suggest a feature or a change',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'ping',
        description: "get the bot's ping",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub === 'credits') {
      getCredits(interaction);
    } else if (sub === 'suggestions') {
      getSuggestion(interaction);
    } else if (sub === 'changelog') {
      getChangelog(interaction);
    } else if (sub === 'ping') {
      getPing(interaction);
    }
  },
};

async function getCredits(interaction) {
  const { client } = interaction;
  await interaction.deferReply();
  if (!userCache.size) {
  const getUser = async (name, id) => {
    const user = await client.users.fetch(id);
    userCache.set(name, user);
  };
  await getUser("Art", "504605855539265537");
  await getUser("Zhii", "650487047160725508");
  await getUser("Gale", "473761854175576075");
  await getUser("Clement", "693802004018888714");
  await getUser("Christian", "594485678625128466");
  await getUser("Xander", "693767559123697806");
  await getUser("Zed", "628048706129756171");
  await getUser("Hucker", "348060059911323659");
  await getUser("Kion", "706088667801976843");
  await getUser("Stoat", "221369442511093760");
  await getUser("LN", "695034514614779955");
  await getUser("Mimi", "628644574079746048");
  await getUser("Sam", "611368649114255380");
  await getUser("Plutoy", "702740689846272002");
  }

  const Zhii = userCache.get('Zhii');
  const Clement = userCache.get('Clement');
  const Christian = userCache.get('Christian');
  const Gale = userCache.get('Gale');
  const Art = userCache.get('Art');
  const Xander = userCache.get('Xander');

  const Zed = userCache.get('Zed');

  const Hucker = userCache.get('Hucker');
  const Kion = userCache.get('Kion');

  const Stoat = userCache.get('Stoat');

  const LN = userCache.get('LN');

  const Mimi = userCache.get('Mimi');

  const Sam = userCache.get('Sam');

  const Plutoy = userCache.get('Plutoy');
  const userAvatar = interaction.user.displayAvatarURL({
    format: 'png',
    dynamic: true,
  });
  const userNickname =
    interaction.member?.nickname || interaction.user.username;
  const botUser = await client.users.fetch(client.user.id);
  const botAvatar = botUser.displayAvatarURL({
    format: 'png',
    dynamic: true,
  });
  let result;
  result = new EmbedBuilder()
    .setAuthor({
      name: `Requested by ${userNickname}`,
      iconURL: `${userAvatar}`,
    })
    .setDescription(
      `This bot wouldn't be possible without these people and the work they do.`,
    )
    .setTimestamp(Date.now())
    .setColor('#000000')
    .setFooter({ text: 'SkyHelper', iconURL: `${botAvatar}` })
    .addFields({
      name: '**__Shard Pattern Predictions__**',
      value: `- Zhii (${Zhii.username})\n- Christian (${Christian.username})\n- Hucker (${Hucker.username})\n- Plutoy (${Plutoy.username})\n- Kion (${Kion.username})\n- LN (${LN.username})\n- Gale (${Gale.username})\n- Stoat (${Stoat.username})`,
      inline: true,
    })
    .addFields({
      name: '**__Sky Infographics and Guides__**',
      value: `- Clement (${Clement.username})\n- Mimi (${Mimi.username})\n- Sam (${Sam.username})\n- Zed (${Zed.username})\n- Art (${Art.username})\n**and all others who do the awesome job of creating guides.**`,
      inline: true,
    })
    .addFields({
      name: '**__Special Mentions__**',
      value: `- Big thanks to Xander (${Xander.username}) and Christian (${Christian.username}) for testing the early version of this bot.\n- Thanks to Plutoy (${Plutoy.username}) for creating the [Sky Shards website](https://sky-shards.pages.dev/), which was the initial inspiration for the bot.\n- Emotes icon, traveling spirits descriptions and some aspects of guides have been taken from [Sky Wiki](https://sky-children-of-the-light.fandom.com/wiki/Sky:_Children_of_the_Light_Wiki).`,
      inline: false,
    });

  interaction.editReply({ embeds: [result] });
}

function getPing(interaction) {
  const { client } = interaction;
  interaction.reply(
    `🏓 Message Latency is ${
      Date.now() - interaction.createdTimestamp
    }ms.\n🏓 Websocket Latency is ${Math.round(client.ws.ping)}ms`,
  );
}
