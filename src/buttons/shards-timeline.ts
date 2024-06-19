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
  async execute(interaction, t, client) {
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
        description: `**${moment().tz(client.timezone).startOf("day").isSame(date.startOf("day")) ? t("shards-embed.TODAY") : date.format("Do MMMM YYYY")}**`,
        color: parseInt("00ff00", 16),
        footer: {
          text: `${t("buttons.SHARD_TIMELINE.MUSIC_CREDIT", { CREDIT: `Christian (${Christian.username})` })} | Page ${page + 1} of ${total + 1}`,
          icon_url: Christian.displayAvatarURL(),
        },
        fields: [
          {
            name: t("buttons.SHARD_TIMELINE.COLOR.LABEL"),
            value: t("buttons.SHARD_TIMELINE.COLOR.VALUE", { TIME: time(data.earlySky.unix(), "T") }),
          },
          {
            name: t("buttons.SHARD_TIMELINE.GATE.LABEL"),
            value: t("buttons.SHARD_TIMELINE.GATE.VALUE", { TIME: time(data.gateShard.unix(), "t") }),
          },
          {
            name: t("buttons.SHARD_TIMELINE.LANDS.LABEL"),
            value: t("buttons.SHARD_TIMELINE.LANDS.VALUE", { TIME: time(data.start.unix(), "T") }),
          },
          {
            name: t("buttons.SHARD_TIMELINE.ENDS.LABEL"),
            value: t("buttons.SHARD_TIMELINE.ENDS.VALUE", { TIME: time(data.end.unix(), "t") }),
          },
          {
            name: t("buttons.SHARD_TIMELINE.MUSIC.LABEL"),
            value: t("buttons.SHARD_TIMELINE.MUSIC.VALUE", { MUSIC: `**${data.shardMusic}**` }),
          },
        ],
        author: {
          name: t("buttons.SHARD_TIMELINE.TIMESTAMP_CREDIT", { CREDIT: `Zhii (${Zhii.username})` }),
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

