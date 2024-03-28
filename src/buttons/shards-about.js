const { ActionRowBuilder, ButtonBuilder } = require("discord.js");

const shardInfo = [
  {
    description: "What are shards?",
    image:
      "https://media.discordapp.net/attachments/585339436322259003/998518823231688724/I_watch_you_when_u_sleep_20220718171142.png",
  },
  {
    description: "How do I know when a shard comes?",
    image:
      "https://media.discordapp.net/attachments/585339436322259003/998518823869231164/I_watch_you_when_u_sleep_20220718171208.png",
  },
  {
    description: "What are the rewards?",
    image:
      "https://media.discordapp.net/attachments/585339436322259003/998518824443846696/I_watch_you_when_u_sleep_20220718171215.png",
  },
];

module.exports = {
  name: "shards-about",

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    const Art = await client.users.fetch("504605855539265537");
    let page = 0;
    let total = shardInfo.length - 1;
    const getResponse = () => {
      const data = shardInfo[page];
      const shardEmbed = {
        title: data.title,
        description: data.description,
        color: parseInt("00ff00", 16),
        footer: {
          text: `Page ${page + 1} of ${total + 1} | Sky Shards Information`,
          icon_url: "https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png",
        },
        author: {
          name: `All about shards by Art(${Art.username})`,
          icon_url: Art.displayAvatarURL(),
        },
        image: {
          url: data.image,
        },
      };

      const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setEmoji("<:left:1207594669882613770>")
          .setCustomId("shardAbout-left")
          .setStyle("1")
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setEmoji("<:right:1207593237544435752>")
          .setCustomId("shardAbout-right")
          .setStyle("1")
          .setDisabled(page === total),
      );

      return {
        embeds: [shardEmbed],
        components: [actionRow],
      };
    };

    const reply = await interaction.editReply({ ...getResponse(), fetchReply: true });
    const collector = reply.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      idle: 2 * 60 * 1000,
    });

    collector.on("collect", async (int) => {
      const Id = int.customId;
      switch (Id) {
        case "shardAbout-left":
          page--;
          await int.update(getResponse());
          break;
        case "shardAbout-right":
          page++;
          await int.update(getResponse());
          break;
      }
    });

    collector.on("end", async () => {
      const msg = await interaction.fetchReply().catch(() => {});
      if (msg) {
        await interaction.deleteReply();
      }
    });
  },
};
