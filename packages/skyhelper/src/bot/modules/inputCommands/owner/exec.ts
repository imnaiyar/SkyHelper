import { exec } from "child_process";
import util from "node:util";
import type { Command, SkyHelper } from "@/structures";
import { EXEC_DATA } from "@/modules/commands-data/owner-commands";
import { ComponentType, type APIEmbed, type GatewayMessageCreateDispatchData } from "@discordjs/core";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import { CustomId } from "@/utils/customId-store";
export default {
  ...EXEC_DATA,
  async messageRun({ message, args, client }) {
    await client.api.channels.createMessage(message.channel_id, {
      embeds: [
        {
          title: "Spawning Shell...",
          description: "Executing command...",
          author: {
            name: client.user.global_name!,
            icon_url: client.utils.getUserAvatar(client.user),
          },
        },
      ],
    });
    const script = args.join(" ");
    await run(script, message, client);
  },
} satisfies Command;

async function run(script: string, message: GatewayMessageCreateDispatchData, client: SkyHelper) {
  try {
    const { stdout } = await util.promisify(exec)(script, {
      maxBuffer: 10 * 1024 * 1024,
    }); // Set maxBuffer to 10 MB

    const total = stdout.length;
    let currentPage = 1;
    const totalWords = 1000;
    const totalPages = Math.ceil(total / totalWords);

    const getResponse = () => {
      const start = (currentPage - 1) * totalWords;
      const end = start + totalWords < total ? start + totalWords : total;
      const result = stdout.slice(start, end);
      const outputEmbed: APIEmbed = {
        title: "📥 Output",
        description: `\`\`\`bash\n${
          totalPages === 1
            ? result
            : currentPage === 1
              ? `${result}...`
              : currentPage === totalPages
                ? `...${result}`
                : `...${result}...`
        }\n\`\`\``,
        color: Math.floor(Math.random() * 16777215),
        footer: { text: `Page ${currentPage} of ${totalPages}` },
        timestamp: new Date().toISOString(),
      };

      const row = {
        type: 1,
        components: [
          {
            type: 2,
            custom_id: client.utils.store.serialize(CustomId.Default, { data: "prv", user: message.author.id }),
            emoji: { id: "1207594669882613770", name: "left" },
            style: 2,
            disabled: currentPage === 1 || totalPages === 1,
          },
          {
            type: 2,
            custom_id: client.utils.store.serialize(CustomId.Default, { data: "nxt", user: message.author.id }),
            emoji: { id: "1207593237544435752", name: "right" },
            style: 2,
            disabled: currentPage === totalPages || totalPages === 1,
          },
        ],
      };

      return { embeds: [outputEmbed], components: [row] };
    };
    const response = getResponse();
    const msg = await client.api.channels.createMessage(message.channel_id, response);
    if (totalPages === 1) return;

    const collector = client.componentCollector({
      idle: 1 * 60 * 1000,
      filter: (i) => (i.member?.user ?? i.user!).id === message.author.id,
      componentType: ComponentType.Button,
      message: msg,
    });

    collector.on("collect", async (int) => {
      const { id, data } = client.utils.store.deserialize(int.data.custom_id);
      if (id !== CustomId.Default) return;
      const compHelper = new InteractionHelper(int, client);
      switch (data.data) {
        case "nxt":
          currentPage++;
          await compHelper.update(getResponse());
          break;
        case "prv":
          currentPage--;
          await compHelper.update(getResponse());
      }
    });
  } catch (err) {
    const errorEmbed: APIEmbed = {
      title: "☢️ Error",
      description: `\`\`\`bash\n${err}\n\`\`\``,
      color: Math.floor(Math.random() * 16777215),
      timestamp: new Date().toISOString(),
    };
    await client.api.channels.createMessage(message.channel_id, { embeds: [errorEmbed] });
  }
}
