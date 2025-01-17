import { getTranslator } from "#bot/i18n";
import type { Button } from "#structures";
import { type APIEmbed, ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, InteractionCollector } from "discord.js";

export default {
  data: {
    name: "shards-about",
  },
  async execute(interaction, t, client) {
    const reply = await interaction.deferReply({ ephemeral: true, fetchReply: true });
    const Art = await client.users.fetch("504605855539265537");
    let page = 0;
    const datas = shards_about(t);
    const total = datas.length - 1;
    const getResponse = () => {
      const data = datas[page];
      const shardEmbed: APIEmbed = {
        title: data.description,
        color: parseInt("00ff00", 16),
        footer: {
          text: `Page ${page + 1} of ${total + 1} | Sky Shards Information`,
          icon_url: "https://cdn.discordapp.com/attachments/888067672028377108/1125069603664560308/PngItem_4734983.png",
        },
        author: {
          name: t("buttons:ABOUT_SHARDS.CREDIT", { CREDIT: `Art (${Art.username})` }),
          icon_url: Art.displayAvatarURL(),
        },
        image: {
          url: data.image,
        },
      };

      const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setEmoji("<:left:1207594669882613770>")
          .setCustomId("shardAbout-left")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setEmoji("<:right:1207593237544435752>")
          .setCustomId("shardAbout-right")
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
      const msg = await interaction.fetchReply().catch(() => null);
      if (msg) {
        await interaction.deleteReply();
      }
    });
  },
} satisfies Button;

const shards_about = (t: ReturnType<typeof getTranslator>) => [
  {
    description: t("buttons:ABOUT_SHARDS.WHAT_ARE"),
    image:
      "https://media.discordapp.net/attachments/585339436322259003/998518823231688724/I_watch_you_when_u_sleep_20220718171142.png",
  },
  {
    description: t("buttons:ABOUT_SHARDS.TIMING"),
    image:
      "https://media.discordapp.net/attachments/585339436322259003/998518823869231164/I_watch_you_when_u_sleep_20220718171208.png",
  },
  {
    description: t("buttons:ABOUT_SHARDS.REWARDS"),
    image:
      "https://media.discordapp.net/attachments/585339436322259003/998518824443846696/I_watch_you_when_u_sleep_20220718171215.png",
  },
];
