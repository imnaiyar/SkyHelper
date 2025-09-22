import { defineButton } from "@/structures";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import { CustomId } from "@/utils/customId-store";
import type { APIActionRowComponent, APIButtonComponent, APIEmbed } from "@discordjs/core";
import { ShardsUtil as utils, shardsTimeline } from "@skyhelperbot/utils";
import { DateTime } from "luxon";
export default defineButton({
  data: {
    name: "shards-timeline",
  },
  id: CustomId.ShardsTimeline,
  async execute(_interaction, t, helper, { date: shardDate }) {
    const { client } = helper;
    await helper.defer({ flags: 64 });
    const Zhii = await client.api.users.get("650487047160725508");
    const Christian = await client.api.users.get("594485678625128466");
    const date = utils.getDate(shardDate) as DateTime;
    const { currentShard } = utils.shardsIndex(date);
    let page = 0;
    const datas = shardsTimeline(date)[currentShard];
    const total = datas.length - 1;
    const getResponse = () => {
      const data = datas[page]!;
      const shardEmbed: APIEmbed = {
        title: "__" + (page + 1).toString() + utils.getSuffix(page + 1) + " Shard__",
        description: `**${DateTime.now().setZone(client.timezone).startOf("day").hasSame(date.startOf("day"), "day") ? t("features:shards-embed.TODAY") : date.toFormat("dd LLLL yyyy")}**`,
        color: parseInt("00ff00", 16),
        footer: {
          text: `${t("buttons:SHARD_TIMELINE.MUSIC_CREDIT", { CREDIT: `Christian (${Christian.username})` })} | Page ${page + 1} of ${total + 1}`,
          icon_url: client.utils.getUserAvatar(Christian),
        },
        fields: [
          {
            name: t("buttons:SHARD_TIMELINE.COLOR.LABEL"),
            value: t("buttons:SHARD_TIMELINE.COLOR.VALUE", { TIME: client.utils.time(data.earlySky.toUnixInteger(), "T") }),
          },
          {
            name: t("buttons:SHARD_TIMELINE.GATE.LABEL"),
            value: t("buttons:SHARD_TIMELINE.GATE.VALUE", { TIME: client.utils.time(data.gateShard.toUnixInteger(), "t") }),
          },
          {
            name: t("buttons:SHARD_TIMELINE.LANDS.LABEL"),
            value: t("buttons:SHARD_TIMELINE.LANDS.VALUE", { TIME: client.utils.time(data.start.toUnixInteger(), "T") }),
          },
          {
            name: t("buttons:SHARD_TIMELINE.ENDS.LABEL"),
            value: t("buttons:SHARD_TIMELINE.ENDS.VALUE", { TIME: client.utils.time(data.end.toUnixInteger(), "t") }),
          },
          {
            name: t("buttons:SHARD_TIMELINE.MUSIC.LABEL"),
            value: t("buttons:SHARD_TIMELINE.MUSIC.VALUE", { MUSIC: `**${data.shardMusic}**` }),
          },
        ],
        author: {
          name: t("buttons:SHARD_TIMELINE.TIMESTAMP_CREDIT", { CREDIT: `Zhii (${Zhii.username})` }),
          icon_url: client.utils.getUserAvatar(Zhii),
        },
      };

      const actionRow: APIActionRowComponent<APIButtonComponent> = {
        type: 1,
        components: [
          {
            type: 2,
            emoji: { id: "1207594669882613770", name: "left" },
            custom_id: client.utils.store.serialize(client.utils.customId.ShardsTimelineLeft, { user: helper.user.id }),
            style: 1,
            disabled: page === 0,
          },
          {
            type: 2,
            emoji: { id: "1207593237544435752", name: "right" },
            custom_id: client.utils.store.serialize(client.utils.customId.ShardsTimelineRight, { user: helper.user.id }),
            style: 1,
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
    const collector = client.componentCollector({
      idle: 2 * 60 * 1000,
      message,
    });

    collector.on("collect", async (int) => {
      const Id = client.utils.store.deserialize(int.data.custom_id).id;
      const compoHelper = new InteractionHelper(int, client);
      switch (Id) {
        case client.utils.customId.ShardsTimelineLeft:
          page--;
          await compoHelper.update(getResponse());
          break;
        case client.utils.customId.ShardsTimelineRight:
          page++;
          await compoHelper.update(getResponse());
          break;
      }
    });

    collector.on("end", () => {
      helper.deleteReply().catch(() => {});
    });
  },
});
