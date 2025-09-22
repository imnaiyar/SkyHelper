import type { Command } from "@/structures";
import { getCardResponse, handleHangman } from "./sub/hangman.js";
import { SKY_GAME_DATA } from "@/modules/commands-data/fun-commands";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import { handleSingleMode, handleDoubleMode } from "./sub/scramble.js";
import { SendableChannels } from "@skyhelperbot/constants";
import type { InteractionOptionResolver } from "@sapphire/discord-utilities";
import type { APITextChannel } from "@discordjs/core";
import { type Permission, parsePerms } from "@skyhelperbot/utils";
import { PermissionsUtil } from "@/utils/classes/PermissionUtils";
export default {
  ...SKY_GAME_DATA,
  async interactionRun({ interaction, helper, options }) {
    const { client } = helper;
    const sub = options.getSubcommand(true);
    if (sub !== "leaderboard") {
      const check = await skygamePrecheck(helper, options);

      if (!check) return;
    }
    switch (sub) {
      case "hangman":
        await handleHangman(helper, options);
        return;
      case "scrambled": {
        await helper.defer();
        const mode = options.getString("mode", true);
        if (mode === "single") {
          await handleSingleMode(helper);
          return;
        }

        if (mode === "double") {
          await handleDoubleMode(helper);
          return;
        }
        return;
      }
      case "leaderboard":
        {
          const guild = client.guilds.get(interaction.guild_id ?? "");
          const type = options.getString("leaderboard-type") ?? "global";
          const game = options.getString("game", true) as "hangman" | "scrambled";
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
            game,
            gMembers?.members.map((m) => m),
          );
          let btnType: "singleMode" | "doubleMode" = "doubleMode";
          const getCard = () => getCardResponse(helper, data, btnType, gMembers!, guild!, type, game);
          const msg = await helper.editReply(await getCard());
          const col = client.componentCollector({
            idle: 6e4,
            filter: (i) => (i.member?.user ?? i.user)!.id === helper.user.id,
            message: msg,
          });
          col.on("collect", async (int) => {
            const { id, data: d } = client.utils.store.deserialize(int.data.custom_id);
            if (id !== client.utils.customId.SkyGameLeaderboard) return;
            btnType = d.type as "singleMode" | "doubleMode";
            const compHelper = new InteractionHelper(int, client);
            await compHelper.deferUpdate();
            await compHelper.editReply(await getCard());
          });
        }
        return;
    }
  },
} satisfies Command;

async function skygamePrecheck(helper: InteractionHelper, options: InteractionOptionResolver) {
  const { client, t } = helper;

  const guild = client.guilds.get(helper.int.guild_id ?? "");
  const sub = options.getSubcommand(true);
  const mode = options.getString("mode", true);

  // check if it's double mode and interaction is in guild
  if (mode === "double" && !guild) {
    await helper.reply({
      content: t("features:hangman.DOUBLE_MODE_GUILD"),
      flags: 64,
    });
    return false;
  }

  // check if it's not run as an user app
  const scrambleSingleModePreCheck = mode === "single" && sub === "scrambled";
  if (
    !scrambleSingleModePreCheck &&
    (!helper.int.channel ||
      !SendableChannels.includes(helper.int.channel.type) ||
      Object.keys(helper.int.authorizing_integration_owners).every((k) => k === "1")) // Also don't run for only user Apps
  ) {
    await helper.reply({
      content: t("features:hangman.NOT_PLAYABLE"),
      flags: 64,
    });
    return false;
  }

  // check bot has necessary perms in the channel
  const botPermsInChannel = new PermissionsUtil(helper.int.app_permissions as `${number}`);
  if (!scrambleSingleModePreCheck && guild && !botPermsInChannel.has(["SendMessages", "ViewChannel"])) {
    await helper.reply({
      content: t("errors:NO_PERMS_BOT", {
        PERMISSIONS: parsePerms(botPermsInChannel.missing(["SendMessages", "ViewChannel"]) as Permission[]),
      }),
      flags: 64,
    });
    return false;
  }

  // check if a game is active in the channel
  if (client.gameData.has(helper.int.channel!.id)) {
    await helper.reply({
      content: t("features:hangman.GAME_ACTIVE"),
      flags: 64,
    });
    return false;
  }
  return true;
}
