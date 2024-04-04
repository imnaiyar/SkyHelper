import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ComponentType } from 'discord.js';

const IDLE_TIMEOUT = 60; // in seconds
const MAX_PER_PAGE = 10; // max number of embed fields per page

export default {
  data: {
    name: "listservers",
    description: "lists all/matching servers",
    category: "OWNER",
    aliases: ["ls"],
  },
  async execute(message, args) {
    const { client, channel, author } = message;

    const match = args[0];
    const matched = [];
    if (match) {
      // match by id
      if (client.guilds.cache.has(match)) {
        matched.push(client.guilds.cache.get(match));
      }

      // match by name
      client.guilds.cache
        .filter((g) => g.name.toLowerCase().includes(match.toLowerCase()))
        .forEach((g) => matched.push(g));
    }

    const servers = match ? matched : Array.from(client.guilds.cache.values());
    const total = servers.length;
    const maxPerPage = MAX_PER_PAGE;
    const totalPages = Math.ceil(total / maxPerPage);

    if (totalPages === 0) {
      return channel.send({ content: "No servers found" });
    }

    let currentPage = 1;

    // Buttons Row
    const components = [];
    components.push(
      new ButtonBuilder().setCustomId("prevBtn").setEmoji("⬅️").setStyle(ButtonStyle.Secondary).setDisabled(true),
      new ButtonBuilder()
        .setCustomId("nxtBtn")
        .setEmoji("➡️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(totalPages === 1),
    );
    let buttonsRow = new ActionRowBuilder().addComponents(components);

    // Embed Builder
    const buildEmbed = async () => {
      const start = (currentPage - 1) * maxPerPage;
      const end = start + maxPerPage < total ? start + maxPerPage : total;

      const embed = new EmbedBuilder()
        .setColor("#000000")
        .setAuthor({ name: "List of servers" })
        .setFooter({
          text: `${match ? "Matched" : "Total"} Servers: ${total} • Page ${currentPage} of ${totalPages}`,
        });

      const fields = [];
      for (let i = start; i < end; i++) {
        const server = servers[i];
        const owner = await client.users.fetch(server.ownerId);
        const members = server.memberCount;

        fields.push({
          name: `${server.name} (${members})`,
          value: `- **ID:** ${server.id}\n- **Owner:** ${owner.username} (${server.ownerId})`,
          inline: true,
        });
      }
      embed.addFields(fields);

      const components = [];
      components.push(
        ButtonBuilder.from(buttonsRow.components[0]).setDisabled(currentPage === 1),
        ButtonBuilder.from(buttonsRow.components[1]).setDisabled(currentPage === totalPages),
      );
      buttonsRow = new ActionRowBuilder().addComponents(components);
      return embed;
    };

    // Send Message
    const embed = await buildEmbed();
    const sentMsg = await channel.send({
      embeds: [embed],
      components: [buttonsRow],
      fetchReply: true,
    });

    // Listeners
    const collector = sentMsg.createMessageComponentCollector({
      filter: (response) => response.user.id === author.id && response.message.id === sentMsg.id,
      idle: 2 * IDLE_TIMEOUT * 1000,
      dispose: true,
      componentType: ComponentType.Button,
    });

    collector.on("collect", async (response) => {
      if (!["prevBtn", "nxtBtn"].includes(response.customId)) return;
      await response.deferUpdate();

      switch (response.customId) {
        case "prevBtn":
          if (currentPage > 1) {
            currentPage--;
            const embed = await buildEmbed();
            await sentMsg.edit({ embeds: [embed], components: [buttonsRow] });
          }
          break;

        case "nxtBtn":
          if (currentPage < totalPages) {
            currentPage++;
            const embed = await buildEmbed();
            await sentMsg.edit({ embeds: [embed], components: [buttonsRow] });
          }
          break;
      }
    });

    collector.on("end", async () => {
      await sentMsg.edit({ components: [] });
    });
  },
};
