import { Hangman } from "#bot/libs/classes/Hangman";
import type { getTranslator } from "#bot/i18n";

import {
  ChatInputCommandInteraction,
  User,
  MessageComponentInteraction,
  type BaseMessageOptions,
  type APIEmbed,
  ActionRowBuilder,
  UserSelectMenuBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { parsePerms, type Permission } from "skyhelper-utils";
const BASE =
  "**Here are some things that you can keep in mind during the game!**\n- You will have 30 seconds to answer in each round. Every attempt (or lack of within the specified time) will count as a wrong answer.\n- If you think you know the full word, you can type it so (like `Ascended Candles`).\n- The game initiator can stop the game anytime by typing `>stopgame` in the channel. Only finished games will count towards the leaderboard.";
const constants = {
  ["single"]: `${BASE}\n- Each wrong answer will cost lives. The embed will show how many live you have left. You'll loose if you fail to guess the word correctly before your lives runs out.`,
  ["double"]: `${BASE}\n- Each player will answer in turn, randomly picking for the first round, the player who guesses correctly will stay in the round until they guess incorrectly (or fail to do so within time), the round will pass to next person. Whoever guesses the word first wins.`,
};

export const handleHangman = async (interaction: ChatInputCommandInteraction, t: ReturnType<typeof getTranslator>) => {
  const { client } = interaction;
  const mode = interaction.options.getString("mode", true);
  if (
    !interaction.channel ||
    !interaction.channel.isSendable() ||
    Object.keys(interaction.authorizingIntegrationOwners).every((k) => k === "1") // Also don't run for only user Apps
  ) {
    return void (await interaction.reply({
      content: t("hangman.NOT_PLAYABLE"),
      ephemeral: true,
    }));
  }
  const botPermsInChannel = interaction.inCachedGuild() ? interaction.channel.permissionsFor(client.user) : undefined;
  if (interaction.inCachedGuild() && !botPermsInChannel?.has(["SendMessages", "ViewChannel"])) {
    return void (await interaction.reply({
      content: t("common.errors.NO_PERMS_BOT", {
        PERMISSIONS: parsePerms(botPermsInChannel!.missing(["SendMessages", "ViewChannel"]) as Permission[]),
      }),
      ephemeral: true,
    }));
  }
  if (client.gameData.has(interaction.channel.id)) {
    return void (await interaction.reply({
      content: t("hangman.GAME_ACTIVE"),
      ephemeral: true,
    }));
  }
  let word: string | null = null;
  let type: string = "random";
  const maxLives: number = 6;
  let players: User[] = [interaction.user];

  const validateAndReply = async (int: MessageComponentInteraction, message: string, ephemeral = true) => {
    await int.update(getResponse());
    return await int.followUp({ content: message, ephemeral });
  };

  const getCompletedStatus = (completed: boolean) => (completed ? "✅" : "❌");
  let description = `**Selected Mode:** ${mode === "single" ? "Single Player" : "Double Player"}\n`;
  description += `**Word Type:** ${type === "custom" ? "Custom" : "Random"}\n`;
  description += `${mode === "single" ? `**Max Lives:** ${maxLives}\n` : ""}`;
  if (mode === "double") {
    description += `**Players:** ${players.map((p) => p.toString()).join(", ")}\n`;
    description += `**Provide the following information:**\n`;
    description += `${mode === "double" ? `- ${getCompletedStatus(players.length === 2)} Mention the player you want to play with using the select menu below. (Min. 2 Players)\n` : ""}`;
    description += `${type === "custom" ? `- ${getCompletedStatus(!!word)} Provide a custom word.\n` : ""}`;
  }
  description += `${constants[mode as "single" | "double"]}\n- The Skygame feature is in BETA, there might be some icks and bug that may occur, send us your thoughts/feedback/suggestion via <#1249436564652687475>`;

  const getResponse = (): BaseMessageOptions => {
    const embed: APIEmbed = {
      title: "Skygame: Hangman",
      description,
      color: 0x00ff00,
    };

    return {
      embeds: [embed],
      components: createComponents(),
    };
  };

  const createComponents = () => {
    const components = [];
    if (mode === "double") {
      components.push(
        new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
          new UserSelectMenuBuilder()
            .setCustomId("skygame_hangman_user")
            .setPlaceholder("Select players")
            .setDefaultUsers(players.map((p) => p.id))
            .setMaxValues(2)
            .setMinValues(2),
        ),
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("skygame_hangman_type")
            .setPlaceholder("Select word type")
            .addOptions([
              { label: "Random", description: "Bot selects random words", value: "random", default: type === "random" },
              { label: "Custom", description: "Provide your own word", value: "custom", default: type === "custom" },
            ]),
        ),
      );
    }

    components.push(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        ...(mode === "double" && type === "custom"
          ? [new ButtonBuilder().setCustomId("skygame_hangman_word").setLabel("Provide Word").setStyle(ButtonStyle.Primary)]
          : []),
        new ButtonBuilder()
          .setCustomId("skygame_hangman_start")
          .setLabel("Start Game")
          .setDisabled((type === "custom" && !word) || (mode === "double" && players.length !== 2))
          .setStyle(ButtonStyle.Success),
      ),
    );

    return components;
  };

  const msg = await interaction.reply({ ...getResponse(), fetchReply: true });

  const col = msg.createMessageComponentCollector({ idle: 90_000, filter: (i) => i.user.id === interaction.user.id });
  col.on("collect", async (i) => {
    const action = i.customId.split("_").last();

    if (i.isStringSelectMenu()) {
      const value = i.values[0];
      if (action === "type") {
        if (value === "custom" && players.some((p) => p.id === i.user.id)) {
          return validateAndReply(
            i,
            "You can't change the word type to 'custom' when you are one of the player, either choose someone else, or continue",
          );
        }
        type = value;
        if (value === "random") word = null;
        return await i.update({ ...getResponse() });
      }
    }

    if (i.isUserSelectMenu()) {
      if (type === "custom" && i.users.has(i.user.id)) {
        return validateAndReply(i, "You can't play with yourself when providing a custom word.");
      }
      players = [...i.users.values()];
      return await i.update({ ...getResponse() });
    }

    if (i.isButton()) {
      if (action === "word") {
        if (mode === "single") {
          return validateAndReply(i, "Custom words are not allowed in single mode.");
        }
        const modal = new ModalBuilder().setCustomId("skygame_hangman_word_modal").setTitle("Provide a Word");
        modal.addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("skygame_hangman_word_input")
              .setLabel("Word")
              .setRequired(true)
              .setStyle(TextInputStyle.Short),
          ),
        );
        await i.showModal(modal);

        const modalSubmit = await i.awaitModalSubmit({ time: 60_000 }).catch(() => null);
        if (modalSubmit) {
          word = modalSubmit.fields.getTextInputValue("skygame_hangman_word_input");
          if (!modalSubmit.isFromMessage()) return;
          await modalSubmit.update({ ...getResponse() });
        }
      } else if (action === "start") {
        col.stop();
        if (!interaction.channel?.isSendable()) return;
        const game = new Hangman(interaction.channel, {
          mode: mode as "single" | "double",
          type: type as "custom" | "random",
          players,
          ...(word ? { word } : {}),
          ...(mode === "single" ? { totalLives: maxLives } : {}),
          gameInitiator: interaction.user,
        });
        await i.update({ components: [] });

        client.gameData.set(interaction.channel.id, game);

        await game.inititalize();
      }
    }
  });
};
