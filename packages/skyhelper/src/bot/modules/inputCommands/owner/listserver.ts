import { LIST_SERVERS_DATA } from "@/modules/commands-data/owner-commands";
import type { Command } from "@/structures";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import {
  ButtonStyle,
  ComponentType,
  type APIActionRowComponent,
  type APIButtonComponent,
  type APIEmbed,
  type APIEmbedField,
} from "@discordjs/core";
export default {
  ...LIST_SERVERS_DATA,
  async messageRun({ message, args, client }) {
    const { channel_id, author } = message;

    const match = args[0];
    const matched = [];
    if (match) {
      // match by id
      if (client.guilds.has(match)) {
        matched.push(client.guilds.get(match));
      }

      // match by name
      client.guilds.filter((g) => g.name.toLowerCase().includes(match.toLowerCase())).forEach((g) => matched.push(g));
    }

    const servers = match ? matched : Array.from(client.guilds.values());
    const total = servers.length;
    const maxPerPage = 8;
    const totalPages = Math.ceil(total / maxPerPage);

    if (totalPages === 0) {
      return void client.api.channels.createMessage(channel_id, { content: "No servers found" });
    }

    let currentPage = 1;

    // Buttons Row
    const components: APIActionRowComponent<APIButtonComponent>[] = [
      {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            custom_id: client.utils.encodeCustomId({ id: "prevBtn", user: author.id }),
            emoji: { name: "⬅️" },
            style: ButtonStyle.Secondary,
            disabled: true,
          },
          {
            type: ComponentType.Button,
            custom_id: client.utils.encodeCustomId({ id: "nxtBtn", user: author.id }),
            emoji: { name: "➡️" },
            style: ButtonStyle.Secondary,
            disabled: totalPages === 1,
          },
        ],
      },
    ];
    let buttonsRow = components[0];

    // Embed Builder
    const buildEmbed = async () => {
      const start = (currentPage - 1) * maxPerPage;
      const end = start + maxPerPage < total ? start + maxPerPage : total;

      const embed: APIEmbed = {
        color: 0x000000,
        author: { name: "List of servers" },
        footer: {
          text: `${match ? "Matched" : "Total"} Servers: ${total} • Page ${currentPage} of ${totalPages}`,
        },
      };

      const fields: APIEmbedField[] = [];
      for (let i = start; i < end; i++) {
        const server = servers[i];
        const owner = server && (await client.api.users.get(server.owner_id));
        const members = server?.member_count;

        fields.push({
          name: `${server?.name} (${members})`,
          value: `- **ID:** ${server?.id}\n- **Owner:** ${owner?.username} (${server?.owner_id})`,
          inline: true,
        });
      }
      embed.fields = fields;

      const comps = [];
      comps.push(
        { ...buttonsRow.components[0], disabled: currentPage === 1 },
        { ...buttonsRow.components[1], disabled: currentPage === totalPages },
      );
      buttonsRow = {
        type: ComponentType.ActionRow,
        components: comps,
      };
      return embed;
    };

    // Send Message
    const embed = await buildEmbed();
    const sentMsg = await client.api.channels.createMessage(channel_id, {
      embeds: [embed],
      components: [buttonsRow],
    });

    // Listeners
    const collector = client.componentCollector({
      filter: (response) => (response.member?.user || response.user)!.id === author.id && response.message.id === sentMsg.id,
      idle: 2 * 60 * 1000,
      componentType: ComponentType.Button,
      message: sentMsg,
    });

    collector.on("collect", async (response) => {
      const id = client.utils.parseCustomId(response.data.custom_id).id;
      if (!["prevBtn", "nxtBtn"].includes(id)) return;
      const compHelper = new InteractionHelper(response, client);
      await compHelper.deferUpdate();

      switch (id) {
        case "prevBtn":
          if (currentPage > 1) {
            currentPage--;
            const emb = await buildEmbed();
            await compHelper.editReply({
              embeds: [emb],
              components: [buttonsRow],
            });
          }
          break;

        case "nxtBtn":
          if (currentPage < totalPages) {
            currentPage++;
            const emb = await buildEmbed();
            await compHelper.editReply({
              embeds: [emb],
              components: [buttonsRow],
            });
          }
          break;
      }
    });

    collector.on("end", async () => {
      await client.api.channels.editMessage(channel_id, sentMsg.id, { components: [] });
    });
  },
} satisfies Command;
