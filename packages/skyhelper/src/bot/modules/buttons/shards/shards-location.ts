import type { Button } from "@/structures";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import type { APIActionRowComponent, APIButtonComponent, APIEmbed } from "@discordjs/core";
import { ShardsUtil as utils, shardsInfo } from "@skyhelperbot/utils";
import { DateTime } from "luxon";

export default {
  data: {
    name: "shards-location",
  },
  async execute(interaction, t, helper) {
    const { client } = helper;
    await helper.defer({ flags: 64 });
    const Gale = await client.api.users.get("473761854175576075");
    const Clement = await client.api.users.get("693802004018888714");
    const shardDate = client.utils.parseCustomId(interaction.data.custom_id).date;
    const date = utils.getDate(shardDate) as DateTime;
    const { currentShard, currentRealm } = utils.shardsIndex(date);
    let page = 0;

    const datas = shardsInfo[currentRealm][currentShard].locations;
    const total = datas.length - 1;
    const getResponse = () => {
      const data = datas[page];
      const authorName =
        page === 0
          ? t("buttons:SHARD_LOCATION.L_CREDIT", { CREDIT: `Clement (${Clement.username})` })
          : t("buttons:SHARD_LOCATION.D_CREDIT", { CREDIT: `Gale (${Gale.username})` });
      const authorIcon = page === 0 ? client.utils.getUserAvatar(Clement) : client.utils.getUserAvatar(Gale);
      const shardEmbed: APIEmbed = {
        title: data.description,
        description: `${DateTime.now().setZone(client.timezone).startOf("day").hasSame(date.startOf("day"), "day") ? t("features:shards-embed.TODAY") : date.toFormat("dd LLLL yyyy")}`,
        color: parseInt("00ff00", 16),
        footer: {
          text: `Page ${page + 1} of ${total + 1} | Sky Shards Information`,
          icon_url: client.utils.getUserAvatar(client.user),
        },
        author: {
          name: authorName,
          icon_url: authorIcon,
        },
        image: {
          url: data.image,
        },
      };

      const shardBtns: APIActionRowComponent<APIButtonComponent> = {
        type: 1,
        components: [
          {
            type: 2,
            label: t("buttons:SHARD_LOCATION.LOCATION"),
            custom_id: "shardLocation-left",
            style: 1,
            disabled: page === 0,
          },
          {
            type: 2,
            label: t("buttons:SHARD_LOCATION.DATA"),
            custom_id: "shardLocation-right",
            style: 1,
            disabled: page === total,
          },
        ],
      };

      return { embeds: [shardEmbed], components: [shardBtns] };
    };
    const message = await helper.editReply({ ...getResponse() });
    const collector = client.componentCollector({
      idle: 2 * 60 * 1000,
      message,
    });

    collector.on("collect", async (int) => {
      const Id = client.utils.parseCustomId(int.data.custom_id).id;
      const compHelper = new InteractionHelper(int, client);
      switch (Id) {
        case "shardLocation-left":
          page--;
          await compHelper.update(getResponse());
          break;
        case "shardLocation-right":
          page++;
          await compHelper.update(getResponse());
          break;
      }
    });

    collector.on("end", async () => {
      helper.deleteReply().catch(() => null);
    });
  },
} satisfies Button;
