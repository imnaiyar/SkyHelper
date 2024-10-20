import type { Command } from "#structures";
import {
  AttachmentBuilder,
  GuildMember,
  resolveColor,
  User,
  type APIActionRowComponent,
  type APIButtonComponent,
  type APIEmbed,
  type BaseMessageOptions,
} from "discord.js";
import { handleHangman } from "./sub/hangman.js";
import { LeaderboardCard, type userData } from "skyhelper-utils";
import { SKY_GAME_DATA } from "#bot/commands/commands-data/fun-commands";
export default {
  ...SKY_GAME_DATA,
  async interactionRun(interaction, _t, client) {
    const sub = interaction.options.getSubcommand(true);
    switch (sub) {
      case "hangman":
        await handleHangman(interaction, _t);
        return;
      case "leaderboard":
        {
          const type = interaction.options.getString("leaderboard-type") || "global";
          if (type === "server" && !interaction.inCachedGuild()) {
            return void (await interaction.reply({
              content: "Run this command in a server when `type` is set to `Server`",
              ephemeral: true,
            }));
          }
          await interaction.deferReply();
          const gMembers = type === "server" ? await interaction.guild?.members.fetch() : undefined;
          const data = await client.database.getGamesLeaderboard(
            "hangman",
            gMembers?.map((m) => m),
          );
          let btnType: "singleMode" | "doubleMode" = "doubleMode";
          const getCardResponse = async (): Promise<BaseMessageOptions> => {
            const players = await Promise.all(
              data[btnType].map(async (d, i): Promise<userData> => {
                const member: GuildMember | User =
                  type === "server" ? gMembers!.get(d.id)! : await client.users.fetch(d.id, { force: true });
                return {
                  tag: member instanceof GuildMember ? member.user.username : member.username,
                  games: d.gamesPlayed!,
                  score: d.gamesWon!,
                  top: i + 1,
                  avatar: member.displayAvatarURL(),
                };
              }),
            );
            const card = players.length && (await new LeaderboardCard({ usersData: players }).build());
            const embed: APIEmbed = {
              title: "Hangman Leaderboard - " + (type === "server" ? `\`Server (${interaction.guild?.name})\`` : "`Global`"),
              description:
                `**Top 10 players in the hangman game - \`${btnType === "singleMode" ? "Single Mode" : "Double Mode"}\`**\n\n` +
                (card ? "" : "Oops! Looks like no data is available for this type. Start playing to get on the leaderboard!"),
              ...(card ? { image: { url: "attachment://leaderboard.png" } } : {}),
              color: resolveColor("DarkAqua"),
            };
            const btns: APIActionRowComponent<APIButtonComponent> = {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 1,
                  custom_id: "leaderboard_hangman_singleMode",
                  label: "Single Mode",
                  disabled: btnType === "singleMode",
                },
                {
                  type: 2,
                  style: 1,
                  custom_id: "leaderboard_hangman_doubleMode",
                  label: "Double Mode",
                  disabled: btnType === "doubleMode",
                },
              ],
            };
            const attach = card && new AttachmentBuilder(card, { name: "leaderboard.png" });
            return { embeds: [embed], files: attach ? [attach] : [], components: [btns] };
          };
          const msg = await interaction.editReply(await getCardResponse());
          const col = msg.createMessageComponentCollector({ idle: 6e4, filter: (i) => i.user.id === interaction.user.id });
          col.on("collect", async (int) => {
            btnType = int.customId.split("_").last() as "singleMode" | "doubleMode";
            await int.deferUpdate();
            await int.editReply(await getCardResponse());
          });
        }
        return;
    }
  },
} satisfies Command;
