import { getTranslator } from "@/i18n";
import type { Button } from "@/structures";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import { ButtonStyle, ComponentType, type APIActionRowComponent, type APIButtonComponent, type APIEmbed } from "@discordjs/core";
export default {
  data: {
    name: "shards-about",
  },
  async execute(interaction, t, helper) {
    await helper.defer({ flags: 64 });
    const Art = await helper.client.api.users.get("504605855539265537");
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
          icon_url: helper.client.utils.getUserAvatar(Art),
        },
        image: {
          url: data.image,
        },
      };

      const actionRow: APIActionRowComponent<APIButtonComponent> = {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            emoji: { id: "1207594669882613770", name: "left" },
            custom_id: "shardAbout-left",
            style: ButtonStyle.Primary,
            disabled: page === 0,
          },
          {
            type: ComponentType.Button,
            emoji: { id: "1207593237544435752", name: "right" },
            custom_id: "shardAbout-right",
            style: ButtonStyle.Primary,
            disabled: page === total,
          },
        ],
      };

      return {
        embeds: [shardEmbed],
        components: [actionRow],
      };
    };

    const message = await helper.editReply({ ...getResponse() });
    const collector = helper.client.componentCollector({
      idle: 2 * 60 * 1000,
      message,
    });

    collector.on("collect", async (int) => {
      const Id = helper.client.utils.parseCustomId(int.data.custom_id).id;
      const compHelper = new InteractionHelper(int, helper.client);
      switch (Id) {
        case "shardAbout-left":
          page--;
          await compHelper.update(getResponse());
          break;
        case "shardAbout-right":
          page++;
          await compHelper.update(getResponse());
          break;
      }
    });

    collector.on("end", async () => {
      helper.deleteReply().catch(() => {});
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
