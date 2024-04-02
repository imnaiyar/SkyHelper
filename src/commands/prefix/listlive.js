const mongoose = require("mongoose");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");

module.exports = {
  data: {
    name: "listlive",
    description: "list all active live shards/skytimes",
    aliases: ["ll", "live"],
    category: "OWNER",
    args: {
      required: true,
      args: ["shards", "times"],
    },
  },
  async execute(msg, args) {
    let model;
    let type;
    if (args[0] === "shards") {
      model = mongoose.model("autoShard");
      type = "Shards";
    } else if (args[0] === "times") {
      model = mongoose.model("autoTimes");
      type = "SkyTimes";
    }
    let actives = [];

    try {
      const data = await model.find();
      if (data.length === 0) {
        return await msg.reply(`No active live ${type}`);
      }

      for (const g of data) {
        const guild = msg.client.guilds.cache.get(g._id);

        if (!guild || !guild.name) continue;

        const owner = await msg.client.users.fetch(guild.ownerId);
        if (!g.webhook?.id) continue;
        const wb = await msg.client.fetchWebhook(g.webhook.id, g.webhook.token).catch(() => {});
        if (!wb) continue;

        actives.push(
          `**Guild:** ${guild?.name || "Unknown"} (${guild?.id || "Unknown"})\n**Owner:** ${
            owner?.username || "Unknown"
          } (${owner?.id || "Unknown"})\n**Channel:** ${wb.channel?.name} (${
            wb.channelId
          })\n**Webhook URL**: [Webhook](${wb.url})\n\n`,
        );
      }

      if (!actives.length) actives.push("No active live updates");
      let page = 0;
      const total = actives.length;
      const totalPages = Math.ceil(total / 5);

      const getResponse = () => {
        const start = page * 5;
        const end = start + 5;
        const description = actives.slice(start, end).join("\n\n");
        const embed = new EmbedBuilder()
          .setTitle(`Guilds with active Live ${type}`)
          .setDescription(description)
          .setFooter({
            text: `Page ${page + 1} of ${totalPages}`,
          });
        const btns = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("live-prev")
            .setEmoji("⬅️")
            .setStyle("2")
            .setDisabled(page === 0),
          new ButtonBuilder()
            .setCustomId("live-next")
            .setEmoji("➡️")
            .setStyle("2")
            .setDisabled(page === totalPages - 1),
        );

        return { embeds: [embed], components: [btns] };
      };
      const reply = await msg.reply(getResponse());
      if (totalPages === 1) return;
      const collect = reply.createMessageComponentCollector({
        idle: 60000,
        filter: (i) => i.user.id === msg.author.id,
      });

      collect.on("collect", async (int) => {
        const Id = int.customId;
        switch (Id) {
          case "live-prev":
            page--;
            await int.update(getResponse());
            break;
          case "live-next": {
            page++;
            await int.update(getResponse());
          }
        }
      });

      collect.on("end", async () => {
        await reply.edit({ components: [] });
      });
    } catch (error) {
      console.error(error);
      msg.reply(`An error occurred while fetching live ${type}.`);
    }
  },
};
