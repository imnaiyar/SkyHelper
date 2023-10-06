const { EmbedBuilder } = require('discord.js');
module.exports = {
  data: {
    name: 'credits',
    description: 'Credits to all the people whose work is included in the bot',
  },
  async execute(message) {
    const { client } = message;
    await message.channel.sendTyping();
    const Art = await client.users.fetch('504605855539265537');

    const Zhii = await client.users.fetch('650487047160725508');

    const Gale = await client.users.fetch('473761854175576075');

    const Clement = await client.users.fetch('693802004018888714');

    const Christian = await client.users.fetch('594485678625128466');

    const Xander = await client.users.fetch('693767559123697806');

    const Zed = await client.users.fetch('628048706129756171');

    const Hucker = await client.users.fetch('348060059911323659');

    const Kion = await client.users.fetch('706088667801976843');

    const Stoat = await client.users.fetch('221369442511093760');

    const LN = await client.users.fetch('695034514614779955');

    const Mimi = await client.users.fetch('628644574079746048');

    const Sam = await client.users.fetch('611368649114255380');

    const Plutoy = await client.users.fetch('702740689846272002');
    const userAvatar = message.author.displayAvatarURL({
      format: 'png',
      dynamic: true,
    });
    const userNickname = message.member?.nickname || message.author.username;
    const botUser = await client.users.fetch(client.user.id);
    const botAvatar = botUser.displayAvatarURL({
      format: 'png',
      dynamic: true,
    });

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
        value: `● Zhii (${Zhii.username})\n● Christian (${Christian.username})\n● Hucker (${Hucker.username})\n● Plutoy (${Plutoy.username})\n● Kion (${Kion.username})\n● LN (${LN.username})\n● Gale (${Gale.username})\n● Stoat (${Stoat.username})`,
        inline: true,
      })
      .addFields({
        name: '**__Sky Infographics and Guides__**',
        value: `● Clement (${Clement.username})\n● Mimi (${Mimi.username})\n● Sam (${Sam.username})\n● Zed (${Zed.username})\n● Art (${Art.username})\n**and all others who do the awesome job of creating guides.**`,
        inline: true,
      })
      .addFields({
        name: '**__Special Mentions__**',
        value: `● Big thanks to Xander (${Xander.username}) and Christian (${Christian.username}) for testing the early version of this bot.\n● Thanks to Plutoy (${Plutoy.username}) for creating the [Sky Shards website](https://sky-shards.pages.dev/), which was the initial inspiration for the bot.\n● Emotes icon, traveling spirits descriptions and some aspects of guides have been taken from [Sky Wiki](https://sky-children-of-the-light.fandom.com/wiki/Sky:_Children_of_the_Light_Wiki).`,
        inline: false,
      });

    message.reply({ embeds: [result] });
  },
};
