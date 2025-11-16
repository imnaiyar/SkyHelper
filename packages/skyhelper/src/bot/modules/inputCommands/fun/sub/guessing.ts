import { GuessingGame } from "@/utils/classes/GuessingGame";
import { InteractionHelper } from "@/utils/classes/InteractionUtil";
import type { InteractionOptionResolver } from "@sapphire/discord-utilities";
import { ComponentType, MessageFlags } from "@discordjs/core";
import { container, section, textDisplay } from "@skyhelperbot/utils";
import { CustomId, store } from "@/utils/customId-store";

export async function handleGuessing(helper: InteractionHelper, options: InteractionOptionResolver) {
  const { client } = helper;
  const mode = options.getString("mode", true);

  const totalQuestions = 5;

  const getResponse = () => {
    const component = container(
      section(
        {
          type: ComponentType.Button,
          style: 1,
          label: "Start Game",
          custom_id: store.serialize(CustomId.SkyGameStart, { game: "guessing", user: helper.user.id }),
        },
        textDisplay(
          `### 🎮 Sky Guessing Game 🎮`,
          ``,
          `Test your knowledge about Sky: Children of the Light!`,
          ``,
          `**Game Mode:** ${mode === "single" ? "Single Player" : "Multiplayer"}`,
          `**Questions:** ${totalQuestions}`,
          `**Time per question:** 30 seconds`,
          ``,
          `**Question Types:**`,
          `• Which season/event brought an item?`,
          `• Which spirit offers an item?`,
          `• When did a season begin?`,
          `• Has a spirit returned as Traveling Spirit?`,
          `• Has a spirit returned in seasonal visits?`,
          ``,
          `-# Click "Start Game" when you're ready!`,
        ),
      ),
    );

    return { components: [component], flags: MessageFlags.IsComponentsV2 };
  };

  const message = (await helper.reply(getResponse())).resource!.message;

  const col = client.componentCollector({
    idle: 90_000,
    filter: (i) => (i.member?.user ?? i.user)!.id === helper.user.id,
    message,
  });

  col.on("collect", async (i) => {
    const compoHelper = new InteractionHelper(i, client);
    const { id, data } = client.utils.store.deserialize(i.data.custom_id);

    if (id !== CustomId.SkyGameStart) return;

    if (data.game !== "guessing") return;

    await compoHelper.deferUpdate();
    col.stop();

    // Start the game
    const game = new GuessingGame(
      helper.int.channel!,
      {
        mode: mode as "single" | "multi",
        players: [helper.user],
        gameInitiator: helper.user,
        totalQuestions,
      },
      client,
    );

    client.gameData.set(helper.int.channel!.id, game);
    await game.initialize();
  });
}
