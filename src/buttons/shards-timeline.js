import { ActionRowBuilder, ButtonBuilder } from 'discord.js';
import shardData from './sub/timelineData.js';
import utils from '@handler/shardsUtil';
import moment from 'moment-timezone';

export default {
  name: "shards-timeline",
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    const Zhii = await client.users.fetch("650487047160725508");
    const Christian = await client.users.fetch("594485678625128466");
    const shardDate = interaction.customId.split("_")[1];
    const date = utils.getDate(shardDate);
    const { currentShard } = utils.shardsIndex(date);
    let page = 0;
    const datas = shardData(date)[currentShard];
    const total = datas.length - 1;
    const getResponse = () => {
      const data = datas[page];
      const shardEmbed = {
        title: data.title,
        description: `${moment().tz(client.timezone).startOf("day").isSame(date.startOf("day")) ? "Today" : date.format("Do MMMM YYYY")}`,
        color: parseInt("00ff00", 16),
        footer: {
          text: `Sky changes and Shard music by Christian(${Christian.username}) | Page ${page + 1} of ${total + 1}`,
          icon_url: Christian.displayAvatarURL(),
        },
        fields: [
          {
            name: "Early Sky Change",
            value: data.earlySky,
          },
          {
            name: "Gate Shard",
            value: data.gateShard,
          },
          {
            name: "Shard Landing",
            value: data.shardLand,
          },
          {
            name: "End of Shard",
            value: data.shardEnd,
          },
          {
            name: "Shard Music",
            value: data.shardMusic,
          },
        ],
        author: {
          name: `Shards Timestamp by Zhii(${Zhii.username})`,
          icon_url: Zhii.displayAvatarURL(),
        },
      };

      const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setEmoji("<:left:1207594669882613770>")
          .setCustomId("shardTimeline-left")
          .setStyle("1")
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setEmoji("<:right:1207593237544435752>")
          .setCustomId("shardTimeline-right")
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
        case "shardTimeline-left":
          page--;
          await int.update(getResponse());
          break;
        case "shardTimeline-right":
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
