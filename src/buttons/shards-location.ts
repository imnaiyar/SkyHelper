import { shardsInfo } from "#libs/constants/index";
import type { Button } from "#structures";
import { type APIEmbed, ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, InteractionCollector } from "discord.js";
import moment from "moment-timezone";
import { ShardsUtil as utils } from "skyhelper-utils";

export default {
  data: {
    name: "shards-location",
  },
  async execute(interaction, client) {
    const reply = await interaction.deferReply({ ephemeral: true, fetchReply: true });
    const Gale = await client.users.fetch("473761854175576075");
    const Clement = await client.users.fetch("693802004018888714");
    const shardDate = interaction.customId.split("_")[1];
    const date = utils.getDate(shardDate) as moment.Moment;
    const { currentShard, currentRealm } = utils.shardsIndex(date);
    let page = 0;

    const datas = shardsInfo[currentRealm][currentShard].locations;
    const total = datas.length - 1;
    const getResponse = () => {
      const data = datas[page];
      const authorName =
        page === 0 ? `Shard location by Clement  (${Clement.username})` : `Shard data by Gale (${Gale.username})`;
      const authorIcon = page === 0 ? Clement.displayAvatarURL() : Gale.displayAvatarURL();
      const shardEmbed: APIEmbed = {
        title: data.description,
        description: `${moment().tz(client.timezone).startOf("day").isSame(date.startOf("day")) ? "Today" : date.format("Do MMMM YYYY")}`,
        color: parseInt("00ff00", 16),
        footer: {
          text: `Page ${page + 1} of ${total + 1} | Sky Shards Information`,
          icon_url: client.user.displayAvatarURL(),
        },
        author: {
          name: authorName,
          icon_url: authorIcon,
        },
        image: {
          url: data.image,
        },
      };

      const shardBtns = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel("Location")
          .setCustomId("shardLocation-left")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setLabel("Data")
          .setCustomId("shardLocation-right")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === total),
      );

      return { embeds: [shardEmbed], components: [shardBtns] };
    };
    await interaction.editReply({ ...getResponse() });
    const collector = reply.createMessageComponentCollector({
      idle: 2 * 60 * 1000,
    }) as InteractionCollector<ButtonInteraction>;

    collector.on("collect", async (int) => {
      const Id = int.customId;
      switch (Id) {
        case "shardLocation-left":
          page--;
          await int.update(getResponse());
          break;
        case "shardLocation-right":
          page++;
          await int.update(getResponse());
          break;
      }
    });

    collector.on("end", async () => {
      const msg = await interaction.fetchReply().catch(() => null);
      if (msg) {
        await interaction.deleteReply();
      }
    });
  },
} satisfies Button;
