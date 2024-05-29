import type { Button } from "#structures";
import {
  type APIEmbed,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  InteractionCollector,
  time,
} from "discord.js";
import moment from "moment-timezone";
import { ShardsUtil as utils } from "skyhelper-utils";
import { shardsTimelines } from "#libs/constants/index";
export default {
  data: {
    name: "shards-timeline",
  },
  async execute(interaction, client) {
    const reply = await interaction.deferReply({ ephemeral: true, fetchReply: true });
    const Zhii = await client.users.fetch("650487047160725508");
    const Christian = await client.users.fetch("594485678625128466");
    const shardDate = interaction.customId.split("_")[1];
    const date = utils.getDate(shardDate) as moment.Moment;
    const { currentShard } = utils.shardsIndex(date);
    let page = 0;
    const datas = shardsTimelines(date)[currentShard];
    const total = datas.length - 1;
    const getResponse = () => {
      const data = datas[page];
      const shardEmbed: APIEmbed = {
        title: "__" + (page + 1).toString() + utils.getSuffix(page + 1) + " Shard__",
        description: `**${moment().tz(client.timezone).startOf("day").isSame(date.startOf("day")) ? "Today" : date.format("Do MMMM YYYY")}**`,
        color: parseInt("00ff00", 16),
        footer: {
          text: `Sky changes and Shard music by Christian(${Christian.username}) | Page ${page + 1} of ${total + 1}`,
          icon_url: Christian.displayAvatarURL(),
        },
        fields: [
          {
            name: "Early Sky Change",
            value: "Sky colour changes at: " + time(data.earlySky.unix(), "T"),
          },
          {
            name: "Gate Shard",
            value: "Shards crystal on gate appears at: " + time(data.gateShard.unix(), "T"),
          },
          {
            name: "Shard Landing",
            value: "Shard lands at: " + time(data.start.unix(), "T"),
          },
          {
            name: "End of Shard",
            value: "Shard ends at: " + time(data.end.unix(), "T"),
          },
          {
            name: "Shard Music",
            value: `***${data.shardMusic}*** music will play during this shard.`,
          },
        ],
        author: {
          name: `Shards Timestamp by Zhii(${Zhii.username})`,
          icon_url: Zhii.displayAvatarURL(),
        },
      };

      const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setEmoji("<:left:1207594669882613770>")
          .setCustomId("shardTimeline-left")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setEmoji("<:right:1207593237544435752>")
          .setCustomId("shardTimeline-right")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === total),
      );

      return {
        embeds: [shardEmbed],
        components: [actionRow],
      };
    };

    await interaction.editReply({ ...getResponse() });
    const collector = reply.createMessageComponentCollector({
      idle: 2 * 60 * 1000,
    }) as InteractionCollector<ButtonInteraction>;

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
} satisfies Button;
