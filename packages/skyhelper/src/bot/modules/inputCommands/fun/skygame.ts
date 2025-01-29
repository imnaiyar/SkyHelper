import type { Command } from "@/structures";
import { getCardResponse, handleHangman } from "./sub/hangman.js";
import { SKY_GAME_DATA } from "@/modules/commands-data/fun-commands";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";

export default {
  ...SKY_GAME_DATA,
  async interactionRun({ interaction, t, helper, options }) {
    const { client } = helper;
    const sub = options.getSubcommand(true);
    switch (sub) {
      case "hangman":
        await handleHangman(helper, t, options);
        return;
      case "leaderboard":
        {
          const guild = client.guilds.get(interaction.guild_id || "");
          const type = options.getString("leaderboard-type") || "global";
          if (type === "server" && !guild) {
            return void (await helper.reply({
              content: "Run this command in a server when `type` is set to `Server`",
              flags: 64,
            }));
          }
          await helper.defer();
          const gMembers =
            type === "server" ? await client.requestGuildMembers({ guild_id: guild!.id, limit: 0, query: "" }) : undefined;
          const data = await client.schemas.getGamesLeaderboard(
            "hangman",
            gMembers?.members.map((m) => m),
          );
          let btnType: "singleMode" | "doubleMode" = "doubleMode";
          const getCard = () => getCardResponse(helper, data, btnType, gMembers!, guild!, type);
          const msg = await helper.editReply(await getCard());
          const col = client.componentCollector({
            idle: 6e4,
            filter: (i) => (i.member?.user || i.user)!.id === helper.user.id,
            message: msg,
          });
          col.on("collect", async (int) => {
            btnType = client.utils.parseCustomId(int.data.custom_id).type as "singleMode" | "doubleMode";
            const compHelper = new InteractionHelper(int, client);
            await compHelper.deferUpdate();
            await compHelper.editReply(await getCard());
          });
        }
        return;
    }
  },
} satisfies Command;
